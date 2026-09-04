# Wild Haven India – Admin Dashboard

Internal employee portal for the Wild Haven India wildlife conservation nonprofit. Staff use this to track donations, manage fundraising campaigns, and view donor records.

## Run & Operate

- `pnpm --filter @workspace/admin-dashboard run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run typecheck` — typecheck the database package
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Recharts + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (campaigns.ts, donors.ts, donations.ts)
- `artifacts/api-server/src/routes/` — Express route handlers (donations, campaigns, donors, dashboard)
- `artifacts/admin-dashboard/src/` — React frontend
- `docs/database.md` — database setup, source map, and aggregate semantics

## Product

- **Dashboard** (`/`) — headline stats, monthly funding chart, recent activity, campaign progress
- **Donations** (`/donations`) — searchable/filterable donation ledger, add/edit modal
- **Campaigns** (`/campaigns`) — campaign grid with progress bars, add/edit modal
- **Donors** (`/donors`) — donor directory, click-through to donor detail
- **Donor Detail** (`/donors/:id`) — donor info + full donation history

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run codegen before using the updated types
- After changing `lib/*` packages, run `pnpm run typecheck:libs` before artifact typechecks
- Never use `console.log` in server code — use `req.log` in handlers or the singleton `logger`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
