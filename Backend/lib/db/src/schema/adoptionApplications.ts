import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const adoptionApplicationsTable = pgTable("adoption_applications", {
  id: serial("id").primaryKey(),
  applicationNumber: text("application_number").notNull().unique(),
  animalId: integer("animal_id").notNull().references(() => animalsTable.id, { onDelete: "cascade" }),
  applicantName: text("applicant_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  occupation: text("occupation"),
  experienceWithAnimals: text("experience_with_animals"),
  housingType: text("housing_type").notNull(),
  hasOtherPets: boolean("has_other_pets").notNull().default(false),
  reasonForAdoption: text("reason_for_adoption").notNull(),
  applicationDate: timestamp("application_date", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("pending_review"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdoptionApplicationSchema = createInsertSchema(adoptionApplicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdoptionApplication = z.infer<typeof insertAdoptionApplicationSchema>;
export type AdoptionApplication = typeof adoptionApplicationsTable.$inferSelect;
