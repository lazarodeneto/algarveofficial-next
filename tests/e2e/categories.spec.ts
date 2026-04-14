import { test, expect } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

const canonicalRoutes = [
  "/visit/lagos/restaurants",
  "/visit/albufeira/beach-clubs",
  "/visit/vilamoura/golf",
  "/visit/faro/architecture-design",
  "/visit/tavira/real-estate",
  "/visit/portimao/experiences",
  "/visit/loule/events",
  "/visit/carvoeiro/wellness-spas",
  "/visit/olhao/beaches",
  "/visit/quarteira/shopping",
];

const legacyRedirects: Array<[string, string]> = [
  ["/visit/lagos/vip-transportation", "/visit/lagos/transportation"],
  ["/visit/lagos/premier-events", "/visit/lagos/events"],
  ["/visit/lagos/luxury-accommodation", "/visit/lagos/accommodation"],
  ["/visit/lagos/luxury-experiences", "/visit/lagos/experiences"],
  ["/visit/lagos/architecture-decoration", "/visit/lagos/architecture-design"],
  ["/visit/lagos/beaches-clubs", "/visit/lagos/beach-clubs"],
  ["/visit/lagos/vip-concierge", "/visit/lagos/concierge-services"],
  ["/visit/lagos/family-fun", "/visit/lagos/family-attractions"],
  ["/visit/lagos/protection-services", "/visit/lagos/security-services"],
  ["/visit/lagos/shopping-boutiques", "/visit/lagos/shopping"],
  ["/visit/lagos/private-chefs", "/visit/lagos/restaurants"],
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
  test("english canonical does not include /en prefix", async ({ page }) => {
    await page.goto(`${baseURL}/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href!).not.toContain("/en/");
  });

  test("title and meta description exist", async ({ page }) => {
    await page.goto(`${baseURL}/visit/lagos/restaurants`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("title")).not.toHaveText("");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
  });
});
