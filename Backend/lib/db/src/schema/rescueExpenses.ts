import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { rescueCasesTable } from "./rescueCases";

export const rescueExpensesTable = pgTable("rescue_expenses", {
  id: serial("id").primaryKey(),
  rescueCaseId: integer("rescue_case_id")
    .notNull()
    .references(() => rescueCasesTable.id, { onDelete: "cascade" }),
  expenseType: text("expense_type").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  paidBy: text("paid_by").notNull(),
  expenseDate: timestamp("expense_date", { withTimezone: true }).notNull().defaultNow(),
  receiptReference: text("receipt_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRescueExpenseSchema = createInsertSchema(rescueExpensesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertRescueExpense = z.infer<typeof insertRescueExpenseSchema>;
export type RescueExpense = typeof rescueExpensesTable.$inferSelect;
