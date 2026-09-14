# Wildlife Rescue Case Management System

This backend feature adds a self-contained wildlife rescue case workflow to the existing Wild Haven API.

## What is included

- Rescue case CRUD with search, filtering, pagination, and basic sorting
- Rescue case notes CRUD
- Rescue case status history retrieval
- Animal medical records CRUD
- Rescue expense CRUD
- Rescue team assignment endpoints
- Rescue dashboard summary

## Main routes

### Rescue cases
- `GET /api/rescue-cases`
- `POST /api/rescue-cases`
- `GET /api/rescue-cases/:id`
- `PATCH /api/rescue-cases/:id`
- `DELETE /api/rescue-cases/:id`

### Rescue case notes
- `GET /api/rescue-cases/:id/notes`
- `POST /api/rescue-cases/:id/notes`
- `PATCH /api/rescue-cases/:id/notes/:noteId`
- `DELETE /api/rescue-cases/:id/notes/:noteId`

### Rescue case status history
- `GET /api/rescue-cases/:id/history`

### Animal medical records
- `GET /api/rescue-cases/:id/medical-records`
- `POST /api/rescue-cases/:id/medical-records`
- `PATCH /api/rescue-cases/:id/medical-records/:recordId`
- `DELETE /api/rescue-cases/:id/medical-records/:recordId`

### Rescue expenses
- `GET /api/rescue-cases/:id/expenses`
- `POST /api/rescue-cases/:id/expenses`
- `PATCH /api/rescue-cases/:id/expenses/:expenseId`
- `DELETE /api/rescue-cases/:id/expenses/:expenseId`

### Rescue team assignment
- `POST /api/rescue-cases/:id/assign`
- `DELETE /api/rescue-cases/:id/assign`
- `GET /api/rescue-cases/assigned/:employeeId`

### Rescue dashboard
- `GET /api/rescue-dashboard`

## Query filters

The rescue case list endpoint supports:
- `search`
- `status`
- `priority`
- `severity`
- `rescueType`
- `location`
- `assignedEmployeeId`
- `fromDate`
- `toDate`
- `limit`
- `offset`
- `sort`

## Data model notes

The feature adds the following new database schema modules under the existing Backend structure:
- `rescueCases`
- `rescueCaseNotes`
- `rescueCaseStatusHistory`
- `animalMedicalRecords`
- `rescueExpenses`

The route layer reuses the current project patterns for auth, validation, database access, and error responses.
