import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const animalFeedingSchedulesTable = pgTable("animal_feeding_schedules", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animalsTable.id, { onDelete: "cascade" }),
  scheduleType: text("schedule_type").notNull().default("daily"),
  meal: text("meal").notNull(),
  amount: text("amount"),
  frequency: text("frequency").notNull().default("daily"),
  nextFeedingAt: timestamp("next_feeding_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalFeedingScheduleSchema = createInsertSchema(animalFeedingSchedulesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalFeedingSchedule = z.infer<typeof insertAnimalFeedingScheduleSchema>;
export type AnimalFeedingSchedule = typeof animalFeedingSchedulesTable.$inferSelect;
