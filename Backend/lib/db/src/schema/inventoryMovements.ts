import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { inventoryItemsTable } from "./inventoryItems";
export const inventoryMovementsTable = pgTable("inventory_movements", { id: serial("id").primaryKey(), inventoryItemId: integer("inventory_item_id").notNull().references(() => inventoryItemsTable.id, { onDelete: "cascade" }), quantityChange: integer("quantity_change").notNull(), reason: text("reason").notNull(), reference: text("reference"), recordedBy: text("recorded_by"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow() });
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovementsTable).omit({ id: true, createdAt: true });
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>; export type InventoryMovement = typeof inventoryMovementsTable.$inferSelect;
