import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const animalMovementHistoryTable = pgTable("animal_movement_history", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animalsTable.id, { onDelete: "cascade" }),
  fromLocation: text("from_location"),
  toLocation: text("to_location").notNull(),
  movementType: text("movement_type").notNull().default("transfer"),
  reason: text("reason"),
  movedBy: text("moved_by").notNull(),
  movedAt: timestamp("moved_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalMovementHistorySchema = createInsertSchema(animalMovementHistoryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalMovementHistory = z.infer<typeof insertAnimalMovementHistorySchema>;
export type AnimalMovementHistory = typeof animalMovementHistoryTable.$inferSelect;
