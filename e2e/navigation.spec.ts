import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates to Discover page", async ({ page }) => {
    await page.goto("/");
    // Click the visible nav link (sidebar on desktop, bottom bar on mobile)
    await page.click("a[href='/discover']:visible");
    await expect(page).toHaveURL("/discover");
    await expect(page.locator("h1", { hasText: "Discover" })).toBeVisible();
  });

  test("navigates to Lottery page", async ({ page }) => {
    await page.goto("/");
    await page.click("a[href='/lottery']:visible");
    await expect(page).toHaveURL("/lottery");
    await expect(page.locator("h1", { hasText: "Lottery Mode" })).toBeVisible();
  });

  test("navigates to Watchlist page", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page).toHaveURL("/watchlist");
    // Unauthenticated: sign-in prompt; authenticated: watchlist heading
    await expect(
      page.locator("h1:has-text('My Watchlist')").or(page.locator("h2:has-text('Sign in to view your watchlist')"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("navigates to Profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL("/profile");
    // Unauthenticated: sign-in prompt
    await expect(page.locator("h2:has-text('Sign in to view your profile')")).toBeVisible({ timeout: 10000 });
  });

  test("navigates to Search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1", { hasText: "Search" })).toBeVisible();
  });
});
