import { count, sql } from "drizzle-orm";
import { db, activityTable, campaignsTable, donationsTable, donorsTable } from "@workspace/db";
import { logger } from "./logger";

export async function seedDatabase(): Promise<void> {
  const [{ value: donorCount }] = await db.select({ value: count() }).from(donorsTable);
  if (Number(donorCount) > 0) return;

  const now = new Date("2026-09-01T10:00:00.000Z");
  const donors = await db
    .insert(donorsTable)
    .values([
      { name: "Ananya Mehta", email: "ananya.mehta@example.com", phone: "+91 98765 12001", city: "Mumbai" },
      { name: "Arjun Rao", email: "arjun.rao@example.com", phone: "+91 98765 12002", city: "Bengaluru" },
      { name: "Maya Kapoor", email: "maya.kapoor@example.com", phone: null, city: "New Delhi" },
      { name: "Nikhil Shah", email: "nikhil.shah@example.com", phone: "+91 98765 12004", city: "Pune" },
    ])
    .returning();

  const campaigns = await db
    .insert(campaignsTable)
    .values([
      {
        name: "Guard a Snow Leopard",
        species: "Snow leopard",
        location: "Ladakh, Spiti & the high Himalayas",
        description: "Fund high-altitude patrols, thermal gear, and community coexistence work across snow leopard range.",
        goalCents: 2500000,
        status: "active",
        supporters: 0,
      },
      {
        name: "Rescue an Elephant",
        species: "Asian elephant",
        location: "Sundarbans & the Eastern Ghats",
        description: "Provide emergency veterinary care and protect safe movement corridors for elephant herds.",
        goalCents: 5000000,
        status: "active",
        supporters: 0,
      },
      {
        name: "Restore One Acre",
        species: "Habitat restoration",
        location: "Western Ghats",
        description: "Reforest native trees and revive degraded corridors alongside local communities.",
        goalCents: 2500000,
        status: "paused",
        supporters: 0,
      },
    ])
    .returning();

  await db.insert(donationsTable).values([
    {
      donorId: donors[0].id,
      amountCents: 250000,
      frequency: "one_time",
      status: "completed",
      campaignId: campaigns[0].id,
      donatedAt: new Date("2026-08-28T09:15:00.000Z"),
      receiptNumber: "WH-26082801",
    },
    {
      donorId: donors[1].id,
      amountCents: 500000,
      frequency: "monthly",
      status: "completed",
      campaignId: campaigns[1].id,
      donatedAt: new Date("2026-08-23T12:45:00.000Z"),
      receiptNumber: "WH-26082302",
    },
    {
      donorId: donors[2].id,
      amountCents: 1000000,
      frequency: "one_time",
      status: "completed",
      campaignId: campaigns[2].id,
      donatedAt: new Date("2026-07-16T08:30:00.000Z"),
      receiptNumber: "WH-26071603",
    },
    {
      donorId: donors[3].id,
      amountCents: 250000,
      frequency: "monthly",
      status: "pending",
      campaignId: campaigns[0].id,
      donatedAt: new Date("2026-09-01T07:00:00.000Z"),
      receiptNumber: "WH-26090104",
    },
    {
      donorId: donors[0].id,
      amountCents: 75000,
      frequency: "one_time",
      status: "completed",
      campaignId: campaigns[1].id,
      donatedAt: new Date("2026-06-07T11:10:00.000Z"),
      receiptNumber: "WH-26060705",
    },
  ]);

  await db.insert(activityTable).values([
    { type: "donation", title: "₹5,000 recurring gift received", detail: "Arjun Rao joined the monthly giving circle.", createdAt: new Date("2026-08-23T12:45:00.000Z") },
    { type: "campaign", title: "Elephant campaign updated", detail: "Rescue an Elephant reached 10% of its current goal.", createdAt: new Date("2026-08-21T15:30:00.000Z") },
    { type: "donor", title: "New donor added", detail: "Maya Kapoor was added to the donor directory.", createdAt: new Date("2026-08-19T09:00:00.000Z") },
    { type: "report", title: "Impact report ready", detail: "August field update is ready to share with donors.", createdAt: now },
  ]);
  logger.info("Seeded Wild Haven portal demo data");
}