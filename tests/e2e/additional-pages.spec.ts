import { expect, test } from "@playwright/test";

test.describe("Blog page", () => {
  test("loads successfully", async ({ page }) => {
    const response = await page.goto("/en/blog");
    expect(response?.ok()).toBeTruthy();
  });

  test("displays blog heading", async ({ page }) => {
    const response = await page.goto("/en/blog");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Events page", () => {
  test("loads successfully", async ({ page }) => {
    const response = await page.goto("/en/events");
    expect(response?.ok()).toBeTruthy();
  });

  test("displays events heading", async ({ page }) => {
    const response = await page.goto("/en/events");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Directory page", () => {
  test("loads successfully", async ({ page }) => {
    const response = await page.goto("/en/directory");
    expect(response?.ok()).toBeTruthy();
  });

  test("displays directory content", async ({ page }) => {
    const response = await page.goto("/en/directory");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("main")).toBeVisible();
  });
});

test.describe("Login page", () => {
  test("loads successfully", async ({ page }) => {
    const response = await page.goto("/en/login");
    expect(response?.ok()).toBeTruthy();
  });

  test("displays login form", async ({ page }) => {
    const response = await page.goto("/en/login");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header navigation is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("homepage has meta description", async ({ page }) => {
    const response = await page.goto("/en");
    expect(response?.ok()).toBeTruthy();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(0);
  });

  test("pages have canonical URLs", async ({ page }) => {
    const response = await page.goto("/en/blog");
    expect(response?.ok()).toBeTruthy();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
  });
});
