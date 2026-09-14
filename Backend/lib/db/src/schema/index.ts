// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

export * from "./activity";
export * from "./adoptionApplications";
export * from "./adoptionHistories";
export * from "./animalCareAssignments";
export * from "./animalDocuments";
export * from "./animalFeedingSchedules";
export * from "./animalHabitats";
export * from "./animalMedicalRecords";
export * from "./animalMovementHistory";
export * from "./animalObservations";
export * from "./animalSpecies";
export * from "./animals";
export * from "./campaigns";
export * from "./conservationAreas";
export * from "./donationChallenges";
export * from "./donations";
export * from "./donors";
export * from "./recurringDonations";
export * from "./rescueCases";
export * from "./rescueCaseNotes";
export * from "./rescueCaseStatusHistory";
export * from "./rescueExpenses";
export * from "./sponsorshipPayments";
export * from "./sponsorshipPlans";
export * from "./sponsorships";
export * from "./tasks";
export * from "./inventoryItems";
export * from "./inventoryMovements";
