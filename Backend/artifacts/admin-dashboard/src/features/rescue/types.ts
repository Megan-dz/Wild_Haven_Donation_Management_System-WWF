export const rescueStatuses = ["reported", "assigned", "rescuing", "rescued", "rehabilitation", "released", "closed", "cancelled"] as const;
export const rescuePriorities = ["low", "medium", "high", "critical"] as const;
export const rescueTypes = ["injury", "orphaned", "entanglement", "poaching", "habitat", "other"] as const;

export type RescueStatus = (typeof rescueStatuses)[number];
export type RescuePriority = (typeof rescuePriorities)[number];
export type RescueCase = {
  id: number; caseNumber: string; animalName: string; species: string; rescueType: string;
  rescueLocation: string; reportedBy: string; contactInformation: string; reportedAt: string;
  rescueDate: string; severity: string; condition: string; description: string;
  assignedEmployeeId: string | null; status: RescueStatus; priority: RescuePriority;
  estimatedCost: number; actualCost: number;
};
export type RescueCaseForm = Omit<RescueCase, "id" | "reportedAt" | "rescueDate" | "assignedEmployeeId" | "actualCost"> & {
  reportedAt: string; rescueDate: string; assignedEmployeeId: string;
};
export type RescueNote = { id: number; employeeId: string; note: string; noteType: string; createdAt: string; updatedAt: string };
export type MedicalRecord = { id: number; diagnosis: string; treatment: string; medication: string | null; veterinarian: string; treatmentDate: string; followUpDate: string | null; medicalStatus: string; notes: string | null };
export type RescueExpense = { id: number; expenseType: string; description: string; amount: number; paidBy: string; expenseDate: string; receiptReference: string | null };
export type StatusHistory = { id: number; previousStatus: string | null; newStatus: string; changedBy: string; reason: string | null; changedAt: string };
export type RescueDashboard = { totalRescueCases: number; activeCases: number; completedCases: number; highPriorityCases: number; totalRescueExpenses: number; casesAwaitingAssignment?: number; casesInRehabilitation?: number; casesReleased?: number; casesByStatus?: Array<{ status: string; count: number }>; casesByPriority?: Array<{ priority: string; count: number }> };
export type RescueFilters = { search: string; status: string; priority: string; severity: string; rescueType: string; location: string; assignedEmployeeId: string; sort: string };
