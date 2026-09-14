# Wildlife Adoption & Sponsorship Management System

This backend feature adds a complete adoption and sponsorship workflow to the existing Wild Haven API.

## Core domains

### Adoption applications
- `POST /api/adoptions`
- `GET /api/adoptions`
- `GET /api/adoptions/:id`
- `PATCH /api/adoptions/:id`
- `DELETE /api/adoptions/:id`
- `POST /api/adoptions/:id/approve`
- `POST /api/adoptions/:id/reject`
- `POST /api/adoptions/:id/hold`
- `POST /api/adoptions/:id/assign-reviewer`
- `POST /api/adoptions/:id/review-notes`

### Adoption history
- `GET /api/adoption-histories`
- `POST /api/adoption-histories`
- `GET /api/adoption-histories/:id`
- `PATCH /api/adoption-histories/:id`
- `DELETE /api/adoption-histories/:id`
- `GET /api/animals/:animalId/adoption-history`

### Sponsorship plans
- `GET /api/sponsorship-plans`
- `POST /api/sponsorship-plans`
- `GET /api/sponsorship-plans/:id`
- `PATCH /api/sponsorship-plans/:id`
- `DELETE /api/sponsorship-plans/:id`

### Sponsorships
- `POST /api/sponsorships`
- `GET /api/sponsorships`
- `GET /api/sponsorships/:id`
- `PATCH /api/sponsorships/:id`
- `DELETE /api/sponsorships/:id`
- `POST /api/sponsorships/:id/activate`
- `POST /api/sponsorships/:id/pause`
- `POST /api/sponsorships/:id/resume`
- `POST /api/sponsorships/:id/cancel`
- `POST /api/sponsorships/:id/renew`

### Sponsorship payments
- `POST /api/sponsorships/:id/payments`
- `GET /api/sponsorships/:id/payments`
- `PATCH /api/sponsorship-payments/:id`

### Dashboard and public discovery
- `GET /api/adoption-dashboard`
- `GET /api/sponsorship-dashboard`
- `GET /api/animals/adoption-list`
- `GET /api/animals/sponsorship-list`
- `GET /api/reports/adoptions`
- `GET /api/reports/sponsorships`

## Notes

- The implementation reuses the existing Express router, Drizzle schema patterns, and portal helper conventions already present in Backend.
- New schemas were added under `Backend/lib/db/src/schema` for animals, adoption applications, adoption histories, sponsorship plans, sponsorships, and sponsorship payments.
- List and dashboard helpers were added under `Backend/artifacts/api-server/src/lib/adoption-sponsorship-data.ts`.
- The portal router was extended with the requested routes and lifecycle handling while preserving current routes and behavior.
