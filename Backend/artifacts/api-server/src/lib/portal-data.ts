import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  db,
  activityTable,
  campaignsTable,
  conservationAreasTable,
  donationsTable,
  donorsTable,
  donationChallengesTable,
  recurringDonationsTable,
} from "@workspace/db";

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
  donorId?: number,
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
        donorId ? eq(donationsTable.donorId, donorId) : undefined,
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

export type DonationAnalyticsFilters = {
  campaignId?: number;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
};

export async function getDonationAnalytics(filters: DonationAnalyticsFilters = {}) {
  const conditions = [
    filters.campaignId !== undefined ? eq(donationsTable.campaignId, filters.campaignId) : undefined,
    filters.status ? eq(donationsTable.status, filters.status) : undefined,
    filters.fromDate ? sql`${donationsTable.donatedAt} >= ${filters.fromDate}` : undefined,
    filters.toDate ? sql`${donationsTable.donatedAt} <= ${filters.toDate}` : undefined,
  ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [summaryRows, campaignRows, monthlyRows, statusRows, donorRows, recentRows, campaigns] = await Promise.all([
    db
      .select({
        totalDonations: sql<number>`count(*)`,
        totalAmountCents: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
        averageAmountCents: sql<number>`coalesce(avg(${donationsTable.amountCents}), 0)`,
      })
      .from(donationsTable)
      .where(where),
    db
      .select({
        campaignId: donationsTable.campaignId,
        campaignName: sql<string>`coalesce(${campaignsTable.name}, 'General Fund')`,
        donationCount: sql<number>`count(*)`,
        amountCents: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      })
      .from(donationsTable)
      .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
      .where(where)
      .groupBy(donationsTable.campaignId, campaignsTable.name)
      .orderBy(desc(sql`sum(${donationsTable.amountCents})`)),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${donationsTable.donatedAt}), 'YYYY-MM')`,
        donationCount: sql<number>`count(*)`,
        amountCents: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      })
      .from(donationsTable)
      .where(where)
      .groupBy(sql`date_trunc('month', ${donationsTable.donatedAt})`)
      .orderBy(sql`date_trunc('month', ${donationsTable.donatedAt})`),
    db
      .select({
        status: donationsTable.status,
        donationCount: sql<number>`count(*)`,
        amountCents: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      })
      .from(donationsTable)
      .where(where)
      .groupBy(donationsTable.status)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        donorId: donorsTable.id,
        donorName: donorsTable.name,
        donationCount: sql<number>`count(*)`,
        amountCents: sql<number>`coalesce(sum(${donationsTable.amountCents}), 0)`,
      })
      .from(donationsTable)
      .innerJoin(donorsTable, eq(donationsTable.donorId, donorsTable.id))
      .where(where)
      .groupBy(donorsTable.id, donorsTable.name)
      .orderBy(desc(sql`sum(${donationsTable.amountCents})`))
      .limit(10),
    db
      .select({
        id: donationsTable.id,
        donorName: donorsTable.name,
        amountCents: donationsTable.amountCents,
        status: donationsTable.status,
        campaignName: sql<string | null>`${campaignsTable.name}`,
        donatedAt: donationsTable.donatedAt,
      })
      .from(donationsTable)
      .innerJoin(donorsTable, eq(donationsTable.donorId, donorsTable.id))
      .leftJoin(campaignsTable, eq(donationsTable.campaignId, campaignsTable.id))
      .where(where)
      .orderBy(desc(donationsTable.donatedAt))
      .limit(10),
    db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt)),
  ]);

  const campaignTotals = new Map(
    campaignRows.map((row) => [row.campaignId, Number(row.amountCents ?? 0)]),
  );

  return {
    summary: {
      totalDonations: Number(summaryRows[0]?.totalDonations ?? 0),
      totalAmount: currency(summaryRows[0]?.totalAmountCents),
      averageAmount: currency(summaryRows[0]?.averageAmountCents),
    },
    byCampaign: campaignRows.map((row) => ({
      campaignId: row.campaignId,
      campaignName: row.campaignName,
      donationCount: Number(row.donationCount ?? 0),
      amount: currency(row.amountCents),
    })),
    byMonth: monthlyRows.map((row) => ({
      month: row.month,
      donationCount: Number(row.donationCount ?? 0),
      amount: currency(row.amountCents),
    })),
    byStatus: statusRows.map((row) => ({
      status: row.status,
      donationCount: Number(row.donationCount ?? 0),
      amount: currency(row.amountCents),
    })),
    topDonors: donorRows.map((row) => ({
      donorId: row.donorId,
      donorName: row.donorName,
      donationCount: Number(row.donationCount ?? 0),
      amount: currency(row.amountCents),
    })),
    recentDonations: recentRows.map((row) => ({
      id: row.id,
      donorName: row.donorName,
      amount: currency(row.amountCents),
      status: row.status,
      campaignName: row.campaignName ?? "General Fund",
      donatedAt: row.donatedAt,
    })),
    campaignProgress: campaigns.map((campaign) => {
      const raised = currency(campaignTotals.get(campaign.id));
      const goal = currency(campaign.goalCents);
      return {
        id: campaign.id,
        name: campaign.name,
        raised,
        goal,
        percent: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0,
        status: campaign.status,
        createdAt: campaign.createdAt,
      };
    }),
  };
}

export async function addActivity(type: string, title: string, detail: string) {
  await db.insert(activityTable).values({ type, title, detail });
}

export async function listConservationAreas(limit: number) {
  const areas = await db
    .select()
    .from(conservationAreasTable)
    .where(eq(conservationAreasTable.status, "active"))
    .orderBy(desc(conservationAreasTable.createdAt))
    .limit(limit);

  return areas.map((area) => ({
    id: area.id,
    name: area.name,
    description: area.description,
    status: area.status,
    createdAt: area.createdAt,
  }));
}

export async function getDonationChallengeRecord(id: number) {
  const [challenge] = await db.select().from(donationChallengesTable).where(eq(donationChallengesTable.id, id));
  if (!challenge) return undefined;

  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    sponsorName: challenge.sponsorName,
    matchingRate: challenge.matchingRate,
    maximumMatchAmountCents: challenge.maximumMatchAmountCents,
    currentMatchedAmountCents: challenge.currentMatchedAmountCents,
    status: challenge.status,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  };
}

export async function listDonationChallenges(limit: number) {
  const challenges = await db
    .select()
    .from(donationChallengesTable)
    .orderBy(desc(donationChallengesTable.startDate))
    .limit(limit);

  return challenges.map((challenge) => ({
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    sponsorName: challenge.sponsorName,
    matchingRate: challenge.matchingRate,
    maximumMatchAmountCents: challenge.maximumMatchAmountCents,
    currentMatchedAmountCents: challenge.currentMatchedAmountCents,
    status: challenge.status,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  }));
}

export async function getDonorDashboard(id: number) {
  const donor = await getDonorRecord(id);
  if (!donor) return undefined;

  const recurringPlans = await db
    .select()
    .from(recurringDonationsTable)
    .where(and(eq(recurringDonationsTable.donorId, id), eq(recurringDonationsTable.status, "active")))
    .orderBy(desc(recurringDonationsTable.nextScheduledAt));

  const recentDonations = await listDonationRecords(undefined, undefined, undefined, 5, id);
  const challenges = await listDonationChallenges(5);
  const activeChallenges = challenges.filter((challenge) => challenge.status === "active");

  return {
    donor,
    summary: {
      donationCount: donor.donationCount,
      recurringPlans: recurringPlans.length,
      activeChallenges: activeChallenges.length,
      lifetimeContribution: donor.totalGiven,
    },
    recentDonations,
    recurringPlans: recurringPlans.map((plan) => ({
      id: plan.id,
      amountCents: plan.amountCents,
      currency: plan.currency,
      frequency: plan.frequency,
      status: plan.status,
      nextScheduledAt: plan.nextScheduledAt,
      areaId: plan.areaId,
    })),
    challenges,
  };
}
