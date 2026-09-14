import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const animalCareAssignmentsTable = pgTable("animal_care_assignments", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animalsTable.id, { onDelete: "cascade" }),
  caretakerName: text("caretaker_name").notNull(),
  caretakerId: text("caretaker_id"),
  role: text("role").notNull(),
  assignmentType: text("assignment_type").notNull().default("primary"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalCareAssignmentSchema = createInsertSchema(animalCareAssignmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalCareAssignment = z.infer<typeof insertAnimalCareAssignmentSchema>;
export type AnimalCareAssignment = typeof animalCareAssignmentsTable.$inferSelect;
