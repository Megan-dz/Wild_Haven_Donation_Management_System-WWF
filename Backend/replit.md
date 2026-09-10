# Wild Haven Employee Portal

An authenticated internal operations workspace for managing Wild Haven donors, donations, conservation campaigns, and impact reporting.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (PORT, configured as 8080 in the workspace)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Clerk secrets are managed in the Replit environment; do not place them in source files.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Clerk-managed sessions on the React client and Express API

## Where things live

- `artifacts/wild-haven-portal/src/App.tsx` — portal routes, shell, CRUD screens, Clerk UI, and dashboard/impact views
- `artifacts/wild-haven-portal/src/index.css` — Wild Haven visual system, typography, responsive layout, and motion
- `artifacts/api-server/src/routes/portal.ts` — authenticated API routes and response validation
- `artifacts/api-server/src/lib/portal-data.ts` — aggregate queries and domain response mapping
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — Drizzle tables for donors, donations, campaigns, and activity

## Architecture decisions

- Clerk is used for staff authentication; the API protects all portal operations with Clerk session auth.
- The public root is a staff-access landing page; authenticated staff are routed to `/dashboard`.
- Donation amounts are stored as integer cents in PostgreSQL and exposed as numeric currency amounts through the API.
- OpenAPI drives both the typed React Query client and generated Zod request/response validation.

## Product

- Staff can sign in or create an account, then review dashboard KPIs and recent activity.
- Donors, donations, and campaigns support list/search/filter, detail, create, edit, and delete flows.
- Impact reporting derives headline metrics and allocation summaries from donation data.
- Settings shows the signed-in staff identity, role, and security/access guidance.

## User preferences

- Keep the visual language warm, editorial, and conservation-focused: ivory paper, deep red, clay accents, and restrained motion.

## Gotchas

- Regenerate API client and Zod output after changing `lib/api-spec/openapi.yaml`.
- Run the development database push after changing Drizzle schema files.
- Portal production builds need `PORT` and `BASE_PATH` environment variables when run outside the workflow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
