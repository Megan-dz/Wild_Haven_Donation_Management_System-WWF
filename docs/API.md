# Backend API Documentation

This document describes the currently implemented backend API in the project. The Express server mounts the API under `/api`, as defined in the backend app entry point.

## Base URL

- Base path: `/api`
- Health endpoint: `/api/healthz`

## Authentication

- `GET /api/healthz` is public.
- All other endpoints require authentication via Clerk session claims.
- The backend enforces this with `requireAuth`, which returns `401 Authentication required` when no authenticated user is present.
- Authenticated requests receive `userId` from the Clerk session and expose a staff profile via `/api/auth/me`.

## Common Response Codes

- `200 OK`: successful read/update
- `201 Created`: successful create
- `204 No Content`: successful delete
- `400 Bad Request`: invalid query/body parameters
- `401 Unauthorized`: missing or invalid authentication
- `404 Not Found`: requested entity does not exist
- `409 Conflict`: duplicate record (for example, duplicate donor/campaign/donation creation)
- `500 Internal Server Error`: unhandled server error

## Endpoints

### Health

#### `GET /api/healthz`
- Purpose: health check endpoint
- Authentication: none
- Response: `{ status: "ok" }`

### Authentication

#### `GET /api/auth/me`
- Purpose: returns the authenticated staff profile derived from Clerk session claims
- Authentication: required
- Response shape:
  - `id`
  - `name`
  - `email`
  - `role` (`manager`)
  - `initials`

### Dashboard and Overview

#### `GET /api/dashboard`
- Purpose: returns dashboard summary data
- Authentication: required
- Response includes:
  - `totalRaised`
  - `totalRaisedChange`
  - `donorCount`
  - `donorCountChange`
  - `activeCampaignCount`
  - `monthlyRecurring`
  - `monthlyRecurringChange`
  - `campaignProgress` (campaign fundraising progress)
  - `donationTrend` (monthly donation totals by label)

#### `GET /api/activity`
- Purpose: returns recent activity items
- Authentication: required
- Query parameters:
  - `limit` (optional, default `50`)
- Response: array of recent activity items, ordered newest first

#### `GET /api/impact`
- Purpose: returns impact summary data
- Authentication: required
- Response includes:
  - `acresProtected`
  - `rescueMissions`
  - `activeGuards`
  - `communityPrograms`
  - `allocation` (percent and amount breakdown)

### Donors

#### `GET /api/donors`
- Purpose: list donors
- Authentication: required
- Query parameters:
  - `search` (optional)
  - `limit` (optional, default `50`)
- Response: array of donor records

#### `POST /api/donors`
- Purpose: create a donor
- Authentication: required
- Request body:
  - `name` (required)
  - `email` (required)
  - `phone` (optional)
- Response: created donor record (`201 Created`)

#### `GET /api/donors/:id`
- Purpose: fetch a single donor by ID
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: donor record or `404 Not Found`

#### `PATCH /api/donors/:id`
- Purpose: update a donor
- Authentication: required
- Path parameter:
  - `id` (integer)
- Request body: partial donor fields (`name`, `email`, `phone`)
- Response: updated donor record

#### `DELETE /api/donors/:id`
- Purpose: delete a donor
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: `204 No Content` on success

### Donations

#### `GET /api/donations`
- Purpose: list donations
- Authentication: required
- Query parameters:
  - `search` (optional)
  - `status` (optional)
  - `campaignId` (optional)
  - `limit` (optional, default `50`)
- Response: array of donation records

#### `POST /api/donations`
- Purpose: create a donation
- Authentication: required
- Request body:
  - `donorId` (optional)
  - `campaignId` (optional)
  - `donorName` (required)
  - `donorEmail` (required)
  - `amount` (required, numeric)
  - `status` (optional)
  - `paymentMethod` (optional)
  - `notes` (optional)
- Notes:
  - `amount` is converted to cents internally
  - a receipt number is generated automatically
- Response: created donation record (`201 Created`)

#### `GET /api/donations/:id`
- Purpose: fetch a single donation by ID
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: donation record or `404 Not Found`

#### `PATCH /api/donations/:id`
- Purpose: update a donation
- Authentication: required
- Path parameter:
  - `id` (integer)
- Request body: partial donation fields (`amount`, `frequency`, `status`, `campaignId`, `donatedAt`)
- Response: updated donation record

#### `DELETE /api/donations/:id`
- Purpose: delete a donation
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: `204 No Content` on success

### Campaigns

#### `GET /api/campaigns`
- Purpose: list campaigns
- Authentication: required
- Query parameters:
  - `search` (optional)
  - `status` (optional)
  - `limit` (optional, default `50`)
- Response: array of campaign records

#### `POST /api/campaigns`
- Purpose: create a campaign
- Authentication: required
- Request body:
  - `name` (required)
  - `description` (optional)
  - `species` (required)
  - `targetAmount` (required, numeric)
  - `status` (optional)
  - `imageUrl` (optional)
  - `startDate` (optional)
  - `endDate` (optional)
- Notes:
  - `targetAmount` is converted to cents internally
- Response: created campaign record (`201 Created`)

#### `GET /api/campaigns/:id`
- Purpose: fetch a single campaign by ID
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: campaign record or `404 Not Found`

#### `PATCH /api/campaigns/:id`
- Purpose: update a campaign
- Authentication: required
- Path parameter:
  - `id` (integer)
- Request body: partial campaign fields (`name`, `description`, `species`, `targetAmount`, `status`, `imageUrl`, `startDate`, `endDate`)
- Response: updated campaign record

#### `DELETE /api/campaigns/:id`
- Purpose: delete a campaign
- Authentication: required
- Path parameter:
  - `id` (integer)
- Response: `204 No Content` on success

## Notes

- The backend uses `@workspace/api-zod` schemas to validate request and response payloads.
- The route layer also logs activity entries for donor, donation, and campaign create operations.
- This document reflects the currently implemented routes and behavior present in the backend code, without changing application logic or architecture.
