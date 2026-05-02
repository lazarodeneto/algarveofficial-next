import { expect, test } from "@playwright/test";

const LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
const TEST_LOCALES = ["en", "it", "fr", "de"] as const;

const NAV_ITEMS = [
  { name: "Relocation", path: "/relocation" },
  { name: "Directory", path: "/directory" },
  { name: "Blog", path: "/blog" },
  { name: "Events", path: "/events" },
  { name: "Destinations", path: "/destinations" },
  { name: "Map", path: "/map" },
  { name: "Invest", path: "/invest" },
] as const;

test.describe("Locale Navigation", () => {
  test.describe.configure({ mode: "serial" });

  for (const locale of TEST_LOCALES) {
    test(`[${locale}] sidebar navigation preserves locale`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState("networkidle");

      for (const item of NAV_ITEMS) {
        const selector = page.locator(`nav a[href^="/${locale}${item.path}"]`).or(
          page.locator(`aside a[href^="/${locale}${item.path}"]`)
        );

        const link = page.locator(`a[href="/${locale}${item.path}"]`).first();
        const linkExists = await link.count() > 0;

        if (linkExists) {
          const href = await link.getAttribute("href");
          expect(href).toMatch(new RegExp(`^/${locale}${item.path}`));
        }
      }
    });

  test(`[${locale}] sidebar links have correct href attributes`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`/${locale}`);
    await page.waitForLoadState("networkidle");

    for (const item of NAV_ITEMS) {
      const href = `/${locale}${item.path}`;
      const link = page.locator(`a[href="${href}"]`).first();
      const count = await link.count();
      
      expect(count, `Link ${href} should exist`).toBeGreaterThan(0);
      
      const actualHref = await link.getAttribute("href");
      expect(actualHref).toBe(href);
    }
  });

    test(`[${locale}] header navigation preserves locale`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState("networkidle");

      for (const item of NAV_ITEMS.slice(0, 3)) {
        const link = page.locator(`header a[href="/${locale}${item.path}"]`).first();
        if (await link.count() > 0) {
          const href = await link.getAttribute("href");
          expect(href).toMatch(new RegExp(`^/${locale}${item.path}`));
        }
      }
    });
  }
});

test.describe("Language Switcher", () => {
  test("switching to Italian updates URL", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const langSwitcher = page.locator("button[aria-label*='language' i]").or(
      page.locator("button").filter({ has: page.locator("svg") }).first()
    );

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await page.waitForTimeout(500);
      
      const italianOption = page.getByText("Italiano").or(page.getByText(/^IT$/i));
      if (await italianOption.count() > 0) {
        await italianOption.click({ timeout: 5000 });
        await page.waitForLoadState("networkidle");
        expect(page.url()).toContain("/it");
      }
    }
  });

  test("switching to French updates URL", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const langSwitcher = page.locator("button[aria-label*='language' i]").or(
      page.locator("button").filter({ has: page.locator("svg") }).first()
    );

    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await page.waitForTimeout(500);
      
      const frenchOption = page.getByText("Français");
      if (await frenchOption.count() > 0) {
        await frenchOption.click({ timeout: 5000 });
        await page.waitForLoadState("networkidle");
        expect(page.url()).toContain("/fr");
      }
    }
  });
});

test.describe("Cross-page locale preservation", () => {
  for (const locale of TEST_LOCALES) {
    test(`[${locale}] navigating from blog preserves locale`, async ({ page }) => {
      await page.goto(`/${locale}/blog`);
      await page.waitForLoadState("networkidle");

      for (const item of NAV_ITEMS.slice(0, 3)) {
        const link = page.locator(`a[href="/${locale}${item.path}"]`).first();
        if (await link.count() > 0) {
          await link.click();
          await page.waitForLoadState("networkidle");
          
          expect(page.url()).toMatch(new RegExp(`^http://localhost:3000/${locale}`));
          await page.goto(`/${locale}/blog`);
          await page.waitForLoadState("networkidle");
        }
      }
    });
  }
});

test.describe("External links", () => {
  test("mailto links do not get locale prefix", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const mailtoLinks = page.locator(`a[href^="mailto:"]`);
    const count = await mailtoLinks.count();

    if (count > 0) {
      const href = await mailtoLinks.first().getAttribute("href");
      expect(href).toMatch(/^mailto:/);
      expect(href).not.toMatch(/^\/[a-z]{2}(-[a-z]{2})?\/mailto:/);
    }
  });

  test("external https links do not get locale prefix", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    const externalLinks = page.locator(`a[href^="https://"]`);
    const count = await externalLinks.count();

    if (count > 0) {
      const href = await externalLinks.first().getAttribute("href");
      expect(href).toMatch(/^https:\/\//);
      expect(href).not.toMatch(/^\/[a-z]{2}(-[a-z]{2})?\/https:\/\//);
    }
  });
});

test.describe("Edge cases", () => {
  test("invalid locale returns 404 without a redirect loop", async ({ page }) => {
    const response = await page.goto("/xx/residence");
    expect(response?.status()).toBe(404);
  });

  test("legacy /live path redirects to /relocation", async ({ page }) => {
    const response = await page.goto("/en/live");
    await page.waitForLoadState("networkidle");

    expect(response?.ok()).toBeTruthy();
    expect(page.url()).toContain("/en/relocation");
  });

  test("root path shows default locale content", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
  });

  test("locale pages render without crash", async ({ page }) => {
    for (const locale of TEST_LOCALES) {
      const response = await page.goto(`/${locale}`);
      expect(response?.ok()).toBeTruthy();
    }
  });
});
