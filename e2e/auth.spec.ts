import { test, expect } from "@playwright/test";

test.describe("Auth boundaries", () => {
  test("unauthenticated watchlist shows sign-in prompt with button", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page.locator("h2:has-text('Sign in to view your watchlist')")).toBeVisible();
    await expect(page.locator("button:has-text('Sign in')")).toBeVisible();
  });

  test("unauthenticated profile shows sign-in prompt with button", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("h2:has-text('Sign in to view your profile')")).toBeVisible();
    await expect(page.locator("button:has-text('Sign in')")).toBeVisible();
  });

  test("sign-in button on watchlist opens login modal", async ({ page }) => {
    await page.goto("/watchlist");
    await page.click("button:has-text('Sign in')");
    await expect(page.locator("text=Sign in to CineSensei")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("button:has-text('Continue with Google')")).toBeVisible();
  });

  test("sign-in button on profile opens login modal", async ({ page }) => {
    await page.goto("/profile");
    await page.click("button:has-text('Sign in')");
    await expect(page.locator("text=Sign in to CineSensei")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("button:has-text('Continue with Google')")).toBeVisible();
  });

  test("home page is public and shows no sign-in wall", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Sign in to view")).not.toBeVisible();
    await expect(page).toHaveTitle(/CineSensei/);
  });

  test("discover page is public and shows no sign-in wall", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.locator("text=Sign in to view")).not.toBeVisible();
    await expect(page.locator("h1", { hasText: "Discover" })).toBeVisible();
  });

  test("lottery page is public and shows no sign-in wall", async ({ page }) => {
    await page.goto("/lottery");
    await expect(page.locator("text=Sign in to view")).not.toBeVisible();
    await expect(page.locator("h1", { hasText: "Lottery Mode" })).toBeVisible();
  });

  test("search page is public and shows no sign-in wall", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("text=Sign in to view")).not.toBeVisible();
    await expect(page.locator("h1", { hasText: "Search" })).toBeVisible();
  });

  test("login modal can be closed", async ({ page }) => {
    await page.goto("/watchlist");
    await page.click("button:has-text('Sign in')");
    await expect(page.locator("text=Sign in to CineSensei")).toBeVisible({ timeout: 5000 });
    // Close modal via the X button
    await page.locator("button[class*='absolute']").click();
    await expect(page.locator("text=Sign in to CineSensei")).not.toBeVisible({ timeout: 3000 });
  });
});
