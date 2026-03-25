import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("home page returns HTTP 200", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
  });

  test("home page renders without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await expect(page).toHaveTitle(/CineSensei/);
    expect(errors).toHaveLength(0);
  });

  test("navigation links are visible on home page", async ({ page }) => {
    await page.goto("/");
    // At least one Discover nav link is visible (sidebar on desktop, bottom bar on mobile)
    await expect(page.locator("a[href='/discover']:visible")).toBeVisible();
  });

  test("unauthenticated user sees sign-in prompt on watchlist", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.locator("text=Sign in to view your watchlist")).toBeVisible();
  });

  test("lottery spin button is visible and enabled", async ({ page }) => {
    await page.goto("/lottery");
    const spinBtn = page.locator("button:has-text('Spin the Wheel!')");
    await expect(spinBtn).toBeVisible();
    await expect(spinBtn).toBeEnabled();
  });

  test("discover page loads", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("h1", { hasText: "Discover" })).toBeVisible();
  });

  test("search input is visible on search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("input[placeholder*='Search']")).toBeVisible();
  });
});
