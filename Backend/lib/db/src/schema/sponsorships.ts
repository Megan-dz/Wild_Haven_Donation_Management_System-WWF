import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";
import { donorsTable } from "./donors";
import { sponsorshipPlansTable } from "./sponsorshipPlans";

export const sponsorshipsTable = pgTable("sponsorships", {
  id: serial("id").primaryKey(),
  sponsorshipNumber: text("sponsorship_number").notNull().unique(),
  animalId: integer("animal_id").notNull().references(() => animalsTable.id, { onDelete: "cascade" }),
  donorId: integer("donor_id").notNull().references(() => donorsTable.id, { onDelete: "cascade" }),
  planId: integer("plan_id").references(() => sponsorshipPlansTable.id, { onDelete: "set null" }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  amount: integer("amount").notNull().default(0),
  frequency: text("frequency").notNull().default("monthly"),
  totalContributed: integer("total_contributed").notNull().default(0),
  nextPaymentDate: timestamp("next_payment_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSponsorshipSchema = createInsertSchema(sponsorshipsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorshipsTable.$inferSelect;
