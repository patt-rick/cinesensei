import { test, expect } from "@playwright/test";

test.describe("Discover page", () => {
  test("loads discover page with content", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("h1", { hasText: "Discover" })).toBeVisible();
  });

  test("shows filter button", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("button", { hasText: "Filters" })).toBeVisible();
  });

  test("opens filter panel on click", async ({ page }) => {
    await page.goto("/discover");
    await page.click("button:has-text('Filters')");
    await expect(page.locator("text=Genre").first()).toBeVisible();
  });

  test("shows type filter tabs", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("button", { hasText: "All" }).first()).toBeVisible();
    await expect(page.locator("button", { hasText: "Movie" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Anime" })).toBeVisible();
  });

  test("shows title cards after loading", async ({ page }) => {
    await page.goto("/discover");
    // Wait for the grid to appear and have at least one child rendered
    await page.waitForSelector(".grid > *", { timeout: 15000 });
    const firstCard = page.locator(".grid > *").first();
    await expect(firstCard).toBeVisible();
  });
});
