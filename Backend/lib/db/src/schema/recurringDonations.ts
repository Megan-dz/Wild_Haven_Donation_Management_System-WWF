import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { conservationAreasTable } from "./conservationAreas";
import { donorsTable } from "./donors";

export const recurringDonationsTable = pgTable("recurring_donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => donorsTable.id, { onDelete: "cascade" }),
  areaId: integer("area_id").references(() => conservationAreasTable.id, { onDelete: "set null" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("INR"),
  frequency: text("frequency").notNull().default("monthly"),
  status: text("status").notNull().default("active"),
  nextScheduledAt: timestamp("next_scheduled_at", { withTimezone: true }).notNull(),
  lifetimeContributionCents: integer("lifetime_contribution_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRecurringDonationSchema = createInsertSchema(recurringDonationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecurringDonation = z.infer<typeof insertRecurringDonationSchema>;
export type RecurringDonation = typeof recurringDonationsTable.$inferSelect;
