import { Router, type IRouter, type Response } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  activityTable,
  adoptionApplicationsTable,
  adoptionHistoriesTable,
  animalMedicalRecordsTable,
  animalsTable,
  campaignsTable,
  conservationAreasTable,
  db,
  donorsTable,
  donationChallengesTable,
  insertAdoptionApplicationSchema,
  insertAdoptionHistorySchema,
  insertAnimalMedicalRecordSchema,
  insertConservationAreaSchema,
  insertDonationChallengeSchema,
  insertRecurringDonationSchema,
  insertRescueCaseNoteSchema,
  insertRescueCaseSchema,
  insertRescueExpenseSchema,
  insertSponsorshipPaymentSchema,
  insertSponsorshipPlanSchema,
  insertSponsorshipSchema,
  recurringDonationsTable,
  rescueCaseNotesTable,
  rescueCaseStatusHistoryTable,
  rescueCasesTable,
  rescueExpensesTable,
  sponsorshipPaymentsTable,
  sponsorshipPlansTable,
  sponsorshipsTable,
  tasksTable,
} from "@workspace/db";
import {
  CreateCampaignBody,
  CreateDonorBody,
  CreateDonationBody,
  DeleteCampaignParams,
  DeleteDonorParams,
  DeleteDonationParams,
  DeleteTaskParams,
  GetCampaignParams,
  GetCurrentStaffResponse,
  CreateTaskBody,
  GetTaskParams,
  ListTasksQueryParams,
  ListTasksResponse,
  TaskSchema,
  UpdateTaskBody,
  GetDashboardSummaryResponse,
  GetDonorParams,
  GetDonationParams,
  GetImpactSummaryResponse,
  ListActivityQueryParams,
  ListActivityResponse,
  ListCampaignsQueryParams,
  ListCampaignsResponse,
  ListDonationsQueryParams,
  ListDonationsResponse,
  ListDonorsQueryParams,
  ListDonorsResponse,
  UpdateCampaignBody,
  UpdateCampaignParams,
  UpdateDonorBody,
  UpdateDonorParams,
  UpdateDonationBody,
  UpdateDonationParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import {
  addActivity,
  currency,
  getCampaignRecord,
  getDonorDashboard,
  getDonorRecord,
  getDonationChallengeRecord,
  getDonationRecord,
  listCampaignRecords,
  listConservationAreas,
  listDonationChallenges,
  listDonationRecords,
  listDonorRecords,
} from "../lib/portal-data";
import {
  getAdoptionDashboard,
  getSponsorshipDashboard,
  listAdoptionApplications,
  listAnimalAdoptionOptions,
  listSponsorshipPaymentsBySponsorshipId,
  listSponsorships,
  listAdoptionHistoryByAnimalId,
} from "../lib/adoption-sponsorship-data";
import {
  getRescueDashboard,
  getRescueCaseRecord,
  listAnimalMedicalRecords,
  listRescueCaseNotes,
  listRescueCaseStatusHistory,
  listRescueCases,
  listRescueExpenses,
} from "../lib/rescue-case-data";
import { logger } from "../lib/logger";

const isDuplicateRecordError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === "23505";

const handleCrudError = (error: unknown, res: Response, entity: string): void => {
  if (isDuplicateRecordError(error)) {
    res.status(409).json({ error: `${entity} already exists` });
    return;
  }

  logger.error({ err: error, entity }, "CRUD operation failed");
  res.status(500).json({ error: "Internal server error" });
};

const router: IRouter = Router();
router.use(requireAuth);

const parseLimitQuery = (query: Record<string, unknown>) => {
  const limitValue = query.limit;
  const limit = typeof limitValue === "string" ? Number(limitValue) : typeof limitValue === "number" ? limitValue : 50;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { success: false as const, error: "Invalid limit" };
  }

  return { success: true as const, data: { limit } };
};

const parseIdParam = (params: Record<string, unknown>) => {
  const idValue = params.id;
  const id = typeof idValue === "string" ? Number(idValue) : typeof idValue === "number" ? idValue : NaN;

  if (!Number.isInteger(id) || id < 1) {
    return { success: false as const, error: { message: "Invalid id" } };
  }

  return { success: true as const, data: { id } };
};

const IdParams = {
  safeParse: parseIdParam,
};

const parseRecurringDonationsQuery = (query: Record<string, unknown>) => {
  const donorIdValue = query.donorId;
  const donorId = typeof donorIdValue === "string" ? Number(donorIdValue) : typeof donorIdValue === "number" ? donorIdValue : undefined;
  const limitResult = parseLimitQuery(query);

  if (!limitResult.success) {
    return limitResult;
  }

  if (donorId !== undefined && (!Number.isInteger(donorId) || donorId < 1)) {
    return { success: false as const, error: "Invalid donorId" };
  }

  return { success: true as const, data: { donorId, limit: limitResult.data.limit } };
};

const RESCUE_CASE_STATUSES = [
  "reported",
  "assigned",
  "rescuing",
  "rescued",
  "rehabilitation",
  "released",
  "closed",
  "cancelled",
] as const;
const RESCUE_CASE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
const RESCUE_CASE_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const RESCUE_CASE_TYPES = ["injury", "orphaned", "entanglement", "poaching", "habitat", "other"] as const;

const parseOptionalString = (value: unknown) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const parseOptionalDate = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const dateValue = new Date(value);
  return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
};

const parseRescueCaseListQuery = (query: Record<string, unknown>) => {
  const limitResult = parseLimitQuery(query);
  if (!limitResult.success) {
    return limitResult;
  }

  const offsetValue = typeof query.offset === "string" ? Number(query.offset) : typeof query.offset === "number" ? query.offset : 0;
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;

  return {
    success: true as const,
    data: {
      search: parseOptionalString(query.search),
      status: parseOptionalString(query.status),
      priority: parseOptionalString(query.priority),
      severity: parseOptionalString(query.severity),
      rescueType: parseOptionalString(query.rescueType),
      location: parseOptionalString(query.location),
      assignedEmployeeId: parseOptionalString(query.assignedEmployeeId),
      fromDate: parseOptionalDate(query.fromDate),
      toDate: parseOptionalDate(query.toDate),
      limit: limitResult.data.limit,
      offset,
      sort: parseOptionalString(query.sort),
    },
  };
};

const validateRescueCaseBody = (payload: Record<string, unknown>) => {
  if (payload.status && !RESCUE_CASE_STATUSES.includes(payload.status as (typeof RESCUE_CASE_STATUSES)[number])) {
    return "Invalid status";
  }

  if (payload.priority && !RESCUE_CASE_PRIORITIES.includes(payload.priority as (typeof RESCUE_CASE_PRIORITIES)[number])) {
    return "Invalid priority";
  }

  if (payload.severity && !RESCUE_CASE_SEVERITIES.includes(payload.severity as (typeof RESCUE_CASE_SEVERITIES)[number])) {
    return "Invalid severity";
  }

  if (payload.rescueType && !RESCUE_CASE_TYPES.includes(payload.rescueType as (typeof RESCUE_CASE_TYPES)[number])) {
    return "Invalid rescueType";
  }

  if (payload.estimatedCost !== undefined && typeof payload.estimatedCost === "number" && payload.estimatedCost < 0) {
    return "estimatedCost must be >= 0";
  }

  if (payload.actualCost !== undefined && typeof payload.actualCost === "number" && payload.actualCost < 0) {
    return "actualCost must be >= 0";
  }

  return null;
};

router.get("/auth/me", (req, res): void => {
  const claims = (req as typeof req & { auth?: { sessionClaims?: Record<string, unknown> } }).auth?.sessionClaims;
  const name = typeof claims?.name === "string" ? claims.name : "Wild Haven staff";
  const email = typeof claims?.email === "string" ? claims.email : "staff@wildhaven.org";
  const profile = {
    id: (req as typeof req & { userId: string }).userId,
    name,
    email,
    role: "manager" as const,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
  res.json(GetCurrentStaffResponse.parse(profile));
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(parsed.data.employeeId ? eq(tasksTable.employeeId, parsed.data.employeeId) : undefined)
      .orderBy(desc(tasksTable.createdAt))
      .limit(parsed.data.limit ?? 50);

    res.json(ListTasksResponse.parse(tasks));
  } catch (error) {
    handleCrudError(error, res, "Task");
  }
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const parsed = GetTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, parsed.data.id));
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(TaskSchema.parse(task));
  } catch (error) {
    handleCrudError(error, res, "Task");
  }
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [task] = await db
      .insert(tasksTable)
      .values({
        ...parsed.data,
        dueDate: parsed.data.dueDate,
      })
      .returning();

    res.status(201).json(TaskSchema.parse(task));
  } catch (error) {
    handleCrudError(error, res, "Task");
  }
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  const body = UpdateTaskBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const update = {
      ...(body.data.title === undefined ? {} : { title: body.data.title }),
      ...(body.data.description === undefined ? {} : { description: body.data.description }),
      ...(body.data.employeeId === undefined ? {} : { employeeId: body.data.employeeId }),
      ...(body.data.priority === undefined ? {} : { priority: body.data.priority }),
      ...(body.data.status === undefined ? {} : { status: body.data.status }),
      ...(body.data.dueDate === undefined ? {} : { dueDate: body.data.dueDate }),
    };
    const [task] = await db.update(tasksTable).set(update).where(eq(tasksTable.id, params.data.id)).returning();
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(TaskSchema.parse(task));
  } catch (error) {
    handleCrudError(error, res, "Task");
  }
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, params.data.id)).returning();
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Task");
  }
});

router.get("/conservation-areas", async (req, res): Promise<void> => {
  const parsed = parseLimitQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const areas = await listConservationAreas(parsed.data.limit);
  res.json(areas);
});

router.post("/conservation-areas", async (req, res): Promise<void> => {
  const parsed = insertConservationAreaSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [area] = await db.insert(conservationAreasTable).values(parsed.data).returning();
    res.status(201).json(area);
  } catch (error) {
    handleCrudError(error, res, "Conservation area");
  }
});

router.get("/conservation-areas/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [area] = await db.select().from(conservationAreasTable).where(eq(conservationAreasTable.id, params.data.id));
  if (!area) {
    res.status(404).json({ error: "Conservation area not found" });
    return;
  }

  res.json(area);
});

router.patch("/conservation-areas/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertConservationAreaSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [area] = await db
      .update(conservationAreasTable)
      .set(body.data)
      .where(eq(conservationAreasTable.id, params.data.id))
      .returning();

    if (!area) {
      res.status(404).json({ error: "Conservation area not found" });
      return;
    }

    res.json(area);
  } catch (error) {
    handleCrudError(error, res, "Conservation area");
  }
});

router.delete("/conservation-areas/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [area] = await db
      .delete(conservationAreasTable)
      .where(eq(conservationAreasTable.id, params.data.id))
      .returning();

    if (!area) {
      res.status(404).json({ error: "Conservation area not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Conservation area");
  }
});

router.get("/donation-challenges", async (req, res): Promise<void> => {
  const parsed = parseLimitQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const challenges = await listDonationChallenges(parsed.data.limit);
  res.json(challenges);
});

router.post("/donation-challenges", async (req, res): Promise<void> => {
  const parsed = insertDonationChallengeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [challenge] = await db.insert(donationChallengesTable).values(parsed.data).returning();
    res.status(201).json(challenge);
  } catch (error) {
    handleCrudError(error, res, "Donation challenge");
  }
});

router.get("/donation-challenges/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const challenge = await getDonationChallengeRecord(params.data.id);
  if (!challenge) {
    res.status(404).json({ error: "Donation challenge not found" });
    return;
  }

  res.json(challenge);
});

router.patch("/donation-challenges/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertDonationChallengeSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [challenge] = await db
      .update(donationChallengesTable)
      .set(body.data)
      .where(eq(donationChallengesTable.id, params.data.id))
      .returning();

    if (!challenge) {
      res.status(404).json({ error: "Donation challenge not found" });
      return;
    }

    res.json(challenge);
  } catch (error) {
    handleCrudError(error, res, "Donation challenge");
  }
});

router.delete("/donation-challenges/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [challenge] = await db
      .delete(donationChallengesTable)
      .where(eq(donationChallengesTable.id, params.data.id))
      .returning();

    if (!challenge) {
      res.status(404).json({ error: "Donation challenge not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Donation challenge");
  }
});

router.get("/recurring-donations", async (req, res): Promise<void> => {
  const parsed = parseRecurringDonationsQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const recurring = await db
    .select()
    .from(recurringDonationsTable)
    .where(parsed.data.donorId ? eq(recurringDonationsTable.donorId, parsed.data.donorId) : undefined)
    .orderBy(desc(recurringDonationsTable.nextScheduledAt))
    .limit(parsed.data.limit);

  res.json(recurring);
});

router.post("/recurring-donations", async (req, res): Promise<void> => {
  const parsed = insertRecurringDonationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [plan] = await db.insert(recurringDonationsTable).values(parsed.data).returning();
    res.status(201).json(plan);
  } catch (error) {
    handleCrudError(error, res, "Recurring donation");
  }
});

router.get("/recurring-donations/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(recurringDonationsTable)
    .where(eq(recurringDonationsTable.id, params.data.id));

  if (!plan) {
    res.status(404).json({ error: "Recurring donation not found" });
    return;
  }

  res.json(plan);
});

router.patch("/recurring-donations/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRecurringDonationSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [plan] = await db
      .update(recurringDonationsTable)
      .set(body.data)
      .where(eq(recurringDonationsTable.id, params.data.id))
      .returning();

    if (!plan) {
      res.status(404).json({ error: "Recurring donation not found" });
      return;
    }

    res.json(plan);
  } catch (error) {
    handleCrudError(error, res, "Recurring donation");
  }
});

router.delete("/recurring-donations/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [plan] = await db
      .delete(recurringDonationsTable)
      .where(eq(recurringDonationsTable.id, params.data.id))
      .returning();

    if (!plan) {
      res.status(404).json({ error: "Recurring donation not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Recurring donation");
  }
});

router.get("/dashboard", async (req, res): Promise<void> => {
  const [raised] = await db
    .select({ value: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)` })
    .from(donationsTable)
    .where(eq(donationsTable.status, "completed"));
  const [recurring] = await db
    .select({ value: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)` })
    .from(donationsTable)
    .where(and(eq(donationsTable.status, "completed"), eq(donationsTable.frequency, "monthly")));
  const [{ value: donorCount }] = await db.select({ value: sql<number>`count(*)` }).from(donorsTable);
  const [{ value: activeCampaignCount }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "active"));
  const campaigns = (await listCampaignRecords(undefined, undefined, 6)).filter(Boolean);
  const donations = await db
    .select({ donatedAt: donationsTable.donatedAt, amountCents: donationsTable.amountCents })
    .from(donationsTable)
    .where(eq(donationsTable.status, "completed"))
    .orderBy(donationsTable.donatedAt);
  const trend = donations.reduce<Record<string, number>>((result, item) => {
    const label = item.donatedAt.toLocaleString("en-IN", { month: "short" });
    result[label] = (result[label] ?? 0) + currency(item.amountCents);
    return result;
  }, {});
  const response = {
    totalRaised: currency(raised?.value),
    totalRaisedChange: 18.4,
    donorCount: Number(donorCount ?? 0),
    donorCountChange: 9.2,
    activeCampaignCount: Number(activeCampaignCount ?? 0),
    monthlyRecurring: currency(recurring?.value),
    monthlyRecurringChange: 12.8,
    campaignProgress: campaigns.map((campaign) => ({
      id: campaign!.id,
      name: campaign!.name,
      raised: campaign!.raised,
      goal: campaign!.goal,
      percent: campaign!.goal ? Math.min(100, Math.round((campaign!.raised / campaign!.goal) * 100)) : 0,
      status: campaign!.status,
    })),
    donationTrend: Object.entries(trend).map(([label, value]) => ({ label, value })),
  };
  res.json(GetDashboardSummaryResponse.parse(response));
});

router.get("/activity", async (req, res): Promise<void> => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const items = await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(parsed.data.limit ?? 50);
  res.json(ListActivityResponse.parse(items));
});

router.get("/donors", async (req, res): Promise<void> => {
  const parsed = ListDonorsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const donors = (await listDonorRecords(parsed.data.search, parsed.data.limit ?? 50)).filter(Boolean);
  res.json(ListDonorsResponse.parse(donors));
});

router.post("/donors", async (req, res): Promise<void> => {
  const parsed = CreateDonorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [donor] = await db.insert(donorsTable).values(parsed.data).returning();
    await addActivity("donor", "New donor added", `${donor.name} was added to the donor directory.`);
    res.status(201).json(await getDonorRecord(donor.id));
  } catch (error) {
    handleCrudError(error, res, "Donor");
  }
});

router.get("/donors/:id", async (req, res): Promise<void> => {
  const parsed = GetDonorParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const donor = await getDonorRecord(parsed.data.id);
  if (!donor) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }
  res.json(donor);
});

router.get("/donors/:id/donations", async (req, res): Promise<void> => {
  const params = GetDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const donor = await getDonorRecord(params.data.id);
  if (!donor) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }

  const donations = await listDonationRecords(undefined, undefined, undefined, 50, params.data.id);
  res.json(ListDonationsResponse.parse(donations));
});

router.get("/donors/:id/dashboard", async (req, res): Promise<void> => {
  const params = GetDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const dashboard = await getDonorDashboard(params.data.id);
  if (!dashboard) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }

  res.json(dashboard);
});

router.patch("/donors/:id", async (req, res): Promise<void> => {
  const params = UpdateDonorParams.safeParse(req.params);
  const body = UpdateDonorBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [donor] = await db.update(donorsTable).set(body.data).where(eq(donorsTable.id, params.data.id)).returning();
    if (!donor) {
      res.status(404).json({ error: "Donor not found" });
      return;
    }
    res.json(await getDonorRecord(donor.id));
  } catch (error) {
    handleCrudError(error, res, "Donor");
  }
});

router.delete("/donors/:id", async (req, res): Promise<void> => {
  const params = DeleteDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [donor] = await db.delete(donorsTable).where(eq(donorsTable.id, params.data.id)).returning();
    if (!donor) {
      res.status(404).json({ error: "Donor not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Donor");
  }
});

router.get("/donations", async (req, res): Promise<void> => {
  const parsed = ListDonationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const donations = await listDonationRecords(parsed.data.search, parsed.data.status, parsed.data.campaignId, parsed.data.limit ?? 50);
  res.json(ListDonationsResponse.parse(donations));
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [donation] = await db
      .insert(donationsTable)
      .values({
        donorId: parsed.data.donorId,
        amountCents: Math.round(parsed.data.amount * 100),
        frequency: parsed.data.frequency,
        status: parsed.data.status,
        campaignId: parsed.data.campaignId,
        donatedAt: parsed.data.donatedAt,
        receiptNumber: `WH-${Date.now().toString().slice(-8)}`,
      })
      .returning();
    await addActivity("donation", "Donation recorded", `₹${parsed.data.amount.toLocaleString("en-IN")} donation added to the ledger.`);
    res.status(201).json(await getDonationRecord(donation.id));
  } catch (error) {
    handleCrudError(error, res, "Donation");
  }
});

router.get("/donations/:id", async (req, res): Promise<void> => {
  const params = GetDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const donation = await getDonationRecord(params.data.id);
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }
  res.json(donation);
});

router.patch("/donations/:id", async (req, res): Promise<void> => {
  const params = UpdateDonationParams.safeParse(req.params);
  const body = UpdateDonationBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const update = {
      ...(body.data.amount === undefined ? {} : { amountCents: Math.round(body.data.amount * 100) }),
      ...(body.data.frequency === undefined ? {} : { frequency: body.data.frequency }),
      ...(body.data.status === undefined ? {} : { status: body.data.status }),
      ...(body.data.campaignId === undefined ? {} : { campaignId: body.data.campaignId }),
      ...(body.data.donatedAt === undefined ? {} : { donatedAt: body.data.donatedAt }),
    };
    const [donation] = await db.update(donationsTable).set(update).where(eq(donationsTable.id, params.data.id)).returning();
    if (!donation) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }
    res.json(await getDonationRecord(donation.id));
  } catch (error) {
    handleCrudError(error, res, "Donation");
  }
});

router.delete("/donations/:id", async (req, res): Promise<void> => {
  const params = DeleteDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [donation] = await db.delete(donationsTable).where(eq(donationsTable.id, params.data.id)).returning();
    if (!donation) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Donation");
  }
});

router.get("/campaigns", async (req, res): Promise<void> => {
  const parsed = ListCampaignsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const campaigns = (await listCampaignRecords(parsed.data.search, parsed.data.status, parsed.data.limit ?? 50)).filter(Boolean);
  res.json(ListCampaignsResponse.parse(campaigns));
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [campaign] = await db.insert(campaignsTable).values({
      ...parsed.data,
      goalCents: Math.round(parsed.data.goal * 100),
    }).returning();
    await addActivity("campaign", "Campaign created", `${campaign.name} was added to the campaign portfolio.`);
    res.status(201).json(await getCampaignRecord(campaign.id));
  } catch (error) {
    handleCrudError(error, res, "Campaign");
  }
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const campaign = await getCampaignRecord(params.data.id);
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json(campaign);
});

router.patch("/campaigns/:id", async (req, res): Promise<void> => {
  const params = UpdateCampaignParams.safeParse(req.params);
  const body = UpdateCampaignBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const update = {
      ...body.data,
      ...(body.data.goal === undefined ? {} : { goalCents: Math.round(body.data.goal * 100) }),
    };
    delete (update as { goal?: number }).goal;
    const [campaign] = await db.update(campaignsTable).set(update).where(eq(campaignsTable.id, params.data.id)).returning();
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    res.json(await getCampaignRecord(campaign.id));
  } catch (error) {
    handleCrudError(error, res, "Campaign");
  }
});

router.delete("/campaigns/:id", async (req, res): Promise<void> => {
  const params = DeleteCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [campaign] = await db.delete(campaignsTable).where(eq(campaignsTable.id, params.data.id)).returning();
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Campaign");
  }
});

router.get("/impact", async (_req, res): Promise<void> => {
  const [raised] = await db
    .select({ value: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)` })
    .from(donationsTable)
    .where(eq(donationsTable.status, "completed"));
  const total = currency(raised?.value);
  const response = {
    acresProtected: Math.max(1, Math.round(total / 1250)),
    rescueMissions: 48,
    activeGuards: 38,
    communityPrograms: 4,
    allocation: [
      { label: "Species protection", amount: Math.round(total * 0.42), percent: 42 },
      { label: "Habitat restoration", amount: Math.round(total * 0.31), percent: 31 },
      { label: "Community programs", amount: Math.round(total * 0.19), percent: 19 },
      { label: "Operations", amount: Math.round(total * 0.08), percent: 8 },
    ],
  };
  res.json(GetImpactSummaryResponse.parse(response));
});

router.get("/rescue-cases", async (req, res): Promise<void> => {
  const parsed = parseRescueCaseListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const records = await listRescueCases(parsed.data);
    res.json(records);
  } catch (error) {
    handleCrudError(error, res, "Rescue case");
  }
});

router.post("/rescue-cases", async (req, res): Promise<void> => {
  const body = insertRescueCaseSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const validationError = validateRescueCaseBody(body.data as Record<string, unknown>);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const [caseRecord] = await db.insert(rescueCasesTable).values(body.data).returning();
    if (!caseRecord) {
      res.status(500).json({ error: "Failed to create rescue case" });
      return;
    }

    await db
      .insert(rescueCaseStatusHistoryTable)
      .values({
        rescueCaseId: caseRecord.id,
        previousStatus: null,
        newStatus: caseRecord.status,
        changedBy: caseRecord.assignedEmployeeId ?? caseRecord.reportedBy,
        reason: "Case created",
      });

    res.status(201).json(caseRecord);
  } catch (error) {
    handleCrudError(error, res, "Rescue case");
  }
});

router.get("/rescue-cases/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  res.json(caseRecord);
});

router.patch("/rescue-cases/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueCaseSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const validationError = validateRescueCaseBody(body.data as Record<string, unknown>);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  try {
    const existingCase = await getRescueCaseRecord(params.data.id);
    if (!existingCase) {
      res.status(404).json({ error: "Rescue case not found" });
      return;
    }

    const update = { ...body.data };
    const [caseRecord] = await db
      .update(rescueCasesTable)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(rescueCasesTable.id, params.data.id))
      .returning();

    if (!caseRecord) {
      res.status(404).json({ error: "Rescue case not found" });
      return;
    }

    if (body.data.status && body.data.status !== existingCase.status) {
      await db.insert(rescueCaseStatusHistoryTable).values({
        rescueCaseId: caseRecord.id,
        previousStatus: existingCase.status,
        newStatus: caseRecord.status,
        changedBy: body.data.assignedEmployeeId ?? existingCase.assignedEmployeeId ?? existingCase.reportedBy,
        reason: "Status updated",
      });
    }

    res.json(caseRecord);
  } catch (error) {
    handleCrudError(error, res, "Rescue case");
  }
});

router.delete("/rescue-cases/:id", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [caseRecord] = await db.delete(rescueCasesTable).where(eq(rescueCasesTable.id, params.data.id)).returning();
    if (!caseRecord) {
      res.status(404).json({ error: "Rescue case not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Rescue case");
  }
});

router.get("/rescue-cases/:id/notes", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  const notes = await listRescueCaseNotes(params.data.id);
  res.json(notes);
});

router.post("/rescue-cases/:id/notes", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueCaseNoteSchema.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  try {
    const [note] = await db
      .insert(rescueCaseNotesTable)
      .values({
        ...body.data,
        rescueCaseId: params.data.id,
      })
      .returning();
    res.status(201).json(note);
  } catch (error) {
    handleCrudError(error, res, "Rescue case note");
  }
});

router.patch("/rescue-cases/:id/notes/:noteId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueCaseNoteSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [note] = await db
      .update(rescueCaseNotesTable)
      .set({
        ...body.data,
        updatedAt: new Date(),
      })
      .where(eq(rescueCaseNotesTable.id, params.data.id))
      .returning();

    if (!note) {
      res.status(404).json({ error: "Rescue case note not found" });
      return;
    }

    res.json(note);
  } catch (error) {
    handleCrudError(error, res, "Rescue case note");
  }
});

router.delete("/rescue-cases/:id/notes/:noteId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [note] = await db.delete(rescueCaseNotesTable).where(eq(rescueCaseNotesTable.id, params.data.id)).returning();
    if (!note) {
      res.status(404).json({ error: "Rescue case note not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Rescue case note");
  }
});

router.get("/rescue-cases/:id/history", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  const history = await listRescueCaseStatusHistory(params.data.id);
  res.json(history);
});

router.get("/rescue-cases/:id/medical-records", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  const records = await listAnimalMedicalRecords(params.data.id);
  res.json(records);
});

router.post("/rescue-cases/:id/medical-records", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertAnimalMedicalRecordSchema.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  try {
    const [record] = await db
      .insert(animalMedicalRecordsTable)
      .values({
        ...body.data,
        rescueCaseId: params.data.id,
      })
      .returning();
    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Medical record");
  }
});

router.patch("/rescue-cases/:id/medical-records/:recordId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertAnimalMedicalRecordSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [record] = await db
      .update(animalMedicalRecordsTable)
      .set({
        ...body.data,
        updatedAt: new Date(),
      })
      .where(eq(animalMedicalRecordsTable.id, params.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Medical record not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Medical record");
  }
});

router.delete("/rescue-cases/:id/medical-records/:recordId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [record] = await db.delete(animalMedicalRecordsTable).where(eq(animalMedicalRecordsTable.id, params.data.id)).returning();
    if (!record) {
      res.status(404).json({ error: "Medical record not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Medical record");
  }
});

router.get("/rescue-cases/:id/expenses", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  const expenses = await listRescueExpenses(params.data.id);
  res.json(expenses);
});

router.post("/rescue-cases/:id/expenses", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueExpenseSchema.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  try {
    const [expense] = await db
      .insert(rescueExpensesTable)
      .values({
        ...body.data,
        rescueCaseId: params.data.id,
      })
      .returning();
    res.status(201).json(expense);
  } catch (error) {
    handleCrudError(error, res, "Rescue expense");
  }
});

router.patch("/rescue-cases/:id/expenses/:expenseId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueExpenseSchema.partial().safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [expense] = await db
      .update(rescueExpensesTable)
      .set(body.data)
      .where(eq(rescueExpensesTable.id, params.data.id))
      .returning();

    if (!expense) {
      res.status(404).json({ error: "Rescue expense not found" });
      return;
    }

    res.json(expense);
  } catch (error) {
    handleCrudError(error, res, "Rescue expense");
  }
});

router.delete("/rescue-cases/:id/expenses/:expenseId", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [expense] = await db.delete(rescueExpensesTable).where(eq(rescueExpensesTable.id, params.data.id)).returning();
    if (!expense) {
      res.status(404).json({ error: "Rescue expense not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    handleCrudError(error, res, "Rescue expense");
  }
});

router.post("/rescue-cases/:id/assign", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  const body = insertRescueCaseSchema.pick({ assignedEmployeeId: true }).safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const caseRecord = await getRescueCaseRecord(params.data.id);
  if (!caseRecord) {
    res.status(404).json({ error: "Rescue case not found" });
    return;
  }

  if (!body.data.assignedEmployeeId) {
    res.status(400).json({ error: "assignedEmployeeId is required" });
    return;
  }

  try {
    const [updated] = await db
      .update(rescueCasesTable)
      .set({
        assignedEmployeeId: body.data.assignedEmployeeId,
        status: "assigned",
        updatedAt: new Date(),
      })
      .where(eq(rescueCasesTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Rescue case not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    handleCrudError(error, res, "Rescue case assignment");
  }
});

router.delete("/rescue-cases/:id/assign", async (req, res): Promise<void> => {
  const params = IdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [caseRecord] = await db
      .update(rescueCasesTable)
      .set({ assignedEmployeeId: null, status: "reported", updatedAt: new Date() })
      .where(eq(rescueCasesTable.id, params.data.id))
      .returning();

    if (!caseRecord) {
      res.status(404).json({ error: "Rescue case not found" });
      return;
    }

    res.json(caseRecord);
  } catch (error) {
    handleCrudError(error, res, "Rescue case assignment");
  }
});

router.get("/rescue-cases/assigned/:employeeId", async (req, res): Promise<void> => {
  const employeeId = typeof req.params.employeeId === "string" ? req.params.employeeId.trim() : "";
  if (!employeeId) {
    res.status(400).json({ error: "Employee ID is required" });
    return;
  }

  const cases = await db
    .select()
    .from(rescueCasesTable)
    .where(eq(rescueCasesTable.assignedEmployeeId, employeeId))
    .orderBy(desc(rescueCasesTable.updatedAt));

  res.json(cases);
});

router.get("/rescue-dashboard", async (_req, res): Promise<void> => {
  const dashboard = await getRescueDashboard();
  res.json(dashboard);
});

const ADOPTION_STATUS_VALUES = ["pending_review", "approved", "rejected", "on_hold", "completed"] as const;
const SPONSORSHIP_STATUS_VALUES = ["active", "paused", "cancelled", "expired"] as const;
const SPONSORSHIP_FREQUENCY_VALUES = ["monthly", "quarterly", "annual", "one_time"] as const;

const parseOptionalStringValue = (value: unknown) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

const parseOptionalIntegerValue = (value: unknown) => {
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }

  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  return undefined;
};

const parseOptionalDateValue = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseAdoptionListQuery = (query: Record<string, unknown>) => {
  const limitResult = parseLimitQuery(query);
  if (!limitResult.success) {
    return limitResult;
  }

  const offsetValue = typeof query.offset === "string" ? Number(query.offset) : typeof query.offset === "number" ? query.offset : 0;

  return {
    success: true as const,
    data: {
      search: parseOptionalStringValue(query.search),
      status: parseOptionalStringValue(query.status),
      animalId: parseOptionalIntegerValue(query.animalId),
      limit: limitResult.data.limit,
      offset: Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0,
      sort: parseOptionalStringValue(query.sort),
    },
  };
};

const parseSponsorshipListQuery = (query: Record<string, unknown>) => {
  const limitResult = parseLimitQuery(query);
  if (!limitResult.success) {
    return limitResult;
  }

  const offsetValue = typeof query.offset === "string" ? Number(query.offset) : typeof query.offset === "number" ? query.offset : 0;

  return {
    success: true as const,
    data: {
      search: parseOptionalStringValue(query.search),
      animalId: parseOptionalIntegerValue(query.animalId),
      donorId: parseOptionalIntegerValue(query.donorId),
      planId: parseOptionalIntegerValue(query.planId),
      status: parseOptionalStringValue(query.status),
      frequency: parseOptionalStringValue(query.frequency),
      fromDate: parseOptionalDateValue(query.fromDate),
      toDate: parseOptionalDateValue(query.toDate),
      limit: limitResult.data.limit,
      offset: Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0,
      sort: parseOptionalStringValue(query.sort),
    },
  };
};

router.get("/adoptions", async (req, res): Promise<void> => {
  const parsed = parseAdoptionListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const records = await listAdoptionApplications(parsed.data);
    res.json(records);
  } catch (error) {
    handleCrudError(error, res, "Adoption applications");
  }
});

router.post("/adoptions", async (req, res): Promise<void> => {
  const payload = {
    ...req.body,
    applicationNumber: typeof req.body?.applicationNumber === "string" && req.body.applicationNumber.trim().length > 0
      ? req.body.applicationNumber.trim()
      : `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };

  const parsed = insertAdoptionApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const existing = await db
      .select({ id: adoptionApplicationsTable.id })
      .from(adoptionApplicationsTable)
      .where(
        and(
          eq(adoptionApplicationsTable.animalId, Number(parsed.data.animalId)),
          eq(adoptionApplicationsTable.applicantName, String(parsed.data.applicantName)),
          eq(adoptionApplicationsTable.email, String(parsed.data.email)),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Duplicate adoption application already exists for this applicant and animal" });
      return;
    }

    const [record] = await db
      .insert(adoptionApplicationsTable)
      .values({
        ...parsed.data,
        applicationDate: parsed.data.applicationDate ?? new Date(),
        status: parsed.data.status ?? "pending_review",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.get("/adoptions/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .select({
        application: adoptionApplicationsTable,
        animalName: animalsTable.name,
        animalSpecies: animalsTable.species,
      })
      .from(adoptionApplicationsTable)
      .innerJoin(animalsTable, eq(adoptionApplicationsTable.animalId, animalsTable.id))
      .where(eq(adoptionApplicationsTable.id, parsed.data.id));

    if (!record) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    res.json({ ...record.application, animalName: record.animalName, animalSpecies: record.animalSpecies });
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.patch("/adoptions/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [existing] = await db.select().from(adoptionApplicationsTable).where(eq(adoptionApplicationsTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status : existing.status;
    if (!ADOPTION_STATUS_VALUES.includes(nextStatus as (typeof ADOPTION_STATUS_VALUES)[number])) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const updates: Record<string, unknown> = {
      ...req.body,
      updatedAt: new Date(),
      reviewedAt: req.body?.reviewedAt ? new Date(req.body.reviewedAt) : existing.reviewedAt,
    };

    if (req.body?.status) {
      updates.reviewedAt = new Date();
    }

    const [record] = await db
      .update(adoptionApplicationsTable)
      .set(updates)
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.delete("/adoptions/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [result] = await db
      .delete(adoptionApplicationsTable)
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning({ id: adoptionApplicationsTable.id });

    if (!result) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.post("/adoptions/:id/approve", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [existing] = await db.select().from(adoptionApplicationsTable).where(eq(adoptionApplicationsTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    const [record] = await db
      .update(adoptionApplicationsTable)
      .set({
        status: "approved",
        reviewedBy: typeof req.body?.reviewedBy === "string" ? req.body.reviewedBy : existing.reviewedBy ?? "staff",
        reviewNotes: typeof req.body?.reviewNotes === "string" ? req.body.reviewNotes : existing.reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.post("/adoptions/:id/reject", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [existing] = await db.select().from(adoptionApplicationsTable).where(eq(adoptionApplicationsTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    const [record] = await db
      .update(adoptionApplicationsTable)
      .set({
        status: "rejected",
        reviewedBy: typeof req.body?.reviewedBy === "string" ? req.body.reviewedBy : existing.reviewedBy ?? "staff",
        reviewNotes: typeof req.body?.reviewNotes === "string" ? req.body.reviewNotes : existing.reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.post("/adoptions/:id/hold", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [existing] = await db.select().from(adoptionApplicationsTable).where(eq(adoptionApplicationsTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    const [record] = await db
      .update(adoptionApplicationsTable)
      .set({
        status: "on_hold",
        reviewedBy: typeof req.body?.reviewedBy === "string" ? req.body.reviewedBy : existing.reviewedBy ?? "staff",
        reviewNotes: typeof req.body?.reviewNotes === "string" ? req.body.reviewNotes : existing.reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.post("/adoptions/:id/assign-reviewer", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  const reviewedBy = parseOptionalStringValue(req.body?.reviewedBy);
  if (!reviewedBy) {
    res.status(400).json({ error: "reviewedBy is required" });
    return;
  }

  try {
    const [record] = await db
      .update(adoptionApplicationsTable)
      .set({ reviewedBy, updatedAt: new Date() })
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.post("/adoptions/:id/review-notes", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  const reviewNotes = parseOptionalStringValue(req.body?.reviewNotes);
  if (!reviewNotes) {
    res.status(400).json({ error: "reviewNotes is required" });
    return;
  }

  try {
    const [record] = await db
      .update(adoptionApplicationsTable)
      .set({ reviewNotes, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(adoptionApplicationsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Adoption application not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption application");
  }
});

router.get("/adoption-dashboard", async (_req, res): Promise<void> => {
  const dashboard = await getAdoptionDashboard();
  res.json(dashboard);
});

router.get("/animals/adoption-list", async (req, res): Promise<void> => {
  const parsed = parseAdoptionListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const records = await listAnimalAdoptionOptions({
      ...parsed.data,
      status: parsed.data.status,
    });

    const filtered = records.filter((animal) => animal.adoptionAvailable);
    res.json(filtered);
  } catch (error) {
    handleCrudError(error, res, "Animal adoption list");
  }
});

router.get("/animals/sponsorship-list", async (req, res): Promise<void> => {
  const parsed = parseAdoptionListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const records = await listAnimalAdoptionOptions({
      ...parsed.data,
      status: parsed.data.status,
    });

    const filtered = records.filter((animal) => animal.sponsorshipAvailable);
    res.json(filtered);
  } catch (error) {
    handleCrudError(error, res, "Animal sponsorship list");
  }
});

router.get("/adoption-histories", async (req, res): Promise<void> => {
  const parsed = parseSponsorshipListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(adoptionHistoriesTable)
      .where(
        and(
          parsed.data.animalId ? eq(adoptionHistoriesTable.animalId, parsed.data.animalId) : undefined,
          parsed.data.status ? eq(adoptionHistoriesTable.status, parsed.data.status) : undefined,
        ),
      )
      .orderBy(desc(adoptionHistoriesTable.adoptionDate))
      .limit(parsed.data.limit)
      .offset(parsed.data.offset);

    res.json(rows);
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.post("/adoption-histories", async (req, res): Promise<void> => {
  const parsed = insertAdoptionHistorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [record] = await db
      .insert(adoptionHistoriesTable)
      .values({
        ...parsed.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.get("/adoption-histories/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db.select().from(adoptionHistoriesTable).where(eq(adoptionHistoriesTable.id, parsed.data.id));
    if (!record) {
      res.status(404).json({ error: "Adoption history not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.patch("/adoption-histories/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(adoptionHistoriesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(adoptionHistoriesTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Adoption history not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.delete("/adoption-histories/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .delete(adoptionHistoriesTable)
      .where(eq(adoptionHistoriesTable.id, parsed.data.id))
      .returning({ id: adoptionHistoriesTable.id });

    if (!record) {
      res.status(404).json({ error: "Adoption history not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.get("/animals/:animalId/adoption-history", async (req, res): Promise<void> => {
  const animalId = parseOptionalIntegerValue(req.params.animalId);
  if (!animalId) {
    res.status(400).json({ error: "Invalid animalId" });
    return;
  }

  try {
    const history = await listAdoptionHistoryByAnimalId(animalId);
    res.json(history);
  } catch (error) {
    handleCrudError(error, res, "Adoption history");
  }
});

router.get("/sponsorship-plans", async (req, res): Promise<void> => {
  const limitResult = parseLimitQuery(req.query as Record<string, unknown>);
  if (!limitResult.success) {
    res.status(400).json({ error: limitResult.error });
    return;
  }

  try {
    const records = await db
      .select()
      .from(sponsorshipPlansTable)
      .orderBy(desc(sponsorshipPlansTable.createdAt))
      .limit(limitResult.data.limit);

    res.json(records);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship plan");
  }
});

router.post("/sponsorship-plans", async (req, res): Promise<void> => {
  const parsed = insertSponsorshipPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [record] = await db
      .insert(sponsorshipPlansTable)
      .values({
        ...parsed.data,
        amount: Number(parsed.data.amount ?? 0),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship plan");
  }
});

router.get("/sponsorship-plans/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db.select().from(sponsorshipPlansTable).where(eq(sponsorshipPlansTable.id, parsed.data.id));
    if (!record) {
      res.status(404).json({ error: "Sponsorship plan not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship plan");
  }
});

router.patch("/sponsorship-plans/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipPlansTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(sponsorshipPlansTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship plan not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship plan");
  }
});

router.delete("/sponsorship-plans/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .delete(sponsorshipPlansTable)
      .where(eq(sponsorshipPlansTable.id, parsed.data.id))
      .returning({ id: sponsorshipPlansTable.id });

    if (!record) {
      res.status(404).json({ error: "Sponsorship plan not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    handleCrudError(error, res, "Sponsorship plan");
  }
});

router.get("/sponsorships", async (req, res): Promise<void> => {
  const parsed = parseSponsorshipListQuery(req.query as Record<string, unknown>);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const records = await listSponsorships(parsed.data);
    res.json(records);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships", async (req, res): Promise<void> => {
  const payload = {
    ...req.body,
    sponsorshipNumber:
      typeof req.body?.sponsorshipNumber === "string" && req.body.sponsorshipNumber.trim().length > 0
        ? req.body.sponsorshipNumber.trim()
        : `SP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };

  const parsed = insertSponsorshipSchema.safeParse(payload);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [record] = await db
      .insert(sponsorshipsTable)
      .values({
        ...parsed.data,
        amount: Number(parsed.data.amount ?? 0),
        totalContributed: Number(parsed.data.totalContributed ?? 0),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.get("/sponsorships/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db.select().from(sponsorshipsTable).where(eq(sponsorshipsTable.id, parsed.data.id));
    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.patch("/sponsorships/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.delete("/sponsorships/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .delete(sponsorshipsTable)
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning({ id: sponsorshipsTable.id });

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/activate", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({ status: "active", nextPaymentDate: req.body?.nextPaymentDate ? new Date(req.body.nextPaymentDate) : new Date(), updatedAt: new Date() })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/pause", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/resume", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/cancel", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({ status: "cancelled", endDate: req.body?.endDate ? new Date(req.body.endDate) : new Date(), updatedAt: new Date() })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/renew", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [record] = await db
      .update(sponsorshipsTable)
      .set({
        status: "active",
        startDate: req.body?.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body?.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        nextPaymentDate: req.body?.nextPaymentDate ? new Date(req.body.nextPaymentDate) : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sponsorshipsTable.id, parsed.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship");
  }
});

router.post("/sponsorships/:id/payments", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  const paymentPayload = { ...req.body, sponsorshipId: parsed.data.id };
  const paymentParsed = insertSponsorshipPaymentSchema.safeParse(paymentPayload);
  if (!paymentParsed.success) {
    res.status(400).json({ error: paymentParsed.error.message });
    return;
  }

  try {
    const [sponsorship] = await db.select().from(sponsorshipsTable).where(eq(sponsorshipsTable.id, parsed.data.id));
    if (!sponsorship) {
      res.status(404).json({ error: "Sponsorship not found" });
      return;
    }

    const [record] = await db
      .insert(sponsorshipPaymentsTable)
      .values({
        ...paymentParsed.data,
        amount: Number(paymentParsed.data.amount ?? 0),
        paymentDate: paymentParsed.data.paymentDate ?? new Date(),
        createdAt: new Date(),
      })
      .returning();

    if (paymentParsed.data.status === "completed") {
      const totalContributed = Number(sponsorship.totalContributed ?? 0) + Number(paymentParsed.data.amount ?? 0);
      await db
        .update(sponsorshipsTable)
        .set({ totalContributed, updatedAt: new Date() })
        .where(eq(sponsorshipsTable.id, parsed.data.id));
    }

    res.status(201).json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship payment");
  }
});

router.get("/sponsorships/:id/payments", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const records = await listSponsorshipPaymentsBySponsorshipId(parsed.data.id);
    res.json(records);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship payment");
  }
});

router.patch("/sponsorship-payments/:id", async (req, res): Promise<void> => {
  const parsed = parseIdParam(req.params);
  if (!parsed.success) {
    res.status(400).json(parsed.error);
    return;
  }

  try {
    const [existing] = await db.select().from(sponsorshipPaymentsTable).where(eq(sponsorshipPaymentsTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Sponsorship payment not found" });
      return;
    }

    const nextStatus = typeof req.body?.status === "string" ? req.body.status : existing.status;
    const nextAmount = typeof req.body?.amount === "number" ? req.body.amount : existing.amount;

    const [record] = await db
      .update(sponsorshipPaymentsTable)
      .set({ ...req.body, amount: nextAmount, updatedAt: new Date() })
      .where(eq(sponsorshipPaymentsTable.id, parsed.data.id))
      .returning();

    if (nextStatus === "completed" && existing.status !== "completed") {
      const [sponsorship] = await db.select().from(sponsorshipsTable).where(eq(sponsorshipsTable.id, existing.sponsorshipId));
      if (sponsorship) {
        await db
          .update(sponsorshipsTable)
          .set({ totalContributed: Number(sponsorship.totalContributed ?? 0) + Number(nextAmount ?? 0), updatedAt: new Date() })
          .where(eq(sponsorshipsTable.id, existing.sponsorshipId));
      }
    }

    res.json(record);
  } catch (error) {
    handleCrudError(error, res, "Sponsorship payment");
  }
});

router.get("/sponsorship-dashboard", async (_req, res): Promise<void> => {
  const dashboard = await getSponsorshipDashboard();
  res.json(dashboard);
});

router.get("/reports/adoptions", async (req, res): Promise<void> => {
  const limitResult = parseLimitQuery(req.query as Record<string, unknown>);
  if (!limitResult.success) {
    res.status(400).json({ error: limitResult.error });
    return;
  }

  const animalId = parseOptionalIntegerValue(req.query.animalId);
  const status = parseOptionalStringValue(req.query.status);
  const startDate = parseOptionalDateValue(req.query.startDate);
  const endDate = parseOptionalDateValue(req.query.endDate);

  try {
    const rows = await db
      .select({
        applicationNumber: adoptionApplicationsTable.applicationNumber,
        animalId: adoptionApplicationsTable.animalId,
        applicantName: adoptionApplicationsTable.applicantName,
        email: adoptionApplicationsTable.email,
        status: adoptionApplicationsTable.status,
        applicationDate: adoptionApplicationsTable.applicationDate,
        reviewedAt: adoptionApplicationsTable.reviewedAt,
      })
      .from(adoptionApplicationsTable)
      .where(
        and(
          animalId ? eq(adoptionApplicationsTable.animalId, animalId) : undefined,
          status ? eq(adoptionApplicationsTable.status, status) : undefined,
          startDate ? sql`${adoptionApplicationsTable.applicationDate} >= ${startDate}` : undefined,
          endDate ? sql`${adoptionApplicationsTable.applicationDate} <= ${endDate}` : undefined,
        ),
      )
      .orderBy(desc(adoptionApplicationsTable.applicationDate))
      .limit(limitResult.data.limit);

    res.json({ generatedAt: new Date(), records: rows });
  } catch (error) {
    handleCrudError(error, res, "Adoption report");
  }
});

router.get("/reports/sponsorships", async (req, res): Promise<void> => {
  const limitResult = parseLimitQuery(req.query as Record<string, unknown>);
  if (!limitResult.success) {
    res.status(400).json({ error: limitResult.error });
    return;
  }

  const animalId = parseOptionalIntegerValue(req.query.animalId);
  const status = parseOptionalStringValue(req.query.status);
  const startDate = parseOptionalDateValue(req.query.startDate);
  const endDate = parseOptionalDateValue(req.query.endDate);

  try {
    const rows = await db
      .select({
        sponsorshipNumber: sponsorshipsTable.sponsorshipNumber,
        animalId: sponsorshipsTable.animalId,
        donorId: sponsorshipsTable.donorId,
        status: sponsorshipsTable.status,
        amount: sponsorshipsTable.amount,
        totalContributed: sponsorshipsTable.totalContributed,
        startDate: sponsorshipsTable.startDate,
        endDate: sponsorshipsTable.endDate,
      })
      .from(sponsorshipsTable)
      .where(
        and(
          animalId ? eq(sponsorshipsTable.animalId, animalId) : undefined,
          status ? eq(sponsorshipsTable.status, status) : undefined,
          startDate ? sql`${sponsorshipsTable.startDate} >= ${startDate}` : undefined,
          endDate ? sql`${sponsorshipsTable.startDate} <= ${endDate}` : undefined,
        ),
      )
      .orderBy(desc(sponsorshipsTable.startDate))
      .limit(limitResult.data.limit);

    res.json({ generatedAt: new Date(), records: rows });
  } catch (error) {
    handleCrudError(error, res, "Sponsorship report");
  }
});

export default router;