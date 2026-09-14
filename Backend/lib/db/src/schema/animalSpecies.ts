import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const animalSpeciesTable = pgTable("animal_species", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  scientificName: text("scientific_name"),
  category: text("category").notNull().default("mammal"),
  conservationStatus: text("conservation_status").notNull().default("vulnerable"),
  habitatPreference: text("habitat_preference"),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalSpeciesSchema = createInsertSchema(animalSpeciesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalSpecies = z.infer<typeof insertAnimalSpeciesSchema>;
export type AnimalSpecies = typeof animalSpeciesTable.$inferSelect;
