import { Router, type IRouter } from "express";
import { eq, and, ilike, or } from "drizzle-orm";
import { db, donationsTable, campaignsTable, donorsTable } from "@workspace/db";
import {
  ListDonationsQueryParams,
  CreateDonationBody,
  GetDonationParams,
  UpdateDonationParams,
  UpdateDonationBody,
  DeleteDonationParams,
} from "@workspace/api-zod";
import {
  refreshCampaignAggregates,
  refreshDonorAggregates,
} from "../lib/donation-aggregates";

const router: IRouter = Router();

router.get("/donations", async (req, res): Promise<void> => {
  const query = ListDonationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { status, campaignId, search } = query.data;

  const rows = await db
    .select({
      id: donationsTable.id,
      donorId: donationsTable.donorId,
      campaignId: donationsTable.campaignId,
      campaignName: campaignsTable.name,
      donorName: donationsTable.donorName,
      donorEmail: donationsTable.donorEmail,
      amount: donationsTable.amount,
      status: donationsTable.status,
      paymentMethod: donationsTable.paymentMethod,
      notes: donationsTable.notes,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
    .where(
      and(
        status ? eq(donationsTable.status, status) : undefined,
        campaignId ? eq(donationsTable.campaignId, campaignId) : undefined,
        search
          ? or(
              ilike(donationsTable.donorName, `%${search}%`),
              ilike(donationsTable.donorEmail, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(donationsTable.createdAt);

  res.json(
    rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { donorId, campaignId, donorName, donorEmail, amount, status, paymentMethod, notes } =
    parsed.data;

  const donation = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(donationsTable)
      .values({
        donorId: donorId ?? null,
        campaignId: campaignId ?? null,
        donorName,
        donorEmail,
        amount: String(amount),
        status: status ?? "pending",
        paymentMethod: paymentMethod ?? null,
        notes: notes ?? null,
      })
      .returning();

    if (donorId) await refreshDonorAggregates(tx, donorId);
    if (campaignId) await refreshCampaignAggregates(tx, campaignId);
    return created;
  });

  const campaignRow = campaignId
    ? await db.select({ name: campaignsTable.name }).from(campaignsTable).where(eq(campaignsTable.id, campaignId)).limit(1)
    : [];

  res.status(201).json({
    ...donation,
    amount: parseFloat(donation.amount),
    campaignName: campaignRow[0]?.name ?? null,
    createdAt: donation.createdAt.toISOString(),
  });
});

router.get("/donations/:id", async (req, res): Promise<void> => {
  const params = GetDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: donationsTable.id,
      donorId: donationsTable.donorId,
      campaignId: donationsTable.campaignId,
      campaignName: campaignsTable.name,
      donorName: donationsTable.donorName,
      donorEmail: donationsTable.donorEmail,
      amount: donationsTable.amount,
      status: donationsTable.status,
      paymentMethod: donationsTable.paymentMethod,
      notes: donationsTable.notes,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
    .where(eq(donationsTable.id, params.data.id))
    .limit(1);

  if (!rows[0]) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.json({
    ...rows[0],
    amount: parseFloat(rows[0].amount),
    createdAt: rows[0].createdAt.toISOString(),
  });
});

router.patch("/donations/:id", async (req, res): Promise<void> => {
  const params = UpdateDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.id, params.data.id))
      .limit(1);

    if (!existing) return null;

    const updates: Record<string, unknown> = {};
    if (parsed.data.donorName !== undefined) updates.donorName = parsed.data.donorName;
    if (parsed.data.donorEmail !== undefined) updates.donorEmail = parsed.data.donorEmail;
    if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.paymentMethod !== undefined) updates.paymentMethod = parsed.data.paymentMethod;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
    if (parsed.data.campaignId !== undefined) updates.campaignId = parsed.data.campaignId;

    const [result] =
      Object.keys(updates).length === 0
        ? [existing]
        : await tx
            .update(donationsTable)
            .set(updates)
            .where(eq(donationsTable.id, params.data.id))
            .returning();

    if (existing.donorId) await refreshDonorAggregates(tx, existing.donorId);
    if (existing.campaignId) await refreshCampaignAggregates(tx, existing.campaignId);
    if (result?.campaignId && result.campaignId !== existing.campaignId) {
      await refreshCampaignAggregates(tx, result.campaignId);
    }

    return result;
  });

  if (!updated) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  const campaignRow = updated.campaignId
    ? await db.select({ name: campaignsTable.name }).from(campaignsTable).where(eq(campaignsTable.id, updated.campaignId)).limit(1)
    : [];

  res.json({
    ...updated,
    amount: parseFloat(updated.amount),
    campaignName: campaignRow[0]?.name ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/donations/:id", async (req, res): Promise<void> => {
  const params = DeleteDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deleted = await db.transaction(async (tx) => {
    const [removed] = await tx
      .delete(donationsTable)
      .where(eq(donationsTable.id, params.data.id))
      .returning();

    if (!removed) return null;
    if (removed.donorId) await refreshDonorAggregates(tx, removed.donorId);
    if (removed.campaignId) await refreshCampaignAggregates(tx, removed.campaignId);
    return removed;
  });

  if (!deleted) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
