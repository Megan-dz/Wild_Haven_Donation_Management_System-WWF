import { eq, sql } from "drizzle-orm";
import { db, campaignsTable, donationsTable, donorsTable } from "@workspace/db";

type DbExecutor = Pick<typeof db, "select" | "update">;

/**
 * Rebuild denormalized donor totals from completed donations.
 *
 * Keeping this as a reconciliation rather than applying deltas means edits,
 * status changes, and deletes all produce the same correct result.
 */
export async function refreshDonorAggregates(
  executor: DbExecutor,
  donorId: number,
): Promise<void> {
  const [stats] = await executor
    .select({
      totalDonated: sql<string>`COALESCE(SUM(CASE WHEN ${donationsTable.status} = 'completed' THEN ${donationsTable.amount} ELSE 0 END), 0)`,
      donationCount: sql<number>`COUNT(*) FILTER (WHERE ${donationsTable.status} = 'completed')`,
      firstDonationAt: sql<Date | null>`MIN(${donationsTable.createdAt}) FILTER (WHERE ${donationsTable.status} = 'completed')`,
      lastDonationAt: sql<Date | null>`MAX(${donationsTable.createdAt}) FILTER (WHERE ${donationsTable.status} = 'completed')`,
    })
    .from(donationsTable)
    .where(eq(donationsTable.donorId, donorId));

  await executor
    .update(donorsTable)
    .set({
      totalDonated: stats?.totalDonated ?? "0",
      donationCount: stats?.donationCount ?? 0,
      firstDonationAt: stats?.firstDonationAt ?? null,
      lastDonationAt: stats?.lastDonationAt ?? null,
    })
    .where(eq(donorsTable.id, donorId));
}

/**
 * Rebuild denormalized campaign totals from completed donations.
 */
export async function refreshCampaignAggregates(
  executor: DbExecutor,
  campaignId: number,
): Promise<void> {
  const [stats] = await executor
    .select({
      raisedAmount: sql<string>`COALESCE(SUM(CASE WHEN ${donationsTable.status} = 'completed' THEN ${donationsTable.amount} ELSE 0 END), 0)`,
      donorCount: sql<number>`COUNT(DISTINCT ${donationsTable.donorId}) FILTER (WHERE ${donationsTable.status} = 'completed' AND ${donationsTable.donorId} IS NOT NULL)`,
    })
    .from(donationsTable)
    .where(eq(donationsTable.campaignId, campaignId));

  await executor
    .update(campaignsTable)
    .set({
      raisedAmount: stats?.raisedAmount ?? "0",
      donorCount: stats?.donorCount ?? 0,
    })
    .where(eq(campaignsTable.id, campaignId));
}