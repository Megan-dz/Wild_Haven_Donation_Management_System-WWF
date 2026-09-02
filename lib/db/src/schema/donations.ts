import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";
import { donorsTable } from "./donors";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => donorsTable.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("INR"),
  frequency: text("frequency").notNull().default("one_time"),
  status: text("status").notNull().default("completed"),
  campaignId: integer("campaign_id").references(() => campaignsTable.id, { onDelete: "set null" }),
  donatedAt: timestamp("donated_at", { withTimezone: true }).notNull().defaultNow(),
  receiptNumber: text("receipt_number").notNull().unique(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;