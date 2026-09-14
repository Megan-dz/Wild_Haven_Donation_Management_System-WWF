import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const analytics = vi.hoisted(() => ({
  getDonationAnalytics: vi.fn(),
}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req, _res, next) => next(),
}));

vi.mock("@clerk/shared/keys", () => ({
  publishableKeyFromHost: () => "pk_test_local",
}));

vi.mock("../src/middlewares/requireAuth.ts", () => ({
  requireAuth: (_req, _res, next) => next(),
}));

vi.mock("../src/lib/portal-data.ts", () => new Proxy({ getDonationAnalytics: analytics.getDonationAnalytics }, {
  get: (target, property) => target[property] ?? vi.fn(),
}));
vi.mock("../src/lib/rescue-case-data.ts", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("../src/lib/adoption-sponsorship-data.ts", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("@workspace/api-zod", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("@workspace/db", () => new Proxy({ db: {} }, { get: (target, property) => target[property] }));
vi.mock("drizzle-orm", () => ({
  and: vi.fn(),
  desc: vi.fn(),
  eq: vi.fn(),
  ilike: vi.fn(),
  or: vi.fn(),
  sql: vi.fn(),
}));

const { default: app } = await import("../src/app.ts");

describe("donation analytics route", () => {
  beforeEach(() => {
    analytics.getDonationAnalytics.mockReset();
    analytics.getDonationAnalytics.mockResolvedValue({
      summary: { totalDonations: 0, totalAmount: 0, averageAmount: 0 },
      byCampaign: [],
      byMonth: [],
      byStatus: [],
      topDonors: [],
      recentDonations: [],
      campaignProgress: [],
    });
  });

  it("passes campaign, status, and date filters to the analytics query", async () => {
    const response = await request(app).get(
      "/api/donation-analytics?campaignId=7&status=completed&from=2026-01-01&to=2026-01-31",
    );

    expect(response.status).toBe(200);
    expect(analytics.getDonationAnalytics).toHaveBeenCalledWith({
      campaignId: 7,
      status: "completed",
      fromDate: new Date("2026-01-01"),
      toDate: new Date("2026-01-31"),
    });
  });

  it("rejects an invalid date range before querying", async () => {
    const response = await request(app).get(
      "/api/donation-analytics?from=2026-02-01&to=2026-01-01",
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "from date must be before to date" });
    expect(analytics.getDonationAnalytics).not.toHaveBeenCalled();
  });
});
