import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, campaignsTable } from "@workspace/db";
import {
  ListCampaignsQueryParams,
  CreateCampaignBody,
  GetCampaignParams,
  UpdateCampaignParams,
  UpdateCampaignBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/campaigns", async (req, res): Promise<void> => {
  const query = ListCampaignsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(campaignsTable)
    .where(query.data.status ? eq(campaignsTable.status, query.data.status) : undefined)
    .orderBy(campaignsTable.createdAt);

  res.json(
    rows.map((r) => ({
      ...r,
      targetAmount: parseFloat(r.targetAmount),
      raisedAmount: parseFloat(r.raisedAmount),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [campaign] = await db
    .insert(campaignsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      species: parsed.data.species,
      targetAmount: String(parsed.data.targetAmount),
      raisedAmount: "0",
      donorCount: 0,
      status: parsed.data.status ?? "active",
      imageUrl: parsed.data.imageUrl ?? null,
      startDate: parsed.data.startDate ?? null,
      endDate: parsed.data.endDate ?? null,
    })
    .returning();

  res.status(201).json({
    ...campaign,
    targetAmount: parseFloat(campaign.targetAmount),
    raisedAmount: parseFloat(campaign.raisedAmount),
    createdAt: campaign.createdAt.toISOString(),
  });
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, params.data.id))
    .limit(1);

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json({
    ...campaign,
    targetAmount: parseFloat(campaign.targetAmount),
    raisedAmount: parseFloat(campaign.raisedAmount),
    createdAt: campaign.createdAt.toISOString(),
  });
});

router.patch("/campaigns/:id", async (req, res): Promise<void> => {
  const params = UpdateCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.species !== undefined) updates.species = parsed.data.species;
  if (parsed.data.targetAmount !== undefined) updates.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.startDate !== undefined) updates.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) updates.endDate = parsed.data.endDate;

  const [updated] = await db
    .update(campaignsTable)
    .set(updates)
    .where(eq(campaignsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json({
    ...updated,
    targetAmount: parseFloat(updated.targetAmount),
    raisedAmount: parseFloat(updated.raisedAmount),
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
