import type {
  AdoptionApplication,
  AttentionItemData,
  CommandCenterData,
  CommandCenterFilters,
  DistributionItem,
  InventoryItem,
  MedicalItem,
  RescueCase,
  Severity,
  TimelineItemData,
  TrendPoint,
  VolunteerWorkload,
} from "./types";

export const emptyCommandCenterFilters: CommandCenterFilters = {
  from: "",
  to: "",
  rescueStatus: "all",
  priority: "all",
};

export const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const severityVariant = (severity: Severity) =>
  severity === "critical" ? "destructive" : severity === "warning" ? "warning" : "secondary";

export const workloadState = (activeCases: number) =>
  activeCases >= 8 ? "overloaded" : activeCases >= 5 ? "busy" : "available";

export const inventoryState = (item: InventoryItem) =>
  item.quantity <= 0 ? "out_of_stock" : item.quantity <= item.minimumQuantity ? "low_stock" : "in_stock";

export const isActiveRescueStatus = (status: string) =>
  !["released", "closed", "cancelled"].includes(status);

const safeDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const isWithinDateRange = (value: string | null | undefined, filters: CommandCenterFilters) => {
  const date = safeDate(value);
  if (!date) return !filters.from && !filters.to;
  if (filters.from && date < new Date(`${filters.from}T00:00:00`)) return false;
  if (filters.to && date > new Date(`${filters.to}T23:59:59.999`)) return false;
  return true;
};

export const filterRescueCases = (items: RescueCase[], filters: CommandCenterFilters) =>
  items.filter((item) =>
    isWithinDateRange(item.reportedAt, filters) &&
    (filters.rescueStatus === "all" || item.status === filters.rescueStatus) &&
    (filters.priority === "all" || item.priority === filters.priority),
  );

export const filterMedicalItems = (items: MedicalItem[], filters: CommandCenterFilters) =>
  items.filter((item) =>
    isWithinDateRange(item.record.treatmentDate, filters) &&
    (filters.priority === "all" || item.rescueCase.priority === filters.priority),
  );

export const filterAdoptions = (items: AdoptionApplication[], filters: CommandCenterFilters) =>
  items.filter((item) => isWithinDateRange(item.reviewedAt ?? item.applicationDate, filters));

export const filterInventory = (items: InventoryItem[], filters: CommandCenterFilters) =>
  items.filter((item) => isWithinDateRange(item.updatedAt, filters));

export const filterVolunteers = (items: VolunteerWorkload[], filters: CommandCenterFilters) =>
  items.filter((item) => isWithinDateRange(item.lastAssignedAt, filters));

const countBy = (items: string[]) =>
  [...items.reduce((counts, item) => counts.set(item, (counts.get(item) ?? 0) + 1), new Map<string, number>()).entries()];

const colors = ["hsl(var(--primary))", "#65a30d", "#d97706", "#0f766e", "#7c3aed", "#dc2626", "#64748b"];

export const distribution = (items: string[]): DistributionItem[] =>
  countBy(items)
    .sort(([, first], [, second]) => second - first)
    .map(([name, value], index) => ({ name: titleCase(name), value, color: colors[index % colors.length] }));

const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = (date: Date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);

export const trendFromDates = (dates: Array<string | null | undefined>, days = 7): TrendPoint[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    return { key: dayKey(date), label: dayLabel(date), value: 0 };
  });
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  dates.forEach((value) => {
    const date = safeDate(value);
    const bucket = date ? byKey.get(dayKey(date)) : undefined;
    if (bucket) bucket.value += 1;
  });
  return buckets;
};

const followUpState = (dateValue: string) => {
  const date = safeDate(dateValue);
  if (!date) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + 7);
  return date < today ? "overdue" : date <= limit ? "upcoming" : "";
};

export const buildAttentionItems = (
  rescueCases: RescueCase[],
  medicalItems: MedicalItem[],
  adoptions: AdoptionApplication[],
  volunteers: VolunteerWorkload[],
  inventory: InventoryItem[],
): AttentionItemData[] => {
  const items: AttentionItemData[] = [];
  rescueCases
    .filter((item) => item.priority === "critical" || item.priority === "high")
    .forEach((item) => items.push({
      id: `rescue-${item.id}`,
      severity: item.priority === "critical" ? "critical" : "warning",
      category: "Rescue case",
      title: `${titleCase(item.priority)} priority: ${item.animalName}`,
      detail: `${item.caseNumber} · ${item.species} · ${item.rescueLocation}`,
      href: `/rescue-cases/${item.id}`,
      actionLabel: "Open case",
    }));
  rescueCases
    .filter((item) => isActiveRescueStatus(item.status) && !item.assignedEmployeeId)
    .forEach((item) => items.push({
      id: `unassigned-${item.id}`,
      severity: "warning",
      category: "Assignment",
      title: `Unassigned active rescue: ${item.animalName}`,
      detail: `${item.caseNumber} is ${titleCase(item.status)} and has no assigned responder.`,
      href: `/rescue-cases/${item.id}`,
      actionLabel: "Assign responder",
    }));
  medicalItems
    .filter((item) => item.record.followUpDate && followUpState(item.record.followUpDate))
    .forEach((item) => {
      const state = followUpState(item.record.followUpDate!);
      items.push({
        id: `follow-up-${item.record.id}`,
        severity: state === "overdue" ? "critical" : "warning",
        category: "Medical follow-up",
        title: `${state === "overdue" ? "Overdue" : "Upcoming"}: ${item.rescueCase.animalName}`,
        detail: `${item.record.diagnosis} · follow-up ${state}.`,
        href: `/rescue-cases/${item.rescueCase.id}`,
        actionLabel: "Open medical record",
      });
    });
  volunteers
    .filter((item) => workloadState(item.activeCases) === "overloaded")
    .forEach((item) => items.push({
      id: `workload-${item.id}`,
      severity: "warning",
      category: "Volunteer workload",
      title: `${item.id} is overloaded`,
      detail: `${item.activeCases} active cases, including ${item.highPriorityCases} high-priority cases.`,
      href: "/volunteers",
      actionLabel: "Review workload",
    }));
  inventory
    .filter((item) => inventoryState(item) !== "in_stock")
    .forEach((item) => items.push({
      id: `inventory-${item.id}`,
      severity: inventoryState(item) === "out_of_stock" ? "critical" : "warning",
      category: "Inventory",
      title: `${titleCase(inventoryState(item))}: ${item.name}`,
      detail: `${item.quantity} ${item.unit} available · reorder level ${item.minimumQuantity}.`,
      href: "/inventory",
      actionLabel: "Review stock",
    }));
  adoptions
    .filter((item) => item.status === "pending_review")
    .forEach((item) => items.push({
      id: `adoption-${item.id}`,
      severity: "info",
      category: "Adoption review",
      title: `Pending application: ${item.animalName}`,
      detail: `${item.applicationNumber} · submitted by ${item.applicantName}.`,
      href: "/adoptions",
      actionLabel: "Review application",
    }));

  return items.sort((first, second) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[first.severity] - rank[second.severity];
  });
};

export const buildTimeline = (data: Pick<CommandCenterData, "rescueCases" | "medicalItems" | "adoptionApplications" | "volunteers" | "inventoryItems" | "donationAnalytics">): TimelineItemData[] => {
  const items: TimelineItemData[] = [];
  data.rescueCases.forEach((item) => items.push({
    id: `rescue-${item.id}-${item.reportedAt}`,
    type: "rescue",
    title: `Rescue case reported: ${item.animalName}`,
    detail: `${item.caseNumber} · ${titleCase(item.status)} · ${item.rescueLocation}`,
    occurredAt: item.reportedAt,
    href: `/rescue-cases/${item.id}`,
  }));
  data.rescueCases.forEach((item) => {
    const reportedAt = safeDate(item.reportedAt);
    const updatedAt = safeDate(item.updatedAt);
    if (!updatedAt || !reportedAt || updatedAt.getTime() <= reportedAt.getTime()) return;
    items.push({
      id: `rescue-update-${item.id}-${item.updatedAt}`,
      type: "rescue",
      title: `Rescue case updated: ${item.animalName}`,
      detail: `${item.caseNumber} · current status: ${titleCase(item.status)}`,
      occurredAt: item.updatedAt!,
      href: `/rescue-cases/${item.id}`,
    });
  });
  data.medicalItems.forEach((item) => items.push({
    id: `medical-${item.record.id}-${item.record.treatmentDate}`,
    type: "medical",
    title: `Treatment recorded for ${item.rescueCase.animalName}`,
    detail: `${item.record.diagnosis} · ${titleCase(item.record.medicalStatus)}`,
    occurredAt: item.record.updatedAt ?? item.record.treatmentDate,
    href: `/rescue-cases/${item.rescueCase.id}`,
  }));
  data.adoptionApplications.forEach((item) => {
    const occurredAt = item.reviewedAt ?? item.applicationDate;
    items.push({
      id: `adoption-${item.id}-${occurredAt}`,
      type: "adoption",
      title: `${titleCase(item.status)} adoption application`,
      detail: `${item.animalName} · ${item.applicationNumber}`,
      occurredAt,
      href: "/adoptions",
    });
  });
  data.volunteers.forEach((item) => item.lastAssignedAt && items.push({
    id: `volunteer-${item.id}-${item.lastAssignedAt}`,
    type: "volunteer",
    title: `Volunteer assignment updated: ${item.id}`,
    detail: `${item.activeCases} active cases in the current workload.`,
    occurredAt: item.lastAssignedAt,
    href: "/volunteers",
  }));
  data.inventoryItems.forEach((item) => items.push({
    id: `inventory-${item.id}-${item.updatedAt}`,
    type: "inventory",
    title: `Inventory record updated: ${item.name}`,
    detail: `${item.quantity} ${item.unit} in ${titleCase(inventoryState(item))} state.`,
    occurredAt: item.updatedAt,
    href: "/inventory",
  }));
  data.donationAnalytics.recentDonations.forEach((item) => items.push({
    id: `donation-${item.id}`,
    type: "donation",
    title: `Donation received from ${item.donorName}`,
    detail: `${item.campaignName} · ${titleCase(item.status)}`,
    occurredAt: item.donatedAt,
    href: "/donations",
  }));
  return items
    .filter((item) => safeDate(item.occurredAt))
    .sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())
    .slice(0, 16);
};

export const createCommandCenterView = (data: CommandCenterData, filters: CommandCenterFilters) => {
  const rescueCases = filterRescueCases(data.rescueCases, filters);
  const medicalItems = filterMedicalItems(data.medicalItems, filters);
  const adoptionApplications = filterAdoptions(data.adoptionApplications, filters);
  const inventoryItems = filterInventory(data.inventoryItems, filters);
  const volunteers = filterVolunteers(data.volunteers, filters);
  const activeRescues = rescueCases.filter((item) => isActiveRescueStatus(item.status));
  const criticalCases = rescueCases.filter((item) => item.priority === "critical" || item.priority === "high");
  const underTreatment = medicalItems.filter((item) => item.record.medicalStatus !== "cleared");
  const completedAdoptions = adoptionApplications.filter((item) => item.status === "completed");
  const pendingAdoptions = adoptionApplications.filter((item) => item.status === "pending_review");
  const lowInventory = inventoryItems.filter((item) => inventoryState(item) !== "in_stock");

  const scopedData = { ...data, rescueCases, medicalItems, adoptionApplications, volunteers, inventoryItems };
  return {
    rescueCases,
    medicalItems,
    adoptionApplications,
    inventoryItems,
    volunteers,
    activeRescues,
    criticalCases,
    underTreatment,
    completedAdoptions,
    pendingAdoptions,
    lowInventory,
    attentionItems: buildAttentionItems(rescueCases, medicalItems, adoptionApplications, volunteers, inventoryItems),
    timeline: buildTimeline(scopedData),
    rescueTrend: trendFromDates(rescueCases.map((item) => item.reportedAt)),
    adoptionTrend: trendFromDates(adoptionApplications.map((item) => item.reviewedAt ?? item.applicationDate)),
    rescueStatusDistribution: distribution(rescueCases.map((item) => item.status)),
    medicalDistribution: distribution(medicalItems.map((item) => item.record.medicalStatus)),
    volunteerDistribution: distribution(volunteers.map((item) => workloadState(item.activeCases))),
    inventoryDistribution: distribution(inventoryItems.map(inventoryState)),
    campaignProgress: data.donationAnalytics.campaignProgress,
    donationTrend: data.donationAnalytics.byMonth.map((item) => ({ label: item.month, value: item.amount, secondaryValue: item.donationCount })),
  };
};
