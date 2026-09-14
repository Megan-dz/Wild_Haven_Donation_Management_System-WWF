import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { volunteersTable } from "./volunteers";

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => volunteersTable.id, { onDelete: "cascade" }),
  applicationDate: timestamp("application_date", { withTimezone: true }).notNull().defaultNow(),
  motivation: text("motivation").notNull(),
  experience: text("experience").notNull(),
  preferredRole: text("preferred_role").notNull(),
  preferredArea: text("preferred_area").notNull(),
  availability: text("availability").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;
