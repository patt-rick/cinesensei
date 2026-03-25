import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows navigation", async ({ page }) => {
    await page.goto("/");
    // Navigation should be visible
    await expect(page.locator("text=CineSensei")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("shows hero section", async ({ page }) => {
    await page.goto("/");
    // Hero area exists
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();
  });

  test("shows trending section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Trending Now").first()).toBeVisible({ timeout: 15000 });
  });

  test("shows anime section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Top Anime")).toBeVisible({ timeout: 15000 });
  });

  test("shows AI recommendations banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=AI-Powered Recommendations")).toBeVisible({ timeout: 15000 });
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CineSensei/);
  });
});
