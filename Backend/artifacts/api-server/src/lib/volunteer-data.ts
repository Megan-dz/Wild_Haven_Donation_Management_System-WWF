import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  db,
  volunteerApplicationsTable,
  volunteerAssignmentsTable,
  volunteerHoursTable,
  volunteersTable,
} from "@workspace/db";

export type VolunteerListOptions = {
  search?: string;
  status?: string;
  skills?: string;
  availability?: string;
  assignmentType?: string;
  limit?: number;
  offset?: number;
  sort?: string;
};

export async function listVolunteerRecords(options: VolunteerListOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const filters = [
    options.search
      ? or(
          ilike(volunteersTable.name, `%${options.search}%`),
          ilike(volunteersTable.email, `%${options.search}%`),
          ilike(volunteersTable.skills, `%${options.search}%`),
          ilike(volunteersTable.interests, `%${options.search}%`),
        )
      : undefined,
    options.status ? eq(volunteersTable.status, options.status) : undefined,
    options.skills ? ilike(volunteersTable.skills, `%${options.skills}%`) : undefined,
    options.availability ? eq(volunteersTable.availability, options.availability) : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  const sortColumn =
    options.sort === "name"
      ? volunteersTable.name
      : options.sort === "joinedDate"
        ? volunteersTable.joinedDate
        : options.sort === "status"
          ? volunteersTable.status
          : volunteersTable.createdAt;

  return db
    .select()
    .from(volunteersTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(sortColumn))
    .limit(limit)
    .offset(offset);
}

export async function getVolunteerDashboard() {
  const totalVolunteers = await db.select({ value: sql<number>`count(*)` }).from(volunteersTable);
  const activeVolunteers = await db
    .select({ value: sql<number>`count(*)` })
    .from(volunteersTable)
    .where(eq(volunteersTable.status, "active"));
  const pendingApplications = await db
    .select({ value: sql<number>`count(*)` })
    .from(volunteerApplicationsTable)
    .where(eq(volunteerApplicationsTable.status, "pending"));
  const approvedApplications = await db
    .select({ value: sql<number>`count(*)` })
    .from(volunteerApplicationsTable)
    .where(eq(volunteerApplicationsTable.status, "approved"));

  const assignedVolunteersResult = await db
    .select({ value: sql<number>`count(distinct ${volunteerAssignmentsTable.volunteerId})` })
    .from(volunteerAssignmentsTable)
    .where(eq(volunteerAssignmentsTable.status, "active"));

  const totalVolunteerHoursResult = await db
    .select({ value: sql<number>`coalesce(sum(${volunteerHoursTable.hours}), 0)` })
    .from(volunteerHoursTable)
    .where(eq(volunteerHoursTable.status, "approved"));

  const hoursThisMonthResult = await db
    .select({ value: sql<number>`coalesce(sum(${volunteerHoursTable.hours}), 0)` })
    .from(volunteerHoursTable)
    .where(sql`${volunteerHoursTable.workDate} >= now() - interval '1 month' and ${volunteerHoursTable.status} = 'approved'`);

  const volunteersByStatus = await db
    .select({ status: volunteersTable.status, count: sql<number>`count(*)` })
    .from(volunteersTable)
    .groupBy(volunteersTable.status);

  const volunteersBySkill = await db
    .select({ skill: sql<string>`trim(split_part(${volunteersTable.skills}, ',', 1))`, count: sql<number>`count(*)` })
    .from(volunteersTable)
    .groupBy(sql`trim(split_part(${volunteersTable.skills}, ',', 1))`);

  const volunteersByAssignmentType = await db
    .select({ assignmentType: volunteerAssignmentsTable.assignmentType, count: sql<number>`count(*)` })
    .from(volunteerAssignmentsTable)
    .groupBy(volunteerAssignmentsTable.assignmentType);

  const topVolunteersByHours = await db
    .select({
      volunteerId: volunteerHoursTable.volunteerId,
      totalHours: sql<number>`coalesce(sum(${volunteerHoursTable.hours}), 0)`,
      name: volunteersTable.name,
    })
    .from(volunteerHoursTable)
    .innerJoin(volunteersTable, eq(volunteerHoursTable.volunteerId, volunteersTable.id))
    .where(eq(volunteerHoursTable.status, "approved"))
    .groupBy(volunteerHoursTable.volunteerId, volunteersTable.name)
    .orderBy(desc(sql`coalesce(sum(${volunteerHoursTable.hours}), 0)`))
    .limit(5);

  return {
    totalVolunteers: Number(totalVolunteers[0]?.value ?? 0),
    activeVolunteers: Number(activeVolunteers[0]?.value ?? 0),
    pendingApplications: Number(pendingApplications[0]?.value ?? 0),
    approvedApplications: Number(approvedApplications[0]?.value ?? 0),
    volunteersCurrentlyAssigned: Number(assignedVolunteersResult[0]?.value ?? 0),
    totalVolunteerHours: Number(totalVolunteerHoursResult[0]?.value ?? 0),
    hoursThisMonth: Number(hoursThisMonthResult[0]?.value ?? 0),
    volunteersByStatus: volunteersByStatus.map((item) => ({ status: item.status, count: Number(item.count) })),
    volunteersBySkill: volunteersBySkill.map((item) => ({ skill: item.skill, count: Number(item.count) })),
    volunteersByAssignmentType: volunteersByAssignmentType.map((item) => ({ assignmentType: item.assignmentType, count: Number(item.count) })),
    topVolunteersByHours: topVolunteersByHours.map((item) => ({
      volunteerId: item.volunteerId,
      name: item.name,
      totalHours: Number(item.totalHours),
    })),
  };
}

export async function listVolunteerAssignmentsByVolunteerId(volunteerId: number) {
  return db
    .select()
    .from(volunteerAssignmentsTable)
    .where(eq(volunteerAssignmentsTable.volunteerId, volunteerId))
    .orderBy(desc(volunteerAssignmentsTable.createdAt));
}

export async function listVolunteerHoursByVolunteerId(volunteerId: number) {
  return db
    .select()
    .from(volunteerHoursTable)
    .where(eq(volunteerHoursTable.volunteerId, volunteerId))
    .orderBy(desc(volunteerHoursTable.workDate));
}

export async function listVolunteerReports(options: { startDate?: Date; endDate?: Date; status?: string; assignmentType?: string } = {}) {
  const filters = [
    options.startDate ? sql`${volunteerHoursTable.workDate} >= ${options.startDate}` : undefined,
    options.endDate ? sql`${volunteerHoursTable.workDate} <= ${options.endDate}` : undefined,
    options.status ? eq(volunteersTable.status, options.status) : undefined,
    options.assignmentType ? eq(volunteerAssignmentsTable.assignmentType, options.assignmentType) : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  return db
    .select({
      volunteerId: volunteersTable.id,
      volunteerCode: volunteersTable.volunteerCode,
      volunteerName: volunteersTable.name,
      status: volunteersTable.status,
      assignmentType: volunteerAssignmentsTable.assignmentType,
      referenceId: volunteerAssignmentsTable.referenceId,
      hours: volunteerHoursTable.hours,
      workDate: volunteerHoursTable.workDate,
      approvedBy: volunteerHoursTable.approvedBy,
      activity: volunteerHoursTable.activity,
    })
    .from(volunteersTable)
    .leftJoin(volunteerAssignmentsTable, eq(volunteerAssignmentsTable.volunteerId, volunteersTable.id))
    .leftJoin(volunteerHoursTable, eq(volunteerHoursTable.volunteerId, volunteersTable.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(volunteerHoursTable.workDate));
}
