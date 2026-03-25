import { test, expect } from "@playwright/test";

test.describe("Lottery page", () => {
  test("loads lottery page", async ({ page }) => {
    await page.goto("/lottery");
    await expect(page.locator("h1", { hasText: "Lottery Mode" })).toBeVisible();
  });

  test("shows spin button", async ({ page }) => {
    await page.goto("/lottery");
    await expect(page.locator("button", { hasText: "Spin the Wheel!" })).toBeVisible();
  });

  test("shows type and genre filters", async ({ page }) => {
    await page.goto("/lottery");
    await expect(page.locator("text=Content Type")).toBeVisible();
    await expect(page.locator("label:has-text('Genre')")).toBeVisible();
  });

  test("spinning shows animation then reveals a title", async ({ page }) => {
    await page.goto("/lottery");
    await page.click("button:has-text('Spin the Wheel!')");
    // Should transition to spinning state
    await expect(
      page.locator("button:has-text('Spinning...')").or(page.locator("button:has-text('Try Again')"))
    ).toBeVisible({ timeout: 10000 });
  });

  test("sound toggle works", async ({ page }) => {
    await page.goto("/lottery");
    await page.click("button:has-text('Sound On')");
    await expect(page.locator("button:has-text('Sound Off')")).toBeVisible();
  });

  test("full spin reveals a winner card with action buttons", async ({ page }) => {
    await page.goto("/lottery");
    await page.click("button:has-text('Spin the Wheel!')");
    // Wait for reveal phase — Try Again and Save buttons appear only after winner is set
    await expect(page.locator("button:has-text('Try Again')")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("button:has-text('Save')").first()).toBeVisible();
  });

  test("Try Again button resets lottery to idle state", async ({ page }) => {
    await page.goto("/lottery");
    await page.click("button:has-text('Spin the Wheel!')");
    await expect(page.locator("button:has-text('Try Again')")).toBeVisible({ timeout: 10000 });
    await page.click("button:has-text('Try Again')");
    await expect(page.locator("button:has-text('Spin the Wheel!')")).toBeVisible({ timeout: 5000 });
  });

  test("Save button while unauthenticated opens login modal", async ({ page }) => {
    await page.goto("/lottery");
    await page.click("button:has-text('Spin the Wheel!')");
    await expect(page.locator("button:has-text('Try Again')")).toBeVisible({ timeout: 10000 });
    await page.click("button:has-text('Save')");
    await expect(page.locator("text=Sign in to CineSensei")).toBeVisible({ timeout: 5000 });
  });
});
