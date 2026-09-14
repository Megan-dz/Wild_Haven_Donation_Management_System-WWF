import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sponsorshipsTable } from "./sponsorships";

export const sponsorshipPaymentsTable = pgTable("sponsorship_payments", {
  id: serial("id").primaryKey(),
  sponsorshipId: integer("sponsorship_id").notNull().references(() => sponsorshipsTable.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull().default(0),
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(),
  transactionReference: text("transaction_reference").notNull(),
  status: text("status").notNull().default("completed"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSponsorshipPaymentSchema = createInsertSchema(sponsorshipPaymentsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSponsorshipPayment = z.infer<typeof insertSponsorshipPaymentSchema>;
export type SponsorshipPayment = typeof sponsorshipPaymentsTable.$inferSelect;
