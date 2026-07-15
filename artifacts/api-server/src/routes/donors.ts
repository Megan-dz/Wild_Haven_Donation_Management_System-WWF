import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, donorsTable, donationsTable, campaignsTable } from "@workspace/db";
import {
  ListDonorsQueryParams,
  CreateDonorBody,
  GetDonorParams,
  UpdateDonorParams,
  UpdateDonorBody,
  GetDonorDonationsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/donors", async (req, res): Promise<void> => {
  const query = ListDonorsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(donorsTable)
    .where(
      query.data.search
        ? or(
            ilike(donorsTable.name, `%${query.data.search}%`),
            ilike(donorsTable.email, `%${query.data.search}%`),
          )
        : undefined,
    )
    .orderBy(donorsTable.createdAt);

  res.json(
    rows.map((r) => ({
      ...r,
      totalDonated: parseFloat(r.totalDonated),
      createdAt: r.createdAt.toISOString(),
      firstDonationAt: r.firstDonationAt?.toISOString() ?? null,
      lastDonationAt: r.lastDonationAt?.toISOString() ?? null,
    })),
  );
});

router.post("/donors", async (req, res): Promise<void> => {
  const parsed = CreateDonorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [donor] = await db
    .insert(donorsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      totalDonated: "0",
      donationCount: 0,
    })
    .returning();

  res.status(201).json({
    ...donor,
    totalDonated: parseFloat(donor.totalDonated),
    createdAt: donor.createdAt.toISOString(),
    firstDonationAt: null,
    lastDonationAt: null,
  });
});

router.get("/donors/:id", async (req, res): Promise<void> => {
  const params = GetDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [donor] = await db
    .select()
    .from(donorsTable)
    .where(eq(donorsTable.id, params.data.id))
    .limit(1);

  if (!donor) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }

  res.json({
    ...donor,
    totalDonated: parseFloat(donor.totalDonated),
    createdAt: donor.createdAt.toISOString(),
    firstDonationAt: donor.firstDonationAt?.toISOString() ?? null,
    lastDonationAt: donor.lastDonationAt?.toISOString() ?? null,
  });
});

router.patch("/donors/:id", async (req, res): Promise<void> => {
  const params = UpdateDonorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDonorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;

  const [updated] = await db
    .update(donorsTable)
    .set(updates)
    .where(eq(donorsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Donor not found" });
    return;
  }

  res.json({
    ...updated,
    totalDonated: parseFloat(updated.totalDonated),
    createdAt: updated.createdAt.toISOString(),
    firstDonationAt: updated.firstDonationAt?.toISOString() ?? null,
    lastDonationAt: updated.lastDonationAt?.toISOString() ?? null,
  });
});

router.get("/donors/:id/donations", async (req, res): Promise<void> => {
  const params = GetDonorDonationsParams.safeParse(req.params);
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
    .where(eq(donationsTable.donorId, params.data.id))
    .orderBy(donationsTable.createdAt);

  res.json(
    rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

export default router;
