import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { rescueCasesTable } from "./rescueCases";

export const rescueCaseNotesTable = pgTable("rescue_case_notes", {
  id: serial("id").primaryKey(),
  rescueCaseId: integer("rescue_case_id")
    .notNull()
    .references(() => rescueCasesTable.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull(),
  note: text("note").notNull(),
  noteType: text("note_type").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRescueCaseNoteSchema = createInsertSchema(rescueCaseNotesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRescueCaseNote = z.infer<typeof insertRescueCaseNoteSchema>;
export type RescueCaseNote = typeof rescueCaseNotesTable.$inferSelect;
