import { relations } from "drizzle-orm";
import { campaignsTable } from "./campaigns";
import { donationsTable } from "./donations";
import { donorsTable } from "./donors";

export const campaignsRelations = relations(campaignsTable, ({ many }) => ({
  donations: many(donationsTable),
}));

export const donorsRelations = relations(donorsTable, ({ many }) => ({
  donations: many(donationsTable),
}));

export const donationsRelations = relations(donationsTable, ({ one }) => ({
  donor: one(donorsTable, {
    fields: [donationsTable.donorId],
    references: [donorsTable.id],
  }),
  campaign: one(campaignsTable, {
    fields: [donationsTable.campaignId],
    references: [campaignsTable.id],
  }),
}));