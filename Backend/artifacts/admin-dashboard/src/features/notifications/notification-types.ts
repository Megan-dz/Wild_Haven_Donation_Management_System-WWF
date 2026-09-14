export const notificationCategories = ["system", "rescue", "medical", "volunteer", "adoption", "inventory", "donation", "campaign"] as const;
export const notificationPriorities = ["critical", "high", "normal", "low"] as const;

export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationPriority = (typeof notificationPriorities)[number];
export type NotificationReadState = "all" | "unread" | "read";
export type NotificationSort = "newest" | "oldest" | "priority";

export type Notification = {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  detail: string;
  occurredAt: string;
  href: string;
  actionLabel: string;
};

export type NotificationFilters = {
  search: string;
  category: "all" | NotificationCategory;
  readState: NotificationReadState;
  priority: "all" | NotificationPriority;
  sort: NotificationSort;
};

export type NotificationPreferences = {
  categories: Record<NotificationCategory, boolean>;
  showReadNotifications: boolean;
};

export type StaffProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};

export type SystemActivity = {
  id: number;
  type: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type RescueNotificationRecord = {
  id: number;
  caseNumber: string;
  animalName: string;
  species: string;
  rescueLocation: string;
  reportedAt: string;
  updatedAt?: string;
  status: string;
  priority: string;
  assignedEmployeeId: string | null;
};

export type MedicalNotificationRecord = {
  record: {
    id: number;
    diagnosis: string;
    treatmentDate: string;
    followUpDate: string | null;
    medicalStatus: string;
    updatedAt?: string;
  };
  rescueCase: {
    id: number;
    caseNumber: string;
    animalName: string;
    priority: string;
  };
};

export type AdoptionNotificationRecord = {
  id: number;
  applicationNumber: string;
  applicantName: string;
  animalName: string;
  applicationDate: string;
  status: string;
  reviewedAt: string | null;
};

export type VolunteerNotificationRecord = {
  id: string;
  activeCases: number;
  highPriorityCases: number;
  lastAssignedAt: string | null;
};

export type InventoryNotificationRecord = {
  id: number;
  name: string;
  quantity: number;
  minimumQuantity: number;
  unit: string;
  updatedAt: string;
};

export type DonationAnalytics = {
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
    createdAt: string;
  }>;
};

export type NotificationSourceData = {
  systemActivity: SystemActivity[];
  rescueCases: RescueNotificationRecord[];
  medicalRecords: MedicalNotificationRecord[];
  adoptions: AdoptionNotificationRecord[];
  volunteers: VolunteerNotificationRecord[];
  inventory: InventoryNotificationRecord[];
  donations: DonationAnalytics;
};
