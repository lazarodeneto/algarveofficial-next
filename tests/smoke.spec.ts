import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("city page loads", async ({ page }) => {
  await page.goto("/en/visit/lagos");
  await expect(page.locator("body")).toBeVisible();
});

test("category page loads", async ({ page }) => {
  await page.goto("/en/stay");
  await expect(page.locator("body")).toBeVisible();
});

test("listing page loads", async ({ page }) => {
  await page.goto("/en/listing/1");
  await expect(page.locator("body")).toBeVisible();
});

test("blog page loads", async ({ page }) => {
  await page.goto("/en/blog");
  await expect(page.locator("body")).toBeVisible();
});