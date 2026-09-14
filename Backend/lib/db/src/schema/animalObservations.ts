import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const animalObservationsTable = pgTable("animal_observations", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animalsTable.id, { onDelete: "cascade" }),
  observerName: text("observer_name").notNull(),
  observationType: text("observation_type").notNull().default("general"),
  summary: text("summary").notNull(),
  severity: text("severity").notNull().default("normal"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalObservationSchema = createInsertSchema(animalObservationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalObservation = z.infer<typeof insertAnimalObservationSchema>;
export type AnimalObservation = typeof animalObservationsTable.$inferSelect;
