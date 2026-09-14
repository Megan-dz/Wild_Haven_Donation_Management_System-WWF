import type {
  InventoryNotificationRecord,
  Notification,
  NotificationCategory,
  NotificationFilters,
  NotificationPreferences,
  NotificationPriority,
  NotificationSourceData,
} from "./notification-types";

export const defaultNotificationFilters: NotificationFilters = { search: "", category: "all", readState: "all", priority: "all", sort: "newest" };

export const defaultNotificationPreferences: NotificationPreferences = {
  categories: { system: true, rescue: true, medical: true, volunteer: true, adoption: true, inventory: true, donation: true, campaign: true },
  showReadNotifications: true,
};

export const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const categoryLabel = (category: NotificationCategory) => category === "system" ? "System" : titleCase(category);

export const priorityRank = (priority: NotificationPriority) => ({ critical: 0, high: 1, normal: 2, low: 3 })[priority];

export const priorityVariant = (priority: NotificationPriority) => priority === "critical" ? "destructive" : priority === "high" ? "warning" : priority === "normal" ? "secondary" : "outline";

const safeDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const isActiveRescue = (status: string) => !["released", "closed", "cancelled"].includes(status);
const inventoryState = (item: InventoryNotificationRecord) => item.quantity <= 0 ? "out_of_stock" : item.quantity <= item.minimumQuantity ? "low_stock" : "in_stock";
const workloadState = (activeCases: number) => activeCases >= 8 ? "overloaded" : activeCases >= 5 ? "busy" : "available";

const isRecent = (value: string, days = 7) => {
  const date = safeDate(value);
  return Boolean(date && date.getTime() >= Date.now() - days * 86_400_000);
};

const followUpState = (value: string | null) => {
  const date = safeDate(value);
  if (!date) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAhead = new Date(today);
  weekAhead.setDate(today.getDate() + 7);
  return date < today ? "overdue" : date <= weekAhead ? "upcoming" : "";
};

export function deriveNotifications(source: NotificationSourceData): Notification[] {
  const notifications: Notification[] = [];
  source.systemActivity
    .filter((item) => item.type !== "donation")
    .forEach((item) => {
      const isCampaign = item.type === "campaign";
      notifications.push({
        id: `activity-${item.id}`,
        category: isCampaign ? "campaign" : "system",
        priority: isCampaign ? "normal" : "low",
        title: item.title,
        detail: item.detail,
        occurredAt: item.createdAt,
        href: isCampaign ? "/campaigns" : "/",
        actionLabel: isCampaign ? "Open campaigns" : "Open dashboard",
      });
    });
  source.rescueCases.forEach((item) => {
    if ((item.priority === "critical" || item.priority === "high") && isActiveRescue(item.status)) notifications.push({
      id: `rescue-priority-${item.id}`,
      category: "rescue",
      priority: item.priority === "critical" ? "critical" : "high",
      title: `${titleCase(item.priority)} priority rescue: ${item.animalName}`,
      detail: `${item.caseNumber} · ${item.species} · ${item.rescueLocation} · ${titleCase(item.status)}.`,
      occurredAt: item.updatedAt ?? item.reportedAt,
      href: `/rescue-cases/${item.id}`,
      actionLabel: "Open rescue case",
    });
    if (isRecent(item.reportedAt, 3)) notifications.push({
      id: `rescue-reported-${item.id}`,
      category: "rescue",
      priority: "normal",
      title: `New rescue reported: ${item.animalName}`,
      detail: `${item.caseNumber} · ${item.species} reported in ${item.rescueLocation}.`,
      occurredAt: item.reportedAt,
      href: `/rescue-cases/${item.id}`,
      actionLabel: "Review rescue case",
    });
    if (isActiveRescue(item.status) && !item.assignedEmployeeId) notifications.push({
      id: `rescue-unassigned-${item.id}`,
      category: "rescue",
      priority: item.priority === "critical" ? "critical" : "high",
      title: `Responder needed: ${item.animalName}`,
      detail: `${item.caseNumber} is ${titleCase(item.status)} with no assigned responder.`,
      occurredAt: item.updatedAt ?? item.reportedAt,
      href: `/rescue-cases/${item.id}`,
      actionLabel: "Assign responder",
    });
  });
  source.medicalRecords.forEach((item) => {
    const followUp = followUpState(item.record.followUpDate);
    if (followUp) notifications.push({
      id: `medical-followup-${item.record.id}`,
      category: "medical",
      priority: followUp === "overdue" ? "critical" : "high",
      title: `${titleCase(followUp)} medical follow-up: ${item.rescueCase.animalName}`,
      detail: `${item.record.diagnosis} · ${item.rescueCase.caseNumber}.`,
      occurredAt: item.record.followUpDate!,
      href: `/rescue-cases/${item.rescueCase.id}`,
      actionLabel: "Open medical record",
    });
    if (item.record.medicalStatus === "critical") notifications.push({
      id: `medical-critical-${item.record.id}`,
      category: "medical",
      priority: "critical",
      title: `Critical medical status: ${item.rescueCase.animalName}`,
      detail: `${item.record.diagnosis} · rescue ${item.rescueCase.caseNumber}.`,
      occurredAt: item.record.updatedAt ?? item.record.treatmentDate,
      href: `/rescue-cases/${item.rescueCase.id}`,
      actionLabel: "Review treatment",
    });
  });
  source.volunteers
    .filter((item) => workloadState(item.activeCases) === "overloaded" && safeDate(item.lastAssignedAt))
    .forEach((item) => notifications.push({
      id: `volunteer-workload-${item.id}`,
      category: "volunteer",
      priority: item.highPriorityCases ? "high" : "normal",
      title: `Volunteer workload alert: ${item.id}`,
      detail: `${item.activeCases} active cases, including ${item.highPriorityCases} high-priority cases.`,
      occurredAt: item.lastAssignedAt!,
      href: "/volunteers",
      actionLabel: "Review workloads",
    }));
  source.adoptions.filter((item) => item.status === "pending_review").forEach((item) => notifications.push({
    id: `adoption-pending-${item.id}`,
    category: "adoption",
    priority: "normal",
    title: `Adoption application awaiting review: ${item.animalName}`,
    detail: `${item.applicationNumber} submitted by ${item.applicantName}.`,
    occurredAt: item.applicationDate,
    href: "/adoptions",
    actionLabel: "Review application",
  }));
  source.adoptions.filter((item) => item.reviewedAt && isRecent(item.reviewedAt, 7)).forEach((item) => notifications.push({
    id: `adoption-decision-${item.id}-${item.status}`,
    category: "adoption",
    priority: "low",
    title: `Adoption application ${titleCase(item.status)}`,
    detail: `${item.animalName} · ${item.applicationNumber}.`,
    occurredAt: item.reviewedAt!,
    href: "/adoptions",
    actionLabel: "Open adoptions",
  }));
  source.inventory.filter((item) => inventoryState(item) !== "in_stock").forEach((item) => {
    const state = inventoryState(item);
    notifications.push({
      id: `inventory-${state}-${item.id}`,
      category: "inventory",
      priority: state === "out_of_stock" ? "critical" : "high",
      title: `${titleCase(state)}: ${item.name}`,
      detail: `${item.quantity} ${item.unit} remaining; reorder level is ${item.minimumQuantity}.`,
      occurredAt: item.updatedAt,
      href: "/inventory",
      actionLabel: "Review inventory",
    });
  });
  source.donations.recentDonations.filter((item) => isRecent(item.donatedAt, 7)).forEach((item) => notifications.push({
    id: `donation-${item.id}`,
    category: "donation",
    priority: item.status === "pending" ? "normal" : "low",
    title: `Donation ${titleCase(item.status)}: ${item.donorName}`,
    detail: `${item.campaignName} · ₹${item.amount.toLocaleString("en-IN")}.`,
    occurredAt: item.donatedAt,
    href: "/donations",
    actionLabel: "Open donations",
  }));
  source.donations.campaignProgress
    .filter((item) => item.status === "active" && item.percent >= 90 && safeDate(item.createdAt))
    .forEach((item) => notifications.push({
      id: `${item.percent >= 100 ? "campaign-goal-reached" : "campaign-nearing-goal"}-${item.id}`,
      category: "campaign",
      priority: item.percent >= 100 ? "high" : "normal",
      title: item.percent >= 100 ? `Campaign goal reached: ${item.name}` : `Campaign nearing its goal: ${item.name}`,
      detail: `${item.percent}% funded · ₹${item.raised.toLocaleString("en-IN")} of ₹${item.goal.toLocaleString("en-IN")}.`,
      occurredAt: item.createdAt,
      href: "/campaigns",
      actionLabel: "Review campaign",
    }));
  return notifications.filter((item) => safeDate(item.occurredAt)).sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime());
}

export const relativeTime = (value: string) => {
  const date = safeDate(value);
  if (!date) return "Unknown time";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [["year", 31_536_000], ["month", 2_592_000], ["day", 86_400], ["hour", 3_600], ["minute", 60]];
  const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1] as [Intl.RelativeTimeFormatUnit, number];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(seconds / size), unit);
};

export const groupNotifications = (items: Notification[]) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return items.reduce<Record<string, Notification[]>>((groups, item) => {
    const date = safeDate(item.occurredAt) ?? new Date(0);
    const group = date >= tomorrow ? "Upcoming" : date >= now ? "Today" : date >= yesterday ? "Yesterday" : date >= weekAgo ? "Previous 7 days" : "Earlier";
    (groups[group] ??= []).push(item);
    return groups;
  }, {});
};

export const filterNotifications = (items: Notification[], filters: NotificationFilters, readIds: Set<string>, preferences: NotificationPreferences) => {
  const term = filters.search.trim().toLowerCase();
  return items
    .filter((item) => preferences.categories[item.category])
    .filter((item) => preferences.showReadNotifications || !readIds.has(item.id))
    .filter((item) => filters.category === "all" || item.category === filters.category)
    .filter((item) => filters.priority === "all" || item.priority === filters.priority)
    .filter((item) => filters.readState === "all" || (filters.readState === "read" ? readIds.has(item.id) : !readIds.has(item.id)))
    .filter((item) => !term || `${item.title} ${item.detail} ${item.category}`.toLowerCase().includes(term))
    .sort((first, second) => filters.sort === "priority" ? priorityRank(first.priority) - priorityRank(second.priority) || new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime() : filters.sort === "oldest" ? new Date(first.occurredAt).getTime() - new Date(second.occurredAt).getTime() : new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime());
};
