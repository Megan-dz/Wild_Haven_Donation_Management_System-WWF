import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { rescueCasesTable } from "./rescueCases";

export const rescueCaseStatusHistoryTable = pgTable("rescue_case_status_history", {
  id: serial("id").primaryKey(),
  rescueCaseId: integer("rescue_case_id")
    .notNull()
    .references(() => rescueCasesTable.id, { onDelete: "cascade" }),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by").notNull(),
  reason: text("reason"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRescueCaseStatusHistorySchema = createInsertSchema(rescueCaseStatusHistoryTable).omit({
  id: true,
  changedAt: true,
});

export type InsertRescueCaseStatusHistory = z.infer<typeof insertRescueCaseStatusHistorySchema>;
export type RescueCaseStatusHistory = typeof rescueCaseStatusHistoryTable.$inferSelect;
