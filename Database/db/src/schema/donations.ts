import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { donorsTable } from "./donors";
import { campaignsTable } from "./campaigns";

export const donationStatuses = ["pending", "completed", "refunded"] as const;
export const donationStatusSchema = z.enum(donationStatuses);

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").references(() => donorsTable.id, {
    onDelete: "set null",
  }),
  campaignId: integer("campaign_id").references(() => campaignsTable.id, {
    onDelete: "set null",
  }),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: donationStatusSchema.optional(),
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
