import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const rescueData = vi.hoisted(() => ({
  getRescueCaseRecord: vi.fn(),
  listRescueCases: vi.fn(),
}));

vi.mock("@clerk/express", () => ({ clerkMiddleware: () => (_req, _res, next) => next() }));
vi.mock("@clerk/shared/keys", () => ({ publishableKeyFromHost: () => "pk_test_local" }));
vi.mock("../src/middlewares/requireAuth.ts", () => ({ requireAuth: (_req, _res, next) => next() }));
vi.mock("../src/lib/rescue-case-data.ts", () => new Proxy(rescueData, { get: (target, key) => target[key] ?? vi.fn() }));
vi.mock("../src/lib/portal-data.ts", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("../src/lib/adoption-sponsorship-data.ts", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("@workspace/api-zod", () => new Proxy({}, { get: () => vi.fn() }));
vi.mock("@workspace/db", () => new Proxy({ db: {} }, { get: (target, key) => target[key] }));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), desc: vi.fn(), eq: vi.fn(), ilike: vi.fn(), or: vi.fn(), sql: vi.fn() }));

const { default: app } = await import("../src/app.ts");

describe("rescue case routes", () => {
  beforeEach(() => {
    rescueData.getRescueCaseRecord.mockReset();
    rescueData.listRescueCases.mockReset();
    rescueData.listRescueCases.mockResolvedValue([]);
  });

  it("rejects malformed date filters before querying", async () => {
    const response = await request(app).get("/api/rescue-cases?fromDate=not-a-date");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid fromDate" });
    expect(rescueData.listRescueCases).not.toHaveBeenCalled();
  });

  it("rejects an inverted date range before querying", async () => {
    const response = await request(app).get("/api/rescue-cases?fromDate=2026-03-02&toDate=2026-03-01");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "fromDate must be before toDate" });
  });

  it("rejects unsupported status filters before querying", async () => {
    const response = await request(app).get("/api/rescue-cases?status=unknown");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid status" });
    expect(rescueData.listRescueCases).not.toHaveBeenCalled();
  });

  it("returns 404 for a missing rescue case", async () => {
    rescueData.getRescueCaseRecord.mockResolvedValue(undefined);

    const response = await request(app).get("/api/rescue-cases/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Rescue case not found" });
  });
});
