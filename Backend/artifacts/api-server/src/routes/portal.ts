import { Router, type IRouter, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  activityTable,
  campaignsTable,
  conservationAreasTable,
  donationsTable,
  donorsTable,
  donationChallengesTable,
  insertConservationAreaSchema,
  insertDonationChallengeSchema,
  insertRecurringDonationSchema,
  recurringDonationsTable,
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

export default router;