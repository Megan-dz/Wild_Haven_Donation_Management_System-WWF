import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  adoptionApplicationsTable,
  adoptionHistoriesTable,
  animalsTable,
  db,
  donorsTable,
  sponsorshipPaymentsTable,
  sponsorshipPlansTable,
  sponsorshipsTable,
} from "@workspace/db";

export type AdoptionListOptions = {
  search?: string;
  status?: string;
  animalId?: number;
  limit?: number;
  offset?: number;
  sort?: string;
};

export type SponsorshipListOptions = {
  search?: string;
  animalId?: number;
  donorId?: number;
  planId?: number;
  status?: string;
  frequency?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  sort?: string;
};

const parseSort = (sort?: string) => {
  if (!sort) return desc(adoptionApplicationsTable.createdAt);
  if (sort === "oldest") return adoptionApplicationsTable.createdAt;
  return desc(adoptionApplicationsTable.createdAt);
};

export async function listAdoptionApplications(options: AdoptionListOptions = {}) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const rows = await db
    .select({
      application: adoptionApplicationsTable,
      animalName: animalsTable.name,
      animalSpecies: animalsTable.species,
    })
    .from(adoptionApplicationsTable)
    .innerJoin(animalsTable, eq(adoptionApplicationsTable.animalId, animalsTable.id))
    .where(
      and(
        options.search
          ? or(
              ilike(adoptionApplicationsTable.applicantName, `%${options.search}%`),
              ilike(adoptionApplicationsTable.applicationNumber, `%${options.search}%`),
              ilike(adoptionApplicationsTable.email, `%${options.search}%`),
            )
          : undefined,
        options.status ? eq(adoptionApplicationsTable.status, options.status) : undefined,
        options.animalId ? eq(adoptionApplicationsTable.animalId, options.animalId) : undefined,
      ),
    )
    .orderBy(parseSort(options.sort))
    .limit(limit)
    .offset(offset);

  return rows.map((row) => ({
    ...row.application,
    animalName: row.animalName,
    animalSpecies: row.animalSpecies,
  }));
}

export async function getAdoptionDashboard() {
  const [summary] = await db
    .select({
      totalAnimals: sql<number>`count(${animalsTable.id})`,
      availableForAdoption: sql<number>`count(*) filter (where ${animalsTable.adoptionAvailable} = true)`,
      pendingApplications: sql<number>`count(*) filter (where ${adoptionApplicationsTable.status} = 'pending_review')`,
      approvedApplications: sql<number>`count(*) filter (where ${adoptionApplicationsTable.status} = 'approved')`,
      completedAdoptions: sql<number>`count(*) filter (where ${adoptionHistoriesTable.status} = 'completed')`,
      rejectedApplications: sql<number>`count(*) filter (where ${adoptionApplicationsTable.status} = 'rejected')`,
      animalsAwaitingAdoption: sql<number>`count(*) filter (where ${animalsTable.adoptionAvailable} = true and ${animalsTable.id} not in (select animal_id from adoption_histories))`,
      adoptionRate: sql<number>`coalesce((select count(*) from adoption_histories where status = 'completed')::numeric / nullif((select count(*) from adoption_applications), 0), 0)`,
      applicationsThisMonth: sql<number>`count(*) filter (where ${adoptionApplicationsTable.applicationDate} >= now() - interval '1 month')`,
      adoptionsThisMonth: sql<number>`count(*) filter (where ${adoptionHistoriesTable.adoptionDate} >= now() - interval '1 month')`,
    })
    .from(animalsTable)
    .leftJoin(adoptionApplicationsTable, eq(adoptionApplicationsTable.animalId, animalsTable.id))
    .leftJoin(adoptionHistoriesTable, eq(adoptionHistoriesTable.animalId, animalsTable.id));

  return {
    totalAnimals: Number(summary?.totalAnimals ?? 0),
    availableForAdoption: Number(summary?.availableForAdoption ?? 0),
    pendingApplications: Number(summary?.pendingApplications ?? 0),
    approvedApplications: Number(summary?.approvedApplications ?? 0),
    completedAdoptions: Number(summary?.completedAdoptions ?? 0),
    rejectedApplications: Number(summary?.rejectedApplications ?? 0),
    animalsAwaitingAdoption: Number(summary?.animalsAwaitingAdoption ?? 0),
    adoptionRate: Number(summary?.adoptionRate ?? 0),
    applicationsThisMonth: Number(summary?.applicationsThisMonth ?? 0),
    adoptionsThisMonth: Number(summary?.adoptionsThisMonth ?? 0),
    applicationsByStatus: [],
    adoptionsBySpecies: [],
    adoptionsByMonth: [],
  };
}

export async function listAnimalAdoptionOptions(options: AdoptionListOptions = {}) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  return db
    .select({
      id: animalsTable.id,
      name: animalsTable.name,
      species: animalsTable.species,
      habitat: animalsTable.habitat,
      conservationStatus: animalsTable.conservationStatus,
      adoptionAvailable: animalsTable.adoptionAvailable,
      sponsorshipAvailable: animalsTable.sponsorshipAvailable,
      description: animalsTable.description,
      imageUrl: animalsTable.imageUrl,
    })
    .from(animalsTable)
    .where(
      and(
        options.search
          ? or(ilike(animalsTable.name, `%${options.search}%`), ilike(animalsTable.species, `%${options.search}%`))
          : undefined,
        options.status ? eq(animalsTable.conservationStatus, options.status) : undefined,
      ),
    )
    .orderBy(desc(animalsTable.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function listSponsorships(options: SponsorshipListOptions = {}) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const rows = await db
    .select({
      sponsorship: sponsorshipsTable,
      donorName: donorsTable.name,
      animalName: animalsTable.name,
      planName: sponsorshipPlansTable.name,
    })
    .from(sponsorshipsTable)
    .innerJoin(donorsTable, eq(sponsorshipsTable.donorId, donorsTable.id))
    .innerJoin(animalsTable, eq(sponsorshipsTable.animalId, animalsTable.id))
    .leftJoin(sponsorshipPlansTable, eq(sponsorshipsTable.planId, sponsorshipPlansTable.id))
    .where(
      and(
        options.search
          ? or(
              ilike(sponsorshipsTable.sponsorshipNumber, `%${options.search}%`),
              ilike(donorsTable.name, `%${options.search}%`),
              ilike(animalsTable.name, `%${options.search}%`),
            )
          : undefined,
        options.animalId ? eq(sponsorshipsTable.animalId, options.animalId) : undefined,
        options.donorId ? eq(sponsorshipsTable.donorId, options.donorId) : undefined,
        options.planId ? eq(sponsorshipsTable.planId, options.planId) : undefined,
        options.status ? eq(sponsorshipsTable.status, options.status) : undefined,
        options.frequency ? eq(sponsorshipsTable.frequency, options.frequency) : undefined,
        options.fromDate ? sql`${sponsorshipsTable.startDate} >= ${options.fromDate}` : undefined,
        options.toDate ? sql`${sponsorshipsTable.startDate} <= ${options.toDate}` : undefined,
      ),
    )
    .orderBy(desc(sponsorshipsTable.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((row) => ({
    ...row.sponsorship,
    donorName: row.donorName,
    animalName: row.animalName,
    planName: row.planName,
  }));
}

export async function getSponsorshipDashboard() {
  const [summary] = await db
    .select({
      activeSponsorships: sql<number>`count(*) filter (where ${sponsorshipsTable.status} = 'active')`,
      pausedSponsorships: sql<number>`count(*) filter (where ${sponsorshipsTable.status} = 'paused')`,
      cancelledSponsorships: sql<number>`count(*) filter (where ${sponsorshipsTable.status} = 'cancelled')`,
      sponsoredAnimals: sql<number>`count(distinct ${sponsorshipsTable.animalId})`,
      totalSponsors: sql<number>`count(distinct ${sponsorshipsTable.donorId})`,
      totalContributions: sql<number>`coalesce(sum(${sponsorshipsTable.totalContributed}), 0)`,
      contributionsThisMonth: sql<number>`coalesce(sum(${sponsorshipPaymentsTable.amount}) filter (where ${sponsorshipPaymentsTable.paymentDate} >= now() - interval '1 month'), 0)`,
      averageSponsorshipAmount: sql<number>`coalesce(avg(${sponsorshipsTable.amount}), 0)`,
      recurringSponsorshipCount: sql<number>`count(*) filter (where ${sponsorshipsTable.frequency} <> 'one_time')`,
    })
    .from(sponsorshipsTable)
    .leftJoin(sponsorshipPaymentsTable, eq(sponsorshipsTable.id, sponsorshipPaymentsTable.sponsorshipId));

  return {
    activeSponsorships: Number(summary?.activeSponsorships ?? 0),
    pausedSponsorships: Number(summary?.pausedSponsorships ?? 0),
    cancelledSponsorships: Number(summary?.cancelledSponsorships ?? 0),
    sponsoredAnimals: Number(summary?.sponsoredAnimals ?? 0),
    totalSponsors: Number(summary?.totalSponsors ?? 0),
    totalContributions: Number(summary?.totalContributions ?? 0),
    contributionsThisMonth: Number(summary?.contributionsThisMonth ?? 0),
    averageSponsorshipAmount: Number(summary?.averageSponsorshipAmount ?? 0),
    recurringSponsorshipCount: Number(summary?.recurringSponsorshipCount ?? 0),
    sponsorshipsBySpecies: [],
    sponsorshipsByFrequency: [],
    monthlyContributionTotals: [],
  };
}

export async function listSponsorshipPaymentsBySponsorshipId(sponsorshipId: number) {
  return db
    .select()
    .from(sponsorshipPaymentsTable)
    .where(eq(sponsorshipPaymentsTable.sponsorshipId, sponsorshipId))
    .orderBy(desc(sponsorshipPaymentsTable.paymentDate));
}

export async function listAdoptionHistoryByAnimalId(animalId: number) {
  return db
    .select({
      history: adoptionHistoriesTable,
      animalName: animalsTable.name,
    })
    .from(adoptionHistoriesTable)
    .innerJoin(animalsTable, eq(adoptionHistoriesTable.animalId, animalsTable.id))
    .where(eq(adoptionHistoriesTable.animalId, animalId))
    .orderBy(desc(adoptionHistoriesTable.adoptionDate));
}
