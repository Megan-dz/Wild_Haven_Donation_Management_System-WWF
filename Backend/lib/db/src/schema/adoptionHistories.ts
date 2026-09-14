import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { adoptionApplicationsTable } from "./adoptionApplications";
import { animalsTable } from "./animals";

export const adoptionHistoriesTable = pgTable("adoption_histories", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id").notNull().references(() => animalsTable.id, { onDelete: "cascade" }),
  applicationId: integer("application_id").references(() => adoptionApplicationsTable.id, { onDelete: "set null" }),
  adopterName: text("adopter_name").notNull(),
  adoptionDate: timestamp("adoption_date", { withTimezone: true }).notNull().defaultNow(),
  adoptionType: text("adoption_type").notNull().default("standard"),
  status: text("status").notNull().default("completed"),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  followUpNotes: text("follow_up_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdoptionHistorySchema = createInsertSchema(adoptionHistoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdoptionHistory = z.infer<typeof insertAdoptionHistorySchema>;
export type AdoptionHistory = typeof adoptionHistoriesTable.$inferSelect;
