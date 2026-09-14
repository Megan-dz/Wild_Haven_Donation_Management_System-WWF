import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  animalCareAssignmentsTable,
  animalDocumentsTable,
  animalFeedingSchedulesTable,
  animalHabitatsTable,
  animalMovementHistoryTable,
  animalObservationsTable,
  animalSpeciesTable,
  animalsTable,
  db,
} from "@workspace/db";

export type AnimalInventoryListOptions = {
  search?: string;
  status?: string;
  species?: string;
  habitat?: string;
  limit?: number;
  offset?: number;
  sort?: string;
};

export async function listAnimalInventoryRecords(options: AnimalInventoryListOptions = {}) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  return db
    .select({
      id: animalsTable.id,
      name: animalsTable.name,
      species: animalsTable.species,
      age: animalsTable.age,
      habitat: animalsTable.habitat,
      conservationStatus: animalsTable.conservationStatus,
      description: animalsTable.description,
      adoptionAvailable: animalsTable.adoptionAvailable,
      sponsorshipAvailable: animalsTable.sponsorshipAvailable,
      imageUrl: animalsTable.imageUrl,
      createdAt: animalsTable.createdAt,
      updatedAt: animalsTable.updatedAt,
    })
    .from(animalsTable)
    .where(
      and(
        options.search
          ? or(ilike(animalsTable.name, `%${options.search}%`), ilike(animalsTable.species, `%${options.search}%`))
          : undefined,
        options.status ? eq(animalsTable.conservationStatus, options.status) : undefined,
        options.species ? eq(animalsTable.species, options.species) : undefined,
        options.habitat ? eq(animalsTable.habitat, options.habitat) : undefined,
      ),
    )
    .orderBy(desc(animalsTable.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function listAnimalSpeciesRecords(limit = 50) {
  return db
    .select()
    .from(animalSpeciesTable)
    .orderBy(desc(animalSpeciesTable.createdAt))
    .limit(limit);
}

export async function listAnimalHabitatsRecords(limit = 50) {
  return db
    .select()
    .from(animalHabitatsTable)
    .orderBy(desc(animalHabitatsTable.createdAt))
    .limit(limit);
}

export async function listAnimalCareAssignments(animalId: number) {
  return db
    .select()
    .from(animalCareAssignmentsTable)
    .where(eq(animalCareAssignmentsTable.animalId, animalId))
    .orderBy(desc(animalCareAssignmentsTable.assignedAt));
}

export async function listAnimalFeedingSchedules(animalId: number) {
  return db
    .select()
    .from(animalFeedingSchedulesTable)
    .where(eq(animalFeedingSchedulesTable.animalId, animalId))
    .orderBy(desc(animalFeedingSchedulesTable.nextFeedingAt));
}

export async function listAnimalObservations(animalId: number) {
  return db
    .select()
    .from(animalObservationsTable)
    .where(eq(animalObservationsTable.animalId, animalId))
    .orderBy(desc(animalObservationsTable.observedAt));
}

export async function listAnimalMovementHistory(animalId: number) {
  return db
    .select()
    .from(animalMovementHistoryTable)
    .where(eq(animalMovementHistoryTable.animalId, animalId))
    .orderBy(desc(animalMovementHistoryTable.movedAt));
}

export async function listAnimalDocuments(animalId: number) {
  return db
    .select()
    .from(animalDocumentsTable)
    .where(eq(animalDocumentsTable.animalId, animalId))
    .orderBy(desc(animalDocumentsTable.createdAt));
}

export async function getAnimalInventoryDashboard() {
  const [totals] = await db
    .select({
      totalAnimals: sql<number>`count(*)`,
      featuredAnimals: sql<number>`count(*) filter (where ${animalsTable.adoptionAvailable} = true or ${animalsTable.sponsorshipAvailable} = true)`,
      needsAttention: sql<number>`count(*) filter (where ${animalsTable.conservationStatus} not in ('stable', 'recovered'))`,
      averageAge: sql<number>`coalesce(avg(${animalsTable.age}), 0)`,
    })
    .from(animalsTable);

  const speciesBreakdown = await db
    .select({
      species: animalsTable.species,
      count: sql<number>`count(*)`,
    })
    .from(animalsTable)
    .groupBy(animalsTable.species)
    .orderBy(desc(sql<number>`count(*)`));

  const recentObservations = await db
    .select({
      id: animalObservationsTable.id,
      animalId: animalObservationsTable.animalId,
      summary: animalObservationsTable.summary,
      severity: animalObservationsTable.severity,
      observedAt: animalObservationsTable.observedAt,
      animalName: animalsTable.name,
      species: animalsTable.species,
    })
    .from(animalObservationsTable)
    .innerJoin(animalsTable, eq(animalObservationsTable.animalId, animalsTable.id))
    .orderBy(desc(animalObservationsTable.observedAt))
    .limit(5);

  const needsAttentionAnimals = await db
    .select({
      id: animalsTable.id,
      name: animalsTable.name,
      species: animalsTable.species,
      conservationStatus: animalsTable.conservationStatus,
      habitat: animalsTable.habitat,
      age: animalsTable.age,
      updatedAt: animalsTable.updatedAt,
    })
    .from(animalsTable)
    .where(or(eq(animalsTable.conservationStatus, "critical"), eq(animalsTable.conservationStatus, "endangered")))
    .orderBy(desc(animalsTable.updatedAt))
    .limit(10);

  return {
    totalAnimals: Number(totals?.totalAnimals ?? 0),
    featuredAnimals: Number(totals?.featuredAnimals ?? 0),
    needsAttention: Number(totals?.needsAttention ?? 0),
    averageAge: Number(totals?.averageAge ?? 0),
    speciesBreakdown: speciesBreakdown.map((item) => ({
      species: item.species,
      count: Number(item.count),
    })),
    recentObservations,
    needsAttentionAnimals,
  };
}
