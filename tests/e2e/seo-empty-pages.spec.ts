import { test, expect } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3000";

const emptyPages = [
  "/visit/lagos/real-estate",
  "/visit/aljezur/shopping",
  "/visit/monchique/beach-clubs",
];

const populatedPages = [
  "/visit/lagos/restaurants",
  "/visit/albufeira/beach-clubs",
  "/visit/vilamoura/golf",
];

test.describe("SEO - Empty Pages (noindex validation)", () => {
  for (const route of emptyPages) {
    test(`empty page should be noindex → ${route}`, async ({ page }) => {
      const response = await page.goto(`${baseURL}${route}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);

      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveCount(1);

      const content = await robots.getAttribute("content");

      expect(content).toBeTruthy();
      expect(content!.toLowerCase()).toContain("noindex");
      expect(content!.toLowerCase()).toContain("follow");

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);

      const href = await canonical.getAttribute("href");

      expect(href).toBeTruthy();
      expect(href!).toContain(route);

      expect(content!.toLowerCase()).not.toContain("index, follow");
    });
  }
});

test.describe("SEO - Populated Pages (index validation)", () => {
  for (const route of populatedPages) {
    test(`populated page should be index → ${route}`, async ({ page }) => {
      const response = await page.goto(`${baseURL}${route}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);

      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveCount(1);

      const content = await robots.getAttribute("content");

      expect(content).toBeTruthy();
      expect(content!.toLowerCase()).toContain("index");
      expect(content!.toLowerCase()).toContain("follow");

      expect(content!.toLowerCase()).not.toContain("noindex");

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);

      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href!).toContain(route);
    });
  }
});

test.describe("SEO - Edge Cases", () => {
  test("page should not have multiple robots tags", async ({ page }) => {
    await page.goto(`${baseURL}/visit/lagos/restaurants`, {
      waitUntil: "domcontentloaded",
    });

    const robotsTags = page.locator('meta[name="robots"]');
    await expect(robotsTags).toHaveCount(1);
  });

  test("canonical must not point to wrong category", async ({ page }) => {
    const route = "/visit/lagos/restaurants";

    await page.goto(`${baseURL}${route}`, {
      waitUntil: "domcontentloaded",
    });

    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute("href");

    expect(href).toBeTruthy();
    expect(href).toContain(route);
    expect(href).not.toContain("vip-transportation");
    expect(href).not.toContain("luxury");
  });
});
