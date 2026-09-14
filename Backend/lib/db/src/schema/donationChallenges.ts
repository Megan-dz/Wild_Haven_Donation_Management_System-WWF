import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const donationChallengesTable = pgTable("donation_challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sponsorName: text("sponsor_name").notNull(),
  matchingRate: integer("matching_rate").notNull().default(100),
  maximumMatchAmountCents: integer("maximum_match_amount_cents").notNull(),
  currentMatchedAmountCents: integer("current_matched_amount_cents").notNull().default(0),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationChallengeSchema = createInsertSchema(donationChallengesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDonationChallenge = z.infer<typeof insertDonationChallengeSchema>;
export type DonationChallenge = typeof donationChallengesTable.$inferSelect;
