import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { volunteersTable } from "./volunteers";

export const volunteerHoursTable = pgTable("volunteer_hours", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => volunteersTable.id, { onDelete: "cascade" }),
  assignmentId: integer("assignment_id"),
  workDate: timestamp("work_date", { withTimezone: true }).notNull().defaultNow(),
  hours: integer("hours").notNull().default(0),
  activity: text("activity").notNull(),
  description: text("description").notNull(),
  approvedBy: text("approved_by"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerHourSchema = createInsertSchema(volunteerHoursTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVolunteerHour = z.infer<typeof insertVolunteerHourSchema>;
export type VolunteerHour = typeof volunteerHoursTable.$inferSelect;
