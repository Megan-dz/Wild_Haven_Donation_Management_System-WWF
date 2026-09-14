import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const dbMock = vi.hoisted(() => ({
  update: vi.fn(),
  delete: vi.fn(),
}));

const rescueCaseNotesTable = vi.hoisted(() => ({
  id: "rescue_case_notes.id",
  rescueCaseId: "rescue_case_notes.rescue_case_id",
}));
const animalMedicalRecordsTable = vi.hoisted(() => ({
  id: "animal_medical_records.id",
  rescueCaseId: "animal_medical_records.rescue_case_id",
}));
const rescueExpensesTable = vi.hoisted(() => ({
  id: "rescue_expenses.id",
  rescueCaseId: "rescue_expenses.rescue_case_id",
}));
const makeSchema = () => ({
  safeParse: (data) => ({ success: true, data }),
});

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req, _res, next) => next(),
}));

vi.mock("@clerk/shared/keys", () => ({
  publishableKeyFromHost: () => "pk_test_local",
}));

vi.mock("@workspace/api-zod", () => ({}));

vi.mock("@workspace/db", () => ({
  db: dbMock,
  activityTable: {},
  animalMedicalRecordsTable,
  campaignsTable: {},
  conservationAreasTable: {},
  donationsTable: {},
  donorsTable: {},
  donationChallengesTable: {},
  recurringDonationsTable: {},
  rescueCaseNotesTable,
  rescueCaseStatusHistoryTable: {},
  rescueCasesTable: {},
  rescueExpensesTable,
  tasksTable: {},
  insertAnimalMedicalRecordSchema: makeSchema(),
  insertConservationAreaSchema: makeSchema(),
  insertDonationChallengeSchema: makeSchema(),
  insertRecurringDonationSchema: makeSchema(),
  insertRescueCaseNoteSchema: makeSchema(),
  insertRescueCaseSchema: makeSchema(),
  insertRescueExpenseSchema: makeSchema(),
}));

vi.mock("../src/middlewares/requireAuth.ts", () => ({
  requireAuth: (_req, _res, next) => next(),
}));

vi.mock("../src/lib/portal-data.ts", () => ({
  addActivity: vi.fn(),
  currency: vi.fn(),
  getCampaignRecord: vi.fn(),
  getDonorDashboard: vi.fn(),
  getDonorRecord: vi.fn(),
  getDonationChallengeRecord: vi.fn(),
  getDonationRecord: vi.fn(),
  listCampaignRecords: vi.fn(),
  listConservationAreas: vi.fn(),
  listDonationChallenges: vi.fn(),
  listDonationRecords: vi.fn(),
  listDonorRecords: vi.fn(),
}));

vi.mock("../src/lib/rescue-case-data.ts", () => ({
  getRescueDashboard: vi.fn(),
  getRescueCaseRecord: vi.fn(),
  listAnimalMedicalRecords: vi.fn(),
  listRescueCaseNotes: vi.fn(),
  listRescueCaseStatusHistory: vi.fn(),
  listRescueCases: vi.fn(),
  listRescueExpenses: vi.fn(),
}));

vi.mock("drizzle-orm", () => ({
  and: (...conditions) => ({ type: "and", conditions }),
  desc: (column) => ({ type: "desc", column }),
  eq: (column, value) => ({ type: "eq", column, value }),
  ilike: (column, value) => ({ type: "ilike", column, value }),
  or: (...conditions) => ({ type: "or", conditions }),
  sql: () => ({ type: "sql" }),
}));

const { default: app } = await import("../src/app.ts");

const mutationCases = [
  {
    name: "notes",
    path: "notes",
    childParam: "noteId",
    table: rescueCaseNotesTable,
    updateBody: { note: "Updated note" },
    updateResponse: { id: 27, rescueCaseId: 4, note: "Updated note" },
    notFoundMessage: "Rescue case note not found",
  },
  {
    name: "medical records",
    path: "medical-records",
    childParam: "recordId",
    table: animalMedicalRecordsTable,
    updateBody: { diagnosis: "Updated diagnosis" },
    updateResponse: { id: 27, rescueCaseId: 4, diagnosis: "Updated diagnosis" },
    notFoundMessage: "Medical record not found",
  },
  {
    name: "expenses",
    path: "expenses",
    childParam: "expenseId",
    table: rescueExpensesTable,
    updateBody: { description: "Updated expense" },
    updateResponse: { id: 27, rescueCaseId: 4, description: "Updated expense" },
    notFoundMessage: "Rescue expense not found",
  },
];

function configureUpdate(returningRows) {
  const where = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue(returningRows),
  });
  const set = vi.fn().mockReturnValue({ where });
  dbMock.update.mockReturnValue({ set });
  return { set, where };
}

function configureDelete(returningRows) {
  const where = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue(returningRows),
  });
  dbMock.delete.mockReturnValue({ where });
  return { where };
}

describe("nested rescue child mutations", () => {
  beforeEach(() => {
    dbMock.update.mockReset();
    dbMock.delete.mockReset();
  });

  for (const mutationCase of mutationCases) {
    it(`updates the correct ${mutationCase.name} and requires its parent case`, async () => {
      configureUpdate([mutationCase.updateResponse]);

      const response = await request(app)
        .patch(`/api/rescue-cases/4/${mutationCase.path}/27`)
        .send(mutationCase.updateBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mutationCase.updateResponse);
      expect(dbMock.update).toHaveBeenCalledWith(mutationCase.table);
      expect(dbMock.update.mock.results[0].value.set).toHaveBeenCalledWith(
        expect.objectContaining(mutationCase.updateBody),
      );

      const whereExpression = dbMock.update.mock.results[0].value.set.mock.results[0].value.where.mock.calls[0][0];
      expect(whereExpression).toEqual({
        type: "and",
        conditions: [
          { type: "eq", column: mutationCase.table.id, value: 27 },
          { type: "eq", column: mutationCase.table.rescueCaseId, value: 4 },
        ],
      });
    });

    it(`deletes only the ${mutationCase.name} belonging to its parent case`, async () => {
      const { where } = configureDelete([mutationCase.updateResponse]);

      const response = await request(app).delete(`/api/rescue-cases/4/${mutationCase.path}/27`);

      expect(response.status).toBe(204);
      expect(dbMock.delete).toHaveBeenCalledWith(mutationCase.table);
      expect(where).toHaveBeenCalledWith({
        type: "and",
        conditions: [
          { type: "eq", column: mutationCase.table.id, value: 27 },
          { type: "eq", column: mutationCase.table.rescueCaseId, value: 4 },
        ],
      });
    });

    it(`returns not found when the ${mutationCase.name} is not owned by the parent case`, async () => {
      configureUpdate([]);

      const response = await request(app)
        .patch(`/api/rescue-cases/4/${mutationCase.path}/27`)
        .send(mutationCase.updateBody);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: mutationCase.notFoundMessage });
    });
  }
});
