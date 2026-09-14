import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(), name: text("name").notNull(), category: text("category").notNull(), sku: text("sku").notNull().unique(), unit: text("unit").notNull().default("units"), quantity: integer("quantity").notNull().default(0), minimumQuantity: integer("minimum_quantity").notNull().default(0), unitCost: integer("unit_cost").notNull().default(0), location: text("location"), description: text("description"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>; export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
