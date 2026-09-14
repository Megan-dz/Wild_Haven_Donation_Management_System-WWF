import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const animalHabitatsTable = pgTable("animal_habitats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  zone: text("zone").notNull(),
  capacity: integer("capacity").notNull().default(0),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalHabitatSchema = createInsertSchema(animalHabitatsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalHabitat = z.infer<typeof insertAnimalHabitatSchema>;
export type AnimalHabitat = typeof animalHabitatsTable.$inferSelect;
