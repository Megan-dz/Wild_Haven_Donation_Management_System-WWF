import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, donationsTable, campaignsTable, donorsTable } from "@workspace/db";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [donationStats] = await db
    .select({
      totalDonations: count(donationsTable.id),
      totalAmount: sql<string>`COALESCE(SUM(CASE WHEN ${donationsTable.status} = 'completed' THEN ${donationsTable.amount} ELSE 0 END), 0)`,
    })
    .from(donationsTable);

  const [completedStats] = await db
    .select({ completedDonations: count(donationsTable.id) })
    .from(donationsTable)
    .where(eq(donationsTable.status, "completed"));

  const [pendingStats] = await db
    .select({ pendingDonations: count(donationsTable.id) })
    .from(donationsTable)
    .where(eq(donationsTable.status, "pending"));

  const [refundedStats] = await db
    .select({ refundedDonations: count(donationsTable.id) })
    .from(donationsTable)
    .where(eq(donationsTable.status, "refunded"));

  const [campaignStats] = await db
    .select({ totalCampaigns: count(campaignsTable.id) })
    .from(campaignsTable);

  const [activeCampaignStats] = await db
    .select({ activeCampaigns: count(campaignsTable.id) })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "active"));

  const [donorStats] = await db
    .select({ totalDonors: count(donorsTable.id) })
    .from(donorsTable);

  res.json({
    totalDonations: donationStats?.totalDonations ?? 0,
    totalAmount: parseFloat(donationStats?.totalAmount ?? "0"),
    completedDonations: completedStats?.completedDonations ?? 0,
    pendingDonations: pendingStats?.pendingDonations ?? 0,
    refundedDonations: refundedStats?.refundedDonations ?? 0,
    totalCampaigns: campaignStats?.totalCampaigns ?? 0,
    activeCampaigns: activeCampaignStats?.activeCampaigns ?? 0,
    totalDonors: donorStats?.totalDonors ?? 0,
  });
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const limit = query.data.limit ?? 10;

  const rows = await db
    .select({
      id: donationsTable.id,
      donorName: donationsTable.donorName,
      donorEmail: donationsTable.donorEmail,
      amount: donationsTable.amount,
      status: donationsTable.status,
      campaignName: campaignsTable.name,
      createdAt: donationsTable.createdAt,
    })
    .from(donationsTable)
    .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
    .orderBy(sql`${donationsTable.createdAt} DESC`)
    .limit(limit);

  res.json(
    rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/dashboard/monthly-totals", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      EXTRACT(MONTH FROM created_at)::int AS month,
      EXTRACT(YEAR FROM created_at)::int AS year,
      COALESCE(SUM(amount), 0)::float AS "totalAmount",
      COUNT(*)::int AS "donationCount"
    FROM donations
    WHERE status = 'completed'
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `);

  res.json(rows.rows);
});

export default router;
