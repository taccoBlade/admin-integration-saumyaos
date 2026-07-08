import { test, expect } from "@playwright/test";

test.describe("Homepage End-to-End Tests", () => {
  test("should load successfully and show correct title", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Verify title contains Saumya
    const title = await page.title();
    expect(title.toLowerCase()).toContain("saumya");
  });

  test("should display navigation header and career timeline", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Verify header navigation links exist
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Verify career timeline is visible
    const timeline = page.locator("#timeline");
    await expect(timeline).toBeVisible();

    // Verify there is at least one timeline milestone item
    const milestone = page.locator("#timeline h4").first();
    await expect(milestone).toBeVisible();
  });

  test("should navigate to a project detail page and load it successfully", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Find the first project link
    const firstProjectLink = page.locator("a[href^='/projects/']").first();
    await expect(firstProjectLink).toBeVisible();

    // Get the href attribute
    const href = await firstProjectLink.getAttribute("href");
    console.log(`Navigating to project link: ${href}`);

    // Click and await navigation
    await Promise.all([
      page.waitForURL(`**${href}`),
      firstProjectLink.click(),
    ]);

    // Verify that "Project Not Found" is not visible
    const notFoundHeading = page.locator("h1:has-text('Project Not Found')");
    await expect(notFoundHeading).not.toBeVisible();

    // Verify that the back link is visible
    const backLink = page.locator("a:has-text('System Terminal'), a:has-text('Back')").first();
    await expect(backLink).toBeVisible();
  });
});
