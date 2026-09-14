import type { RescueCase, RescueCaseForm, RescueExpense, RescueFilters, RescuePriority, RescueStatus } from "./types";

export const emptyRescueFilters: RescueFilters = { search: "", status: "all", priority: "all", severity: "all", rescueType: "all", location: "", assignedEmployeeId: "", sort: "createdAt" };
export const createEmptyCaseForm = (): RescueCaseForm => ({ caseNumber: "", animalName: "", species: "", rescueType: "injury", rescueLocation: "", reportedBy: "", contactInformation: "", reportedAt: new Date().toISOString().slice(0, 16), rescueDate: new Date().toISOString().slice(0, 16), severity: "medium", condition: "", description: "", assignedEmployeeId: "", status: "reported", priority: "medium", estimatedCost: 0 });
export const caseToForm = (item: RescueCase): RescueCaseForm => ({ ...item, reportedAt: toDateTimeLocal(item.reportedAt), rescueDate: toDateTimeLocal(item.rescueDate), assignedEmployeeId: item.assignedEmployeeId ?? "" });
export const toDateTimeLocal = (value: string) => new Date(value).toISOString().slice(0, 16);
export const toIso = (value: string) => new Date(value).toISOString();
export const toCasePayload = (form: RescueCaseForm) => ({ ...form, reportedAt: toIso(form.reportedAt), rescueDate: toIso(form.rescueDate), assignedEmployeeId: form.assignedEmployeeId.trim() || null });
export const buildRescueQuery = (filters: RescueFilters, limit: number, offset: number) => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: filters.sort });
  (Object.entries(filters) as Array<[keyof RescueFilters, string]>).forEach(([key, value]) => { if (value.trim() && value !== "all" && key !== "sort") query.set(key, value.trim()); });
  return query.toString();
};
export const statusVariant = (value: string) => (value === "critical" || value === "cancelled" ? "destructive" : ["high", "assigned", "rescuing", "rehabilitation"].includes(value) ? "warning" : ["released", "closed", "stable", "recovering"].includes(value) ? "success" : "secondary");
export const statusLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
export const caseProgress = (status: RescueStatus) => ({ reported: 12, assigned: 25, rescuing: 42, rescued: 58, rehabilitation: 76, released: 100, closed: 100, cancelled: 0 }[status]);
export const priorityRank = (priority: RescuePriority) => ({ low: 1, medium: 2, high: 3, critical: 4 }[priority]);
export const expenseTotal = (expenses: RescueExpense[]) => expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
export const expenseBreakdown = (expenses: RescueExpense[]) => Object.entries(expenses.reduce<Record<string, number>>((groups, expense) => ({ ...groups, [expense.expenseType]: (groups[expense.expenseType] ?? 0) + Number(expense.amount || 0) }), {})).sort(([, a], [, b]) => b - a);
export const validateCaseForm = (form: RescueCaseForm) => {
  const errors: Partial<Record<keyof RescueCaseForm, string>> = {};
  (["caseNumber", "animalName", "species", "rescueLocation", "reportedBy", "contactInformation", "condition", "description"] as const).forEach((field) => { if (!form[field].trim()) errors[field] = "This field is required."; });
  if (form.caseNumber.trim().length < 4) errors.caseNumber = "Use a recognisable case number (at least 4 characters).";
  if (form.estimatedCost < 0 || !Number.isFinite(form.estimatedCost)) errors.estimatedCost = "Estimated cost must be zero or greater.";
  if (Number.isNaN(new Date(form.reportedAt).getTime())) errors.reportedAt = "Enter a valid reported date.";
  if (Number.isNaN(new Date(form.rescueDate).getTime())) errors.rescueDate = "Enter a valid rescue date.";
  return errors;
};
