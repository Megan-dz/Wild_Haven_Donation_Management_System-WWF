export type CommandCenterFilters = {
  from: string;
  to: string;
  rescueStatus: string;
  priority: string;
};

export type RescueCase = {
  id: number;
  caseNumber: string;
  animalName: string;
  species: string;
  rescueLocation: string;
  reportedAt: string;
  createdAt?: string;
  updatedAt?: string;
  status: string;
  priority: string;
  severity: string;
  assignedEmployeeId: string | null;
};

export type RescueDashboard = {
  totalRescueCases: number;
  activeCases: number;
  completedCases: number;
  highPriorityCases: number;
  casesAwaitingAssignment?: number;
  casesInRehabilitation?: number;
  casesReleased?: number;
  casesByStatus?: Array<{ status: string; count: number }>;
  casesByPriority?: Array<{ priority: string; count: number }>;
};

export type MedicalItem = {
  record: {
    id: number;
    diagnosis: string;
    treatment: string;
    veterinarian: string;
    treatmentDate: string;
    followUpDate: string | null;
    medicalStatus: string;
    createdAt?: string;
    updatedAt?: string;
  };
  rescueCase: Pick<RescueCase, "id" | "caseNumber" | "animalName" | "species" | "priority" | "status" | "rescueLocation">;
};

export type AdoptionApplication = {
  id: number;
  applicationNumber: string;
  applicantName: string;
  animalName: string;
  animalSpecies: string;
  applicationDate: string;
  status: string;
  reviewedAt: string | null;
  updatedAt?: string;
};

export type AdoptionDashboard = {
  totalAnimals: number;
  availableForAdoption: number;
  pendingApplications: number;
  approvedApplications: number;
  completedAdoptions: number;
  animalsAwaitingAdoption: number;
  adoptionRate: number;
};

export type VolunteerWorkload = {
  id: string;
  totalCases: number;
  activeCases: number;
  highPriorityCases: number;
  lastAssignedAt: string | null;
};

export type InventoryItem = {
  id: number;
  name: string;
  category: string;
  sku: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  unitCost: number;
  location: string | null;
  updatedAt: string;
};

export type InventoryDashboard = {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
};

export type DonationAnalytics = {
  summary: {
    totalDonations: number;
    totalAmount: number;
    averageAmount: number;
  };
  byMonth: Array<{ month: string; donationCount: number; amount: number }>;
  byStatus: Array<{ status: string; donationCount: number; amount: number }>;
  recentDonations: Array<{
    id: number;
    donorName: string;
    amount: number;
    status: string;
    campaignName: string;
    donatedAt: string;
  }>;
  campaignProgress: Array<{
    id: number;
    name: string;
    raised: number;
    goal: number;
    percent: number;
    status: string;
  }>;
};

export type CommandCenterData = {
  rescueDashboard: RescueDashboard;
  rescueCases: RescueCase[];
  medicalItems: MedicalItem[];
  adoptionDashboard: AdoptionDashboard;
  adoptionApplications: AdoptionApplication[];
  volunteers: VolunteerWorkload[];
  inventoryDashboard: InventoryDashboard;
  inventoryItems: InventoryItem[];
  donationAnalytics: DonationAnalytics;
};

export type Severity = "critical" | "warning" | "info";

export type AttentionItemData = {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
};

export type TimelineItemData = {
  id: string;
  type: "rescue" | "medical" | "adoption" | "inventory" | "donation" | "volunteer";
  title: string;
  detail: string;
  occurredAt: string;
  href: string;
};

export type DistributionItem = { name: string; value: number; color: string };
export type TrendPoint = { label: string; value: number; secondaryValue?: number };
