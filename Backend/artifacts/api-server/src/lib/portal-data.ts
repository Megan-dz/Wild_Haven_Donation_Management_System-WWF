import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, activityTable, campaignsTable, donationsTable, donorsTable } from "@workspace/db";

export const currency = (cents: number | string | null | undefined) =>
  Math.round(Number(cents ?? 0)) / 100;

export async function getDonorRecord(id: number) {
  const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.id, id));
  if (!donor) return undefined;

  const [summary] = await db
    .select({
      totalGiven: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      donationCount: sql<number>`count(${donationsTable.id})`,
      lastGiftAt: sql<Date | null>`max(${donationsTable.donatedAt})`,
    })
    .from(donationsTable)
    .where(and(eq(donationsTable.donorId, id), eq(donationsTable.status, "completed")));

  return {
    id: donor.id,
    name: donor.name,
    email: donor.email,
    phone: donor.phone,
    city: donor.city,
    totalGiven: currency(summary?.totalGiven),
    donationCount: Number(summary?.donationCount ?? 0),
    lastGiftAt: summary?.lastGiftAt ?? null,
    createdAt: donor.createdAt,
  };
}

export async function listDonorRecords(search: string | undefined, limit: number) {
  const donors = await db
    .select()
    .from(donorsTable)
    .where(
      search
        ? or(ilike(donorsTable.name, `%${search}%`), ilike(donorsTable.email, `%${search}%`))
        : undefined,
    )
    .orderBy(desc(donorsTable.createdAt))
    .limit(limit);

  return Promise.all(donors.map((donor) => getDonorRecord(donor.id)));
}

export async function getCampaignRecord(id: number) {
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));
  if (!campaign) return undefined;

  const [summary] = await db
    .select({
      raised: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      supporters: sql<number>`count(distinct ${donationsTable.donorId})`,
    })
    .from(donationsTable)
    .where(and(eq(donationsTable.campaignId, id), eq(donationsTable.status, "completed")));

  return {
    id: campaign.id,
    name: campaign.name,
    species: campaign.species,
    location: campaign.location,
    description: campaign.description,
    goal: currency(campaign.goalCents),
    raised: currency(summary?.raised),
    status: campaign.status,
    supporters: Number(summary?.supporters ?? 0),
    createdAt: campaign.createdAt,
  };
}

export async function listCampaignRecords(search: string | undefined, status: string | undefined, limit: number) {
  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(
      and(
        search
          ? or(ilike(campaignsTable.name, `%${search}%`), ilike(campaignsTable.species, `%${search}%`))
          : undefined,
        status ? eq(campaignsTable.status, status) : undefined,
      ),
    )
    .orderBy(desc(campaignsTable.createdAt))
    .limit(limit);
  return Promise.all(campaigns.map((campaign) => getCampaignRecord(campaign.id)));
}

export async function getDonationRecord(id: number) {
  const [row] = await db
    .select({
      donation: donationsTable,
      donorName: donorsTable.name,
      campaignName: campaignsTable.name,
    })
    .from(donationsTable)
    .innerJoin(donorsTable, eq(donationsTable.donorId, donorsTable.id))
    .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
    .where(eq(donationsTable.id, id));

  if (!row) return undefined;
  return {
    id: row.donation.id,
    donorId: row.donation.donorId,
    donorName: row.donorName,
    amount: currency(row.donation.amountCents),
    currency: row.donation.currency,
    frequency: row.donation.frequency,
    status: row.donation.status,
    campaignId: row.donation.campaignId,
    campaignName: row.campaignName ?? null,
    donatedAt: row.donation.donatedAt,
    receiptNumber: row.donation.receiptNumber,
  };
}

export async function listDonationRecords(
  search: string | undefined,
  status: string | undefined,
  campaignId: number | undefined,
  limit: number,
) {
  const rows = await db
    .select({
      donation: donationsTable,
      donorName: donorsTable.name,
      campaignName: campaignsTable.name,
    })
    .from(donationsTable)
    .innerJoin(donorsTable, eq(donationsTable.donorId, donorsTable.id))
    .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
    .where(
      and(
        search ? or(ilike(donorsTable.name, `%${search}%`), ilike(donationsTable.receiptNumber, `%${search}%`)) : undefined,
        status ? eq(donationsTable.status, status) : undefined,
        campaignId ? eq(donationsTable.campaignId, campaignId) : undefined,
      ),
    )
    .orderBy(desc(donationsTable.donatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.donation.id,
    donorId: row.donation.donorId,
    donorName: row.donorName,
    amount: currency(row.donation.amountCents),
    currency: row.donation.currency,
    frequency: row.donation.frequency,
    status: row.donation.status,
    campaignId: row.donation.campaignId,
    campaignName: row.campaignName ?? null,
    donatedAt: row.donation.donatedAt,
    receiptNumber: row.donation.receiptNumber,
  }));
}

export async function addActivity(type: string, title: string, detail: string) {
  await db.insert(activityTable).values({ type, title, detail });
}