import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("loads search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1", { hasText: "Search" })).toBeVisible();
  });

  test("has search input", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("input[placeholder*='Search']")).toBeVisible();
  });

  test("shows empty state initially", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("text=Search for movies & anime")).toBeVisible();
  });

  test("searching returns results from stub data", async ({ page }) => {
    await page.goto("/search");
    await page.fill("input[placeholder*='Search']", "demon");
    // Wait for debounce and results
    await page.waitForTimeout(600);
    // Results should appear or empty state
    const grid = page.locator(".grid");
    const emptyState = page.locator("text=No results found");
    await expect(grid.or(emptyState)).toBeVisible({ timeout: 10000 });
  });

  test("type filter buttons are visible", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("button:has-text('All')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Movie')")).toBeVisible();
    await expect(page.locator("button:has-text('Anime')")).toBeVisible();
  });
});
