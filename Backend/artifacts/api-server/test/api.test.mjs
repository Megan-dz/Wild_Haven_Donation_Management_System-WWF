import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const clerk = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

const portalData = vi.hoisted(() => ({
  addActivity: vi.fn(),
  getDonorRecord: vi.fn(),
  listDonorRecords: vi.fn(),
}));

const dbMock = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

const donorsTable = vi.hoisted(() => ({
  id: "donors.id",
  name: "donors.name",
  email: "donors.email",
  phone: "donors.phone",
  city: "donors.city",
  createdAt: "donors.created_at",
}));

const activityTable = vi.hoisted(() => ({}));
const campaignsTable = vi.hoisted(() => ({}));
const donationsTable = vi.hoisted(() => ({}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req, _res, next) => next(),
  getAuth: clerk.getAuth,
}));

vi.mock("@clerk/shared/keys", () => ({
  publishableKeyFromHost: () => "pk_test_local",
}));

vi.mock("@workspace/db", () => ({
  db: dbMock,
  donorsTable,
  activityTable,
  campaignsTable,
  donationsTable,
}));

vi.mock("../src/lib/portal-data.ts", () => ({
  addActivity: portalData.addActivity,
  getDonorRecord: portalData.getDonorRecord,
  listDonorRecords: portalData.listDonorRecords,
  currency: vi.fn((value) => Math.round(Number(value ?? 0)) / 100),
  getCampaignRecord: vi.fn(),
  listCampaignRecords: vi.fn(),
  getDonationRecord: vi.fn(),
  listDonationRecords: vi.fn(),
}));

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/wild_haven_test";

const { default: app } = await import("../src/app.ts");

describe("API routes", () => {
  beforeEach(() => {
    clerk.getAuth.mockReset();
    portalData.addActivity.mockReset();
    portalData.getDonorRecord.mockReset();
    portalData.listDonorRecords.mockReset();
    dbMock.insert.mockReset();
    dbMock.update.mockReset();
    dbMock.delete.mockReset();
    portalData.listDonorRecords.mockResolvedValue([]);
  });

  it("returns a public health response", async () => {
    const response = await request(app).get("/api/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated access to donors", async () => {
    clerk.getAuth.mockReturnValue(null);

    const response = await request(app).get("/api/donors");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("lists donors for authenticated requests", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const donors = [
      {
        id: 1,
        name: "Asha Patel",
        email: "asha@example.com",
        phone: "+91 98765 43210",
        city: "Pune",
        totalGiven: 1500,
        donationCount: 2,
        lastGiftAt: "2026-01-10T00:00:00.000Z",
        createdAt: "2025-12-01T00:00:00.000Z",
      },
    ];

    portalData.listDonorRecords.mockResolvedValue(donors);

    const response = await request(app).get("/api/donors");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(donors);
    expect(portalData.listDonorRecords).toHaveBeenCalledWith(undefined, 50);
  });

  it("gets a donor by id for authenticated requests", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const donor = {
      id: 7,
      name: "Rohan Mehta",
      email: "rohan@example.com",
      phone: "+91 99887 66554",
      city: "Mumbai",
      totalGiven: 1000,
      donationCount: 1,
      lastGiftAt: "2026-02-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    portalData.getDonorRecord.mockResolvedValue(donor);

    const response = await request(app).get("/api/donors/7");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(donor);
    expect(portalData.getDonorRecord).toHaveBeenCalledWith(7);
  });

  it("creates a valid donor", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const payload = {
      name: "Nisha Kumar",
      email: "nisha@example.com",
      phone: "+91 98765 12345",
      city: "Bengaluru",
    };

    dbMock.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 42 }]),
      }),
    });

    const createdDonor = {
      id: 42,
      ...payload,
      totalGiven: 0,
      donationCount: 0,
      lastGiftAt: null,
      createdAt: "2026-03-05T00:00:00.000Z",
    };

    portalData.getDonorRecord.mockResolvedValue(createdDonor);

    const response = await request(app)
      .post("/api/donors")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdDonor);
    expect(portalData.addActivity).toHaveBeenCalledWith(
      "donor",
      "New donor added",
      "Nisha Kumar was added to the donor directory.",
    );
  });

  it("rejects invalid donor data before accessing the database", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donors")
      .send({ name: "A", email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("rejects a donor name that contains only whitespace", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donors")
      .send({ name: "   ", email: "donor@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("updates a donor", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const updatedDonor = {
      id: 7,
      name: "Rohan Mehta",
      email: "rohan@example.com",
      phone: "+91 99887 66554",
      city: "Delhi",
      totalGiven: 1000,
      donationCount: 1,
      lastGiftAt: "2026-02-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    dbMock.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 7 }]),
        }),
      }),
    });

    portalData.getDonorRecord.mockResolvedValue(updatedDonor);

    const response = await request(app)
      .patch("/api/donors/7")
      .send({ city: "Delhi" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedDonor);
    expect(portalData.getDonorRecord).toHaveBeenCalledWith(7);
  });

  it("deletes a donor", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    dbMock.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 7 }]),
      }),
    });

    const response = await request(app).delete("/api/donors/7");

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
  });
});
