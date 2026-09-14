import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const rescueCasesTable = pgTable("rescue_cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  animalName: text("animal_name").notNull(),
  species: text("species").notNull(),
  rescueType: text("rescue_type").notNull(),
  rescueLocation: text("rescue_location").notNull(),
  reportedBy: text("reported_by").notNull(),
  contactInformation: text("contact_information").notNull(),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
  rescueDate: timestamp("rescue_date", { withTimezone: true }).notNull().defaultNow(),
  severity: text("severity").notNull().default("medium"),
  condition: text("condition").notNull(),
  description: text("description").notNull(),
  assignedEmployeeId: text("assigned_employee_id"),
  status: text("status").notNull().default("reported"),
  priority: text("priority").notNull().default("medium"),
  estimatedCost: integer("estimated_cost").notNull().default(0),
  actualCost: integer("actual_cost").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRescueCaseSchema = createInsertSchema(rescueCasesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRescueCase = z.infer<typeof insertRescueCaseSchema>;
export type RescueCase = typeof rescueCasesTable.$inferSelect;
