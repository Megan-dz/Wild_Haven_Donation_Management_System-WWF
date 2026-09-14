import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  animalMedicalRecordsTable,
  db,
  rescueCaseNotesTable,
  rescueCaseStatusHistoryTable,
  rescueCasesTable,
  rescueExpensesTable,
} from "@workspace/db";

export type RescueCaseQueryOptions = {
  search?: string;
  status?: string;
  priority?: string;
  severity?: string;
  rescueType?: string;
  location?: string;
  assignedEmployeeId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  sort?: string;
};

export async function listRescueCases(options: RescueCaseQueryOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const filters = [
    options.search
      ? or(
          ilike(rescueCasesTable.caseNumber, `%${options.search}%`),
          ilike(rescueCasesTable.animalName, `%${options.search}%`),
          ilike(rescueCasesTable.species, `%${options.search}%`),
          ilike(rescueCasesTable.reportedBy, `%${options.search}%`),
        )
      : undefined,
    options.status ? eq(rescueCasesTable.status, options.status) : undefined,
    options.priority ? eq(rescueCasesTable.priority, options.priority) : undefined,
    options.severity ? eq(rescueCasesTable.severity, options.severity) : undefined,
    options.rescueType ? eq(rescueCasesTable.rescueType, options.rescueType) : undefined,
    options.location ? ilike(rescueCasesTable.rescueLocation, `%${options.location}%`) : undefined,
    options.assignedEmployeeId ? eq(rescueCasesTable.assignedEmployeeId, options.assignedEmployeeId) : undefined,
    options.fromDate ? sql`${rescueCasesTable.reportedAt} >= ${options.fromDate}` : undefined,
    options.toDate ? sql`${rescueCasesTable.reportedAt} <= ${options.toDate}` : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  const sortColumn = options.sort === "reportedAt" ? rescueCasesTable.reportedAt : options.sort === "priority" ? rescueCasesTable.priority : rescueCasesTable.createdAt;
  const query = db
    .select()
    .from(rescueCasesTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(sortColumn))
    .limit(limit)
    .offset(offset);

  return await query;
}

export async function getRescueCaseRecord(id: number) {
  const [row] = await db.select().from(rescueCasesTable).where(eq(rescueCasesTable.id, id));
  return row ?? undefined;
}

export async function listRescueCaseNotes(rescueCaseId: number) {
  return db
    .select()
    .from(rescueCaseNotesTable)
    .where(eq(rescueCaseNotesTable.rescueCaseId, rescueCaseId))
    .orderBy(desc(rescueCaseNotesTable.createdAt));
}

export async function listRescueCaseStatusHistory(rescueCaseId: number) {
  return db
    .select()
    .from(rescueCaseStatusHistoryTable)
    .where(eq(rescueCaseStatusHistoryTable.rescueCaseId, rescueCaseId))
    .orderBy(desc(rescueCaseStatusHistoryTable.changedAt));
}

export async function listAnimalMedicalRecords(rescueCaseId: number) {
  return db
    .select()
    .from(animalMedicalRecordsTable)
    .where(eq(animalMedicalRecordsTable.rescueCaseId, rescueCaseId))
    .orderBy(desc(animalMedicalRecordsTable.treatmentDate));
}

export async function listMedicalCases(options: { medicalStatus?: string; priority?: string; search?: string } = {}) {
  const filters = [
    options.medicalStatus ? eq(animalMedicalRecordsTable.medicalStatus, options.medicalStatus) : undefined,
    options.priority ? eq(rescueCasesTable.priority, options.priority) : undefined,
    options.search ? or(ilike(rescueCasesTable.caseNumber, `%${options.search}%`), ilike(rescueCasesTable.animalName, `%${options.search}%`), ilike(rescueCasesTable.species, `%${options.search}%`), ilike(animalMedicalRecordsTable.diagnosis, `%${options.search}%`), ilike(animalMedicalRecordsTable.veterinarian, `%${options.search}%`)) : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));
  return db.select({ record: animalMedicalRecordsTable, rescueCase: rescueCasesTable }).from(animalMedicalRecordsTable).innerJoin(rescueCasesTable, eq(animalMedicalRecordsTable.rescueCaseId, rescueCasesTable.id)).where(filters.length ? and(...filters) : undefined).orderBy(desc(animalMedicalRecordsTable.treatmentDate)).limit(100);
}

export async function listRescueExpenses(rescueCaseId: number) {
  return db
    .select()
    .from(rescueExpensesTable)
    .where(eq(rescueExpensesTable.rescueCaseId, rescueCaseId))
    .orderBy(desc(rescueExpensesTable.expenseDate));
}

export async function getRescueDashboard() {
  const totalCasesResult = await db.select({ value: sql<number>`count(*)` }).from(rescueCasesTable);
  const activeCasesResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(sql`${rescueCasesTable.status} not in ('released', 'closed', 'cancelled')`);
  const completedCasesResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(eq(rescueCasesTable.status, "closed"));
  const highPriorityCasesResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(or(eq(rescueCasesTable.priority, "high"), eq(rescueCasesTable.priority, "critical")));
  const awaitingAssignmentResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(and(eq(rescueCasesTable.status, "reported"), eq(rescueCasesTable.assignedEmployeeId, null)));
  const inRehabilitationResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(eq(rescueCasesTable.status, "rehabilitation"));
  const releasedCasesResult = await db
    .select({ value: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .where(eq(rescueCasesTable.status, "released"));
  const totalExpensesResult = await db
    .select({ value: sql<number>`coalesce(sum(${rescueExpensesTable.amount}), 0)` })
    .from(rescueExpensesTable);
  const averageCostResult = await db
    .select({ value: sql<number>`coalesce(avg(${rescueCasesTable.actualCost}), 0)` })
    .from(rescueCasesTable);

  const casesBySpecies = await db
    .select({ species: rescueCasesTable.species, count: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .groupBy(rescueCasesTable.species);

  const casesByStatus = await db
    .select({ status: rescueCasesTable.status, count: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .groupBy(rescueCasesTable.status);

  const casesByPriority = await db
    .select({ priority: rescueCasesTable.priority, count: sql<number>`count(*)` })
    .from(rescueCasesTable)
    .groupBy(rescueCasesTable.priority);

  return {
    totalRescueCases: Number(totalCasesResult[0]?.value ?? 0),
    activeCases: Number(activeCasesResult[0]?.value ?? 0),
    completedCases: Number(completedCasesResult[0]?.value ?? 0),
    highPriorityCases: Number(highPriorityCasesResult[0]?.value ?? 0),
    casesAwaitingAssignment: Number(awaitingAssignmentResult[0]?.value ?? 0),
    casesInRehabilitation: Number(inRehabilitationResult[0]?.value ?? 0),
    casesReleased: Number(releasedCasesResult[0]?.value ?? 0),
    totalRescueExpenses: Number(totalExpensesResult[0]?.value ?? 0),
    averageRescueCost: Number(averageCostResult[0]?.value ?? 0),
    casesBySpecies: casesBySpecies.map((item) => ({ species: item.species, count: Number(item.count) })),
    casesByStatus: casesByStatus.map((item) => ({ status: item.status, count: Number(item.count) })),
    casesByPriority: casesByPriority.map((item) => ({ priority: item.priority, count: Number(item.count) })),
  };
}

export async function listVolunteerWorkloads() {
  const rows = await db
    .select({
      employeeId: rescueCasesTable.assignedEmployeeId,
      totalCases: sql<number>`count(*)`,
      activeCases: sql<number>`count(*) filter (where ${rescueCasesTable.status} not in ('released', 'closed', 'cancelled'))`,
      highPriorityCases: sql<number>`count(*) filter (where ${rescueCasesTable.priority} in ('high', 'critical'))`,
      lastAssignedAt: sql<Date | null>`max(${rescueCasesTable.updatedAt})`,
    })
    .from(rescueCasesTable)
    .where(sql`${rescueCasesTable.assignedEmployeeId} is not null`)
    .groupBy(rescueCasesTable.assignedEmployeeId)
    .orderBy(desc(sql`count(*) filter (where ${rescueCasesTable.status} not in ('released', 'closed', 'cancelled'))`));

  return rows.filter((row): row is typeof row & { employeeId: string } => Boolean(row.employeeId)).map((row) => ({
    id: row.employeeId,
    totalCases: Number(row.totalCases),
    activeCases: Number(row.activeCases),
    highPriorityCases: Number(row.highPriorityCases),
    lastAssignedAt: row.lastAssignedAt,
  }));
}
