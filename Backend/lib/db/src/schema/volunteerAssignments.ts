import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { volunteersTable } from "./volunteers";

export const volunteerAssignmentsTable = pgTable("volunteer_assignments", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => volunteersTable.id, { onDelete: "cascade" }),
  assignmentType: text("assignment_type").notNull().default("rescue_case"),
  referenceId: integer("reference_id").notNull(),
  role: text("role").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  hoursExpected: integer("hours_expected").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerAssignmentSchema = createInsertSchema(volunteerAssignmentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVolunteerAssignment = z.infer<typeof insertVolunteerAssignmentSchema>;
export type VolunteerAssignment = typeof volunteerAssignmentsTable.$inferSelect;
