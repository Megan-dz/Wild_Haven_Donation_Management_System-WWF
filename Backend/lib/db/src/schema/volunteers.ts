import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  volunteerCode: text("volunteer_code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
  skills: text("skills").notNull().default(""),
  interests: text("interests").notNull().default(""),
  availability: text("availability").notNull().default("flexible"),
  emergencyContact: text("emergency_contact").notNull(),
  status: text("status").notNull().default("active"),
  joinedDate: timestamp("joined_date", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteersTable.$inferSelect;
