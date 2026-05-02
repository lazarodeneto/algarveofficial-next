import { test, expect } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

const canonicalRoutes = [
  "/en/visit/lagos/restaurants",
  "/en/visit/albufeira/beach-clubs",
  "/en/visit/vilamoura/golf",
  "/en/visit/faro/architecture-design",
  "/en/visit/tavira/real-estate",
  "/en/visit/portimao/experiences",
  "/en/visit/loule/events",
  "/en/visit/carvoeiro/wellness-spas",
  "/en/visit/olhao/beaches",
  "/en/visit/quarteira/shopping",
];

const legacyRedirects: Array<[string, string]> = [
  ["/en/visit/lagos/vip-transportation", "/en/visit/lagos/transportation"],
  ["/en/visit/lagos/premier-events", "/en/visit/lagos/events"],
  ["/en/visit/lagos/premium-accommodation", "/en/visit/lagos/accommodation"],
  ["/en/visit/lagos/premium-experiences", "/en/visit/lagos/experiences"],
  ["/en/visit/lagos/architecture-decoration", "/en/visit/lagos/architecture-design"],
  ["/en/visit/lagos/beaches-clubs", "/en/visit/lagos/beach-clubs"],
  ["/en/visit/lagos/vip-concierge", "/en/visit/lagos/concierge-services"],
  ["/en/visit/lagos/family-fun", "/en/visit/lagos/family-attractions"],
  ["/en/visit/lagos/protection-services", "/en/visit/lagos/security-services"],
  ["/en/visit/lagos/shopping-boutiques", "/en/visit/lagos/shopping"],
  ["/en/visit/lagos/private-chefs", "/en/visit/lagos/restaurants"],
];

test.describe("Canonical category routes", () => {
  for (const route of canonicalRoutes) {
    test(`loads ${route}`, async ({ page }) => {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);

      await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);

      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href!).toContain(route);

      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Legacy redirects", () => {
  for (const [oldRoute, newRoute] of legacyRedirects) {
    test(`${oldRoute} redirects to ${newRoute}`, async ({ page }) => {
      const response = await page.goto(`${baseURL}${oldRoute}`, { waitUntil: "domcontentloaded" });
      expect(response).not.toBeNull();
      await expect(page).toHaveURL(new RegExp(newRoute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    });
  }
});

test.describe("Locale persistence", () => {
  test("pt-pt route stays in locale", async ({ page }) => {
    await page.goto(`${baseURL}/pt-pt/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/pt-pt\/visit\/lagos\/restaurants/);

    const links = page.locator('a[href^="/pt-pt/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("fr route stays in locale", async ({ page }) => {
    await page.goto(`${baseURL}/fr/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/fr\/visit\/lagos\/restaurants/);

    const links = page.locator('a[href^="/fr/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("SEO metadata", () => {
  test("english canonical includes /en prefix", async ({ page }) => {
    await page.goto(`${baseURL}/en/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href!).toContain("/en/visit/lagos/restaurants");
  });

  test("title and meta description exist", async ({ page }) => {
    await page.goto(`${baseURL}/en/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("title")).not.toHaveText("");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
  });
});
