import { test, expect } from "@playwright/test";

test.describe("API routes", () => {
  test("GET /api/trending returns results", async ({ request }) => {
    const res = await request.get("/api/trending");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test("GET /api/titles returns results", async ({ request }) => {
    const res = await request.get("/api/titles");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("GET /api/search with query returns results", async ({ request }) => {
    const res = await request.get("/api/search?q=demon");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
  });

  test("GET /api/lottery returns picks", async ({ request }) => {
    const res = await request.get("/api/lottery");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test("GET /api/anime returns results", async ({ request }) => {
    const res = await request.get("/api/anime");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("GET /api/titles with type=anime returns anime", async ({ request }) => {
    const res = await request.get("/api/titles?type=anime");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results.every((t: { type: string }) => t.type === "anime")).toBe(true);
  });

  test("GET /api/titles with type=movie returns movies", async ({ request }) => {
    const res = await request.get("/api/titles?type=movie");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.results.every((t: { type: string }) => t.type === "movie")).toBe(true);
  });
});
