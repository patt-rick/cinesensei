import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates to Discover page", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/discover']");
    await expect(page).toHaveURL("/discover");
    await expect(page.locator("h1", { hasText: "Discover" })).toBeVisible();
  });

  test("navigates to Lottery page", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/lottery']");
    await expect(page).toHaveURL("/lottery");
    await expect(page.locator("h1", { hasText: "Lottery Mode" })).toBeVisible();
  });

  test("navigates to Watchlist page", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.locator("text=Watchlist")).toBeVisible();
  });

  test("navigates to Profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Profile").or(page.locator("text=Sign in"))).toBeVisible();
  });

  test("navigates to Search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1", { hasText: "Search" })).toBeVisible();
  });
});
