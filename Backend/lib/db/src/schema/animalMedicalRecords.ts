import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { rescueCasesTable } from "./rescueCases";

export const animalMedicalRecordsTable = pgTable("animal_medical_records", {
  id: serial("id").primaryKey(),
  rescueCaseId: integer("rescue_case_id")
    .notNull()
    .references(() => rescueCasesTable.id, { onDelete: "cascade" }),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  medication: text("medication"),
  veterinarian: text("veterinarian").notNull(),
  treatmentDate: timestamp("treatment_date", { withTimezone: true }).notNull().defaultNow(),
  followUpDate: timestamp("follow_up_date", { withTimezone: true }),
  medicalStatus: text("medical_status").notNull().default("monitoring"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalMedicalRecordSchema = createInsertSchema(animalMedicalRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalMedicalRecord = z.infer<typeof insertAnimalMedicalRecordSchema>;
export type AnimalMedicalRecord = typeof animalMedicalRecordsTable.$inferSelect;
