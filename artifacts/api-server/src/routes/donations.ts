import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { db, donationsTable, campaignsTable, donorsTable } from "@workspace/db";
import {
  ListDonationsQueryParams,
  CreateDonationBody,
  GetDonationParams,
  UpdateDonationParams,
  UpdateDonationBody,
  DeleteDonationParams,
} from "@workspace/api-zod";

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

  const [donation] = await db
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

  // Update donor stats if donorId given
  if (donorId) {
    await db
      .update(donorsTable)
      .set({
        totalDonated: sql`total_donated + ${String(amount)}`,
        donationCount: sql`donation_count + 1`,
        lastDonationAt: sql`NOW()`,
        firstDonationAt: sql`COALESCE(first_donation_at, NOW())`,
      })
      .where(eq(donorsTable.id, donorId));
  }

  // Update campaign raised amount if status is completed
  if (campaignId && (status ?? "pending") === "completed") {
    await db
      .update(campaignsTable)
      .set({ raisedAmount: sql`raised_amount + ${String(amount)}` })
      .where(eq(campaignsTable.id, campaignId));
  }

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

  const updates: Record<string, unknown> = {};
  if (parsed.data.donorName !== undefined) updates.donorName = parsed.data.donorName;
  if (parsed.data.donorEmail !== undefined) updates.donorEmail = parsed.data.donorEmail;
  if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.paymentMethod !== undefined) updates.paymentMethod = parsed.data.paymentMethod;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.campaignId !== undefined) updates.campaignId = parsed.data.campaignId;

  const [updated] = await db
    .update(donationsTable)
    .set(updates)
    .where(eq(donationsTable.id, params.data.id))
    .returning();

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

  const [deleted] = await db
    .delete(donationsTable)
    .where(eq(donationsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
