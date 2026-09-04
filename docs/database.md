# Wild Haven database

The fundraising data is stored in PostgreSQL and managed with Drizzle ORM. The
database package is intentionally independent of the dashboard UI so it can be
used by the API server or another service in this workspace.

## Setup

1. Provision a PostgreSQL database and set `DATABASE_URL` in the workspace
   environment. Keep the connection string in environment configuration; do
   not commit it or paste it into source files.
2. From the repository root, create or update the schema:

   ```sh
   pnpm --filter @workspace/db run push
   ```

   Drizzle compares the checked-in schema with the database and creates or
   updates the `campaigns`, `donors`, and `donations` tables. The
   `push-force` script is available for explicitly approved destructive
   development changes, but should not be used against production data.
3. Typecheck the package and API together:

   ```sh
   pnpm --filter @workspace/db run typecheck
   pnpm --filter @workspace/api-server run typecheck
   ```

No seed data is required: an empty database is a valid starting state, and the
API can create campaigns, donors, and donations through its normal endpoints.

## Source map

- `lib/db/src/index.ts` creates the PostgreSQL pool and exports the Drizzle
  client plus the complete schema.
- `lib/db/src/schema/campaigns.ts` defines campaign targets, raised totals,
  status, and lifecycle dates.
- `lib/db/src/schema/donors.ts` defines donor contact details and completed
  donation aggregates.
- `lib/db/src/schema/donations.ts` defines donation records with nullable donor
  and campaign references, amount/status fields, and timestamps.
- `lib/db/src/schema/relations.ts` exposes the campaign/donor-to-donations and
  donation-to-campaign/donor relationships for Drizzle queries.
- `artifacts/api-server/src/routes/` contains the database-backed campaign,
  donor, donation, and dashboard handlers.

Money is stored as PostgreSQL `numeric(12,2)` and converted to JSON numbers at
the API boundary. `raisedAmount`, `donorCount`, `totalDonated`, and
`donationCount` are reconciled from donations with `completed` status inside
the donation transaction. Pending and refunded records remain in the ledger
and activity feed but do not count toward raised funding totals.