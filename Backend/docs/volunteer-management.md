# Volunteer Management API

The volunteer module provides CRUD for volunteers, applications, assignments, and hour records, plus approval workflows, dashboard metrics, search, and reporting. The documented contract is in `lib/api-spec/openapi.yaml`; generated React client and Zod exports are in `lib/api-client-react` and `lib/api-zod`.

Assignments use `assignmentType` with `referenceId`: `rescue_case` points to a rescue case, while `conservation_project` and `event` retain their source-system record ID. This keeps assignments usable before separate project or event tables are introduced.

Applications transition through `pending`, `approved`, `rejected`, and `hold` with the approve, reject, and hold actions. Hour records use `pending`, `approved`, and `rejected`; only approved hours contribute to dashboard totals.
