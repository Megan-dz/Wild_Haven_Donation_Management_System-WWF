import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, activityTable, campaignsTable, donationsTable, donorsTable } from "@workspace/db";
import {
  CreateCampaignBody,
  CreateDonorBody,
  CreateDonationBody,
  DeleteCampaignParams,
  DeleteDonorParams,
  DeleteDonationParams,
  GetCampaignParams,
  GetCurrentStaffResponse,
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
  getDonorRecord,
  getDonationRecord,
  listCampaignRecords,
  listDonationRecords,
  listDonorRecords,
} from "../lib/portal-data";

const router: IRouter = Router();
router.use(requireAuth);

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
  const [donor] = await db.insert(donorsTable).values(parsed.data).returning();
  await addActivity("donor", "New donor added", `${donor.name} was added to the donor directory.`);
  res.status(201).json(await getDonorRecord(donor.id));
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
  const [donor] = await db.update(donorsTable).set(body.data).where(eq(donorsTable.id, params.data.id)).returning();
  if (!donor) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }
  res.json(await getDonorRecord(donor.id));
});

router.delete("/donors/:id", async (req, res): Promise<void> => {
  const params = DeleteDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [donor] = await db.delete(donorsTable).where(eq(donorsTable.id, params.data.id)).returning();
  if (!donor) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }
  res.sendStatus(204);
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
});

router.delete("/donations/:id", async (req, res): Promise<void> => {
  const params = DeleteDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [donation] = await db.delete(donationsTable).where(eq(donationsTable.id, params.data.id)).returning();
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }
  res.sendStatus(204);
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
  const [campaign] = await db.insert(campaignsTable).values({
    ...parsed.data,
    goalCents: Math.round(parsed.data.goal * 100),
  }).returning();
  await addActivity("campaign", "Campaign created", `${campaign.name} was added to the campaign portfolio.`);
  res.status(201).json(await getCampaignRecord(campaign.id));
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
});

router.delete("/campaigns/:id", async (req, res): Promise<void> => {
  const params = DeleteCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [campaign] = await db.delete(campaignsTable).where(eq(campaignsTable.id, params.data.id)).returning();
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.sendStatus(204);
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