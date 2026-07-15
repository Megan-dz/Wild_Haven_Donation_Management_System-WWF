import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donorsTable = pgTable("donors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  totalDonated: numeric("total_donated", { precision: 12, scale: 2 }).notNull().default("0"),
  donationCount: integer("donation_count").notNull().default(0),
  firstDonationAt: timestamp("first_donation_at", { withTimezone: true }),
  lastDonationAt: timestamp("last_donation_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDonorSchema = createInsertSchema(donorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donorsTable.$inferSelect;
