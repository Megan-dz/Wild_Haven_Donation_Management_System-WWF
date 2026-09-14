import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const conservationAreasTable = pgTable("conservation_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConservationAreaSchema = createInsertSchema(conservationAreasTable).omit({
  id: true,
  createdAt: true,
});

export type InsertConservationArea = z.infer<typeof insertConservationAreaSchema>;
export type ConservationArea = typeof conservationAreasTable.$inferSelect;
