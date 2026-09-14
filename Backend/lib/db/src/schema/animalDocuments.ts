import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { animalsTable } from "./animals";

export const animalDocumentsTable = pgTable("animal_documents", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animalsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  documentType: text("document_type").notNull().default("general"),
  fileUrl: text("file_url"),
  notes: text("notes"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalDocumentSchema = createInsertSchema(animalDocumentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAnimalDocument = z.infer<typeof insertAnimalDocumentSchema>;
export type AnimalDocument = typeof animalDocumentsTable.$inferSelect;
