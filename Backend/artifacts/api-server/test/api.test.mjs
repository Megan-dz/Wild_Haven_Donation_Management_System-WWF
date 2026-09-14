import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const clerk = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

const portalData = vi.hoisted(() => ({
  addActivity: vi.fn(),
  getDonorRecord: vi.fn(),
  listDonorRecords: vi.fn(),
  getCampaignRecord: vi.fn(),
  listCampaignRecords: vi.fn(),
}));

const dbMock = vi.hoisted(() => ({
  select: vi.fn(),
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

const activityTable = vi.hoisted(() => ({
  createdAt: "activity.created_at",
}));
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
  getCampaignRecord: portalData.getCampaignRecord,
  listCampaignRecords: portalData.listCampaignRecords,
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
    portalData.getCampaignRecord.mockReset();
    portalData.listCampaignRecords.mockReset();
    dbMock.select.mockReset();
    dbMock.insert.mockReset();
    dbMock.update.mockReset();
    dbMock.delete.mockReset();
    portalData.listDonorRecords.mockResolvedValue([]);
    portalData.listCampaignRecords.mockResolvedValue([]);
  });

  it("returns a public health response", async () => {
    const response = await request(app).get("/api/healthz");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated access to dashboard", async () => {
    clerk.getAuth.mockReturnValue(null);

    const response = await request(app).get("/api/dashboard");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("returns a complete dashboard summary for authenticated requests", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    portalData.listCampaignRecords.mockResolvedValue([
      {
        id: 1,
        name: "Forest Guard",
        species: "Leopard",
        location: "Karnataka",
        description: "Support local wildlife volunteers.",
        goal: 2000,
        raised: 1500,
        status: "active",
        supporters: 10,
        createdAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: 2,
        name: "Elephant Corridor",
        species: "Elephant",
        location: "Odisha",
        description: "Safeguarding migration routes.",
        goal: 500,
        raised: 600,
        status: "completed",
        supporters: 18,
        createdAt: "2026-08-05T00:00:00.000Z",
      },
    ]);

    dbMock.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 250000 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 180000 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 38 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 4 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              { donatedAt: new Date("2026-01-01T00:00:00.000Z"), amountCents: 12500 },
              { donatedAt: new Date("2026-02-01T00:00:00.000Z"), amountCents: 25000 },
            ]),
          }),
        }),
      });

    const response = await request(app).get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalRaised: 2500,
      totalRaisedChange: 18.4,
      donorCount: 38,
      donorCountChange: 9.2,
      activeCampaignCount: 4,
      monthlyRecurring: 1800,
      monthlyRecurringChange: 12.8,
      campaignProgress: [
        {
          id: 1,
          name: "Forest Guard",
          raised: 1500,
          goal: 2000,
          percent: 75,
          status: "active",
        },
        {
          id: 2,
          name: "Elephant Corridor",
          raised: 600,
          goal: 500,
          percent: 100,
          status: "completed",
        },
      ],
      donationTrend: [
        { label: "Jan", value: 125 },
        { label: "Feb", value: 250 },
      ],
    });
    expect(portalData.listCampaignRecords).toHaveBeenCalledWith(undefined, undefined, 6);
  });

  it("returns zeroed dashboard values when the underlying data is empty", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    portalData.listCampaignRecords.mockResolvedValue([]);

    dbMock.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 0 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 0 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 0 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ value: 0 }]),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

    const response = await request(app).get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalRaised: 0,
      totalRaisedChange: 18.4,
      donorCount: 0,
      donorCountChange: 9.2,
      activeCampaignCount: 0,
      monthlyRecurring: 0,
      monthlyRecurringChange: 12.8,
      campaignProgress: [],
      donationTrend: [],
    });
  });

  it("rejects unauthenticated access to activity", async () => {
    clerk.getAuth.mockReturnValue(null);

    const response = await request(app).get("/api/activity");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("lists activity for authenticated requests with a custom limit", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const activity = [
      {
        id: 1,
        type: "donation",
        title: "Donation recorded",
        detail: "₹125.5 donation added to the ledger.",
        createdAt: "2026-09-10T08:00:00.000Z",
      },
      {
        id: 2,
        type: "campaign",
        title: "Campaign created",
        detail: "Forest Guard was added to the campaign portfolio.",
        createdAt: "2026-09-09T12:30:00.000Z",
      },
    ];

    const limitMock = vi.fn().mockResolvedValue(activity);
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    dbMock.select.mockReturnValue({ from: fromMock });

    const response = await request(app).get("/api/activity?limit=7");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(activity);
    expect(dbMock.select).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith(activityTable);
    expect(orderByMock).toHaveBeenCalledWith(expect.anything());
    expect(limitMock).toHaveBeenCalledWith(7);
  });

  it("uses the default activity limit when no limit query parameter is provided", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const activity = [
      {
        id: 3,
        type: "donor",
        title: "New donor added",
        detail: "Nisha Kumar was added to the donor directory.",
        createdAt: "2026-09-08T10:15:00.000Z",
      },
    ];

    const limitMock = vi.fn().mockResolvedValue(activity);
    const orderByMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    dbMock.select.mockReturnValue({ from: fromMock });

    const response = await request(app).get("/api/activity");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(activity);
    expect(limitMock).toHaveBeenCalledWith(50);
  });

  it("rejects invalid activity query parameters", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app).get("/api/activity?limit=0");

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
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

  it("rejects unauthenticated access to campaigns", async () => {
    clerk.getAuth.mockReturnValue(null);

    const response = await request(app).get("/api/campaigns");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("lists campaigns for authenticated requests", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const campaigns = [
      {
        id: 1,
        name: "Snow Leopard Patrol",
        species: "Snow leopard",
        location: "Himachal Pradesh",
        description: "Protecting high-altitude habitat zones.",
        goal: 2500,
        raised: 1800,
        status: "active",
        supporters: 28,
        createdAt: "2026-08-01T00:00:00.000Z",
      },
    ];

    portalData.listCampaignRecords.mockResolvedValue(campaigns);

    const response = await request(app).get("/api/campaigns");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(campaigns);
    expect(portalData.listCampaignRecords).toHaveBeenCalledWith(undefined, undefined, 50);
  });

  it("gets a campaign by id for authenticated requests", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const campaign = {
      id: 9,
      name: "Elephant Corridor",
      species: "Elephant",
      location: "Odisha",
      description: "Safeguarding migration routes.",
      goal: 3000,
      raised: 2100,
      status: "paused",
      supporters: 14,
      createdAt: "2026-08-05T00:00:00.000Z",
    };

    portalData.getCampaignRecord.mockResolvedValue(campaign);

    const response = await request(app).get("/api/campaigns/9");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(campaign);
    expect(portalData.getCampaignRecord).toHaveBeenCalledWith(9);
  });

  it("returns 404 when a campaign id does not exist", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    portalData.getCampaignRecord.mockResolvedValue(undefined);

    const response = await request(app).get("/api/campaigns/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Campaign not found" });
  });

  it("creates a valid campaign", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const payload = {
      name: "Forest Guard",
      species: "Leopard",
      location: "Karnataka",
      description: "Support local wildlife volunteers.",
      goal: 1800,
      status: "active",
    };

    dbMock.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 12 }]),
      }),
    });

    const createdCampaign = {
      id: 12,
      ...payload,
      raised: 0,
      supporters: 0,
      createdAt: "2026-09-12T00:00:00.000Z",
    };

    portalData.getCampaignRecord.mockResolvedValue(createdCampaign);

    const response = await request(app)
      .post("/api/campaigns")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdCampaign);
    expect(portalData.addActivity).toHaveBeenCalledWith(
      "campaign",
      "Campaign created",
      "Forest Guard was added to the campaign portfolio.",
    );
  });

  it("rejects invalid campaign data before accessing the database", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/campaigns")
      .send({
        name: "A",
        species: "Leopard",
        location: "Karnataka",
        description: "Support local wildlife volunteers.",
        goal: 0,
        status: "active",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("updates a campaign", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const updatedCampaign = {
      id: 9,
      name: "Elephant Corridor",
      species: "Elephant",
      location: "Odisha",
      description: "Safeguarding migration routes.",
      goal: 3400,
      raised: 2100,
      status: "completed",
      supporters: 14,
      createdAt: "2026-08-05T00:00:00.000Z",
    };

    dbMock.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 9 }]),
        }),
      }),
    });

    portalData.getCampaignRecord.mockResolvedValue(updatedCampaign);

    const response = await request(app)
      .patch("/api/campaigns/9")
      .send({ goal: 34, status: "completed" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedCampaign);
    expect(portalData.getCampaignRecord).toHaveBeenCalledWith(9);
  });

  it("rejects invalid campaign updates when goal is non-positive", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .patch("/api/campaigns/9")
      .send({ goal: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("deletes a campaign", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    dbMock.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 9 }]),
      }),
    });

    const response = await request(app).delete("/api/campaigns/9");

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
  });

  it("creates a valid donation", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const payload = {
      donorId: 7,
      amount: 125.5,
      frequency: "monthly",
      status: "completed",
      campaignId: 3,
      donatedAt: "2026-09-10T08:00:00.000Z",
    };

    dbMock.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 99 }]),
      }),
    });

    const createdDonation = {
      id: 99,
      donorId: 7,
      donorName: "Rohan Mehta",
      amount: 125.5,
      currency: "INR",
      frequency: "monthly",
      status: "completed",
      campaignId: 3,
      campaignName: "Snow Leopard Patrol",
      donatedAt: new Date("2026-09-10T08:00:00.000Z"),
      receiptNumber: "WH-12345678",
    };

    portalData.getDonationRecord.mockResolvedValue(createdDonation);

    const response = await request(app)
      .post("/api/donations")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdDonation);
    expect(portalData.addActivity).toHaveBeenCalledWith(
      "donation",
      "Donation recorded",
      expect.stringContaining("₹125.5"),
    );
  });

  it("rejects invalid donation input before accessing the database", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donations")
      .send({ donorId: 0, amount: 25, frequency: "one_time", status: "completed" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("rejects a donation when campaignId is non-positive", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donations")
      .send({ donorId: 7, amount: 25, frequency: "one_time", status: "completed", campaignId: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("rejects invalid donatedAt input", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donations")
      .send({ donorId: 7, amount: 25, frequency: "one_time", status: "completed", donatedAt: "not-a-date" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it("rejects invalid donation updates when campaignId is non-positive", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .patch("/api/donations/7")
      .send({ campaignId: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
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
