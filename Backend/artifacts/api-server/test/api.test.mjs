import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const clerk = vi.hoisted(() => ({
  getAuth: vi.fn(),
}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req, _res, next) => next(),
  getAuth: clerk.getAuth,
}));

vi.mock("@clerk/shared/keys", () => ({
  publishableKeyFromHost: () => "pk_test_local",
}));

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/wild_haven_test";

const { default: app } = await import("../src/app.ts");

describe("API routes", () => {
  beforeEach(() => {
    clerk.getAuth.mockReset();
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

  it("rejects an invalid donor request before accessing the database", async () => {
    clerk.getAuth.mockReturnValue({ userId: "staff_test_123" });

    const response = await request(app)
      .post("/api/donors")
      .send({ name: "A", email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });
});
