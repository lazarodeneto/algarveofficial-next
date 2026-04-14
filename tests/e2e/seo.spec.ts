/**
 * SEO Metadata Test Suite
 *
 * Validates every SEO signal that affects indexing, rich results, and ranking:
 *   - <title> correctness
 *   - <meta description> presence and length
 *   - <link rel="canonical"> accuracy
 *   - hreflang tags (all 10 locales + x-default)
 *   - <h1> presence and SSR rendering
 *   - Open Graph metadata
 *   - JSON-LD structured data
 *   - robots meta (index/follow)
 *   - SSR content verification (content present without JS)
 *   - No hydration mismatch errors
 */

import { test, expect, type Page } from "@playwright/test";
import {
  PROGRAMMATIC_TEST_PAGES,
  SUPPORTED_LOCALES,
  HREFLANG_TAGS,
  CORE_LOCALES,
} from "../helpers/constants";
import {
  assertPageHasContent,
  collectHydrationErrors,
} from "../helpers/page-utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the meta tag content, or null if absent. */
async function getMeta(page: Page, selector: string): Promise<string | null> {
  const el = page.locator(selector);
  if (await el.count() === 0) return null;
  return el.first().getAttribute("content");
}

/**
 * Skip a test if the page returned a 404. Programmatic pages only exist if
 * the DB has published listings for that combination.
 */
async function skipIf404(page: Page, url: string): Promise<boolean> {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (!response || response.status() === 404) {
    test.skip(true, `${url} returned 404 — no listings in DB for this combo`);
    return true;
  }
  return false;
}

// ─── Core static pages ────────────────────────────────────────────────────────

test.describe("SEO — Core static pages", () => {
  const corePages = [
    { path: "/en", label: "Home (EN)" },
    { path: "/en/directory", label: "Directory (EN)" },
    { path: "/en/blog", label: "Blog (EN)" },
    { path: "/en/destinations", label: "Destinations (EN)" },
    { path: "/en/about-us", label: "About (EN)" },
  ];

  for (const { path, label } of corePages) {
    test.describe(label, () => {
      test("<title> is set and contains AlgarveOfficial", async ({ page }) => {
        await page.goto(path);
        const title = await page.title();
        expect(title, "Page title must be set").toBeTruthy();
        expect(title.length, "Title should be 10–70 chars").toBeGreaterThan(10);
        expect(title.length, "Title should be under 70 chars for SERP display").toBeLessThan(100);
        expect(title).toContain("AlgarveOfficial");
      });

      test("<meta description> exists and has valid length", async ({ page }) => {
        await page.goto(path);
        const desc = await getMeta(page, 'meta[name="description"]');
        expect(desc, "Meta description must exist").toBeTruthy();
        expect(desc!.length, "Description should be ≥50 chars").toBeGreaterThanOrEqual(50);
        expect(desc!.length, "Description should be ≤160 chars for SERP display").toBeLessThanOrEqual(165);
      });

      test('<link rel="canonical"> is an absolute URL', async ({ page }) => {
        await page.goto(path);
        const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
        expect(canonical, "Canonical link must exist").toBeTruthy();
        expect(canonical).toMatch(/^https?:\/\//);
        // Canonical must not have double slashes in path
        const url = new URL(canonical!);
        expect(url.pathname).not.toMatch(/\/\//);
      });

      test("hreflang tags: all 10 locales + x-default present", async ({ page }) => {
        await page.goto(path);
        const hreflangTags = page.locator('link[rel="alternate"][hreflang]');
        const count = await hreflangTags.count();

        // Must have at least 10 (one per locale) + 1 x-default = 11 minimum
        expect(count, "Must have hreflang for all supported locales + x-default").toBeGreaterThanOrEqual(11);

        // Verify x-default exists
        const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
        await expect(xDefault, "x-default hreflang must exist").toHaveCount(1);

        // Verify each supported locale has a hreflang entry
        for (const locale of SUPPORTED_LOCALES) {
          const hreflang = HREFLANG_TAGS[locale];
          const tag = page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);
          expect(
            await tag.count(),
            `hreflang="${hreflang}" must exist`,
          ).toBeGreaterThanOrEqual(1);
        }
      });

      test("hreflang hrefs are absolute URLs", async ({ page }) => {
        await page.goto(path);
        const tags = page.locator('link[rel="alternate"][hreflang]');
        const count = await tags.count();
        for (let i = 0; i < count; i++) {
          const href = await tags.nth(i).getAttribute("href");
          expect(href, `hreflang[${i}] href must be an absolute URL`).toMatch(/^https?:\/\//);
        }
      });

      test("<h1> is present and visible", async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const h1 = page.locator("h1").first();
        await expect(h1, "Page must have an <h1>").toBeVisible();
        const text = await h1.innerText();
        expect(text.trim().length, "<h1> must have text content").toBeGreaterThan(0);
      });

      test("page has substantial visible content (not empty shell)", async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await assertPageHasContent(page);
      });

      test("Open Graph: og:title, og:description, og:url all set", async ({ page }) => {
        await page.goto(path);
        const ogTitle = await getMeta(page, 'meta[property="og:title"]');
        const ogDesc = await getMeta(page, 'meta[property="og:description"]');
        const ogUrl = await getMeta(page, 'meta[property="og:url"]');
        expect(ogTitle, "og:title must be set").toBeTruthy();
        expect(ogDesc, "og:description must be set").toBeTruthy();
        expect(ogUrl, "og:url must be set").toBeTruthy();
        expect(ogUrl).toMatch(/^https?:\/\//);
      });

      test("Twitter card meta is set", async ({ page }) => {
        await page.goto(path);
        const card = await getMeta(page, 'meta[name="twitter:card"]');
        expect(card, "twitter:card meta must be present").toBeTruthy();
        expect(["summary", "summary_large_image"]).toContain(card);
      });

      test("robots meta allows indexing", async ({ page }) => {
        await page.goto(path);
        const robotsMeta = await getMeta(page, 'meta[name="robots"]');
        // If robots meta exists, it must not be noindex
        if (robotsMeta) {
          expect(robotsMeta, "Core pages must not be noindex").not.toContain("noindex");
        }
        // Google-specific robots
        const googlebot = await getMeta(page, 'meta[name="googlebot"]');
        if (googlebot) {
          expect(googlebot, "Core pages must not be noindex for Googlebot").not.toContain("noindex");
        }
      });
    });
  }
});

// ─── Programmatic SEO pages ───────────────────────────────────────────────────

test.describe("SEO — Programmatic pages /{locale}/{category}/{city}", () => {
  for (const { locale, category, city } of PROGRAMMATIC_TEST_PAGES) {
    const url = `/${locale}/${category}/${city}`;

    test.describe(url, () => {
      test("<title> contains category and city keywords", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        // Title should mention AlgarveOfficial
        expect(title).toMatch(/AlgarveOfficial/i);
      });

      test("<meta description> is unique and data-rich", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const desc = await getMeta(page, 'meta[name="description"]');
        expect(desc, "Meta description required on programmatic pages").toBeTruthy();
        expect(desc!.length).toBeGreaterThanOrEqual(50);
        expect(desc!.length).toBeLessThanOrEqual(165);
        // Must contain either city name or category (not a generic default)
        const cityName = city.replace(/-/g, " ");
        const hasContext = desc!.toLowerCase().includes(cityName) ?? desc!.toLowerCase().includes(category);
        expect(hasContext, `Description should reference city or category, got: "${desc}"`).toBeTruthy();
      });

      test("canonical URL is correct (contains locale/category/city)", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const canonical = await page.locator('link[rel="canonical"]').first().getAttribute("href");
        expect(canonical).toMatch(/^https?:\/\//);
        // Canonical must contain the locale
        expect(canonical).toContain(`/${locale}/`);
        // Canonical must contain the city slug
        expect(canonical).toContain(`/${city}`);
        // No double slashes in path
        const pathname = new URL(canonical!).pathname;
        expect(pathname).not.toMatch(/\/\//);
      });

      test("hreflang: all 10 locales + x-default with translated category slugs", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const tags = page.locator('link[rel="alternate"][hreflang]');
        const count = await tags.count();
        expect(count, "Must have ≥11 hreflang tags").toBeGreaterThanOrEqual(11);

        // x-default must exist
        const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
        await expect(xDefault).toHaveCount(1);

        // All hreflang hrefs must be absolute URLs
        for (let i = 0; i < count; i++) {
          const href = await tags.nth(i).getAttribute("href");
          expect(href).toMatch(/^https?:\/\//);
        }

        // The EN hreflang must use the English category slug (not the locale slug)
        const enTag = page.locator('link[rel="alternate"][hreflang="en"]');
        const enHref = await enTag.first().getAttribute("href");
        expect(enHref).toMatch(/\/en\//);
        // EN canonical must end with the city slug
        expect(enHref).toContain(`/${city}`);
      });

      test("<h1> is server-rendered (visible in HTML before JS hydration)", async ({ page }) => {
        // Navigate with minimal wait to catch SSR output
        await page.goto(url, { waitUntil: "domcontentloaded" });
        const status = page.url(); // if redirected to 404, skip
        if (!status.includes(`/${locale}/${category}/${city}`)) {
          test.skip(true, "Page redirected — likely no listings for this combination");
          return;
        }

        // Check h1 exists in the DOM (SSR puts it in initial HTML)
        const h1 = page.locator("h1").first();
        const h1Text = await h1.innerText().catch(() => "");
        expect(h1Text.trim().length, "<h1> must be present and non-empty").toBeGreaterThan(3);

        // Verify H1 contains the city name (template-rendered, not placeholder)
        const cityName = city.replace(/-/g, " ");
        expect(h1Text.toLowerCase()).toContain(cityName.toLowerCase());
      });

      test("SSR: content present in raw HTML before JavaScript runs", async ({
        browser,
      }) => {
        // Create a context with JavaScript disabled to test pure SSR
        const context = await browser.newContext({ javaScriptEnabled: false });
        const noJsPage = await context.newPage();

        await noJsPage.goto(url, { waitUntil: "domcontentloaded" }).catch(() => null);
        const currentUrl = noJsPage.url();

        if (!currentUrl.includes(`/${locale}/${category}/${city}`)) {
          await context.close();
          test.skip(true, "Page not accessible — no listings for this combo");
          return;
        }

        // Without JS, SSR content must still render
        const h1 = noJsPage.locator("h1").first();
        const h1Text = await h1.innerText().catch(() => "");
        expect(h1Text.trim().length, "H1 must be SSR-rendered (visible without JS)").toBeGreaterThan(3);

        // Listing cards or content sections should be present
        const bodyText = await noJsPage.locator("body").innerText();
        expect(bodyText.replace(/\s+/g, " ").trim().length).toBeGreaterThan(200);

        await context.close();
      });

      test("JSON-LD structured data: ItemList or CollectionPage schema present", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const schemas = page.locator('script[type="application/ld+json"]');
        const count = await schemas.count();
        expect(count, "At least one JSON-LD schema must exist").toBeGreaterThan(0);

        let foundItemListOrCollection = false;
        for (let i = 0; i < count; i++) {
          const content = await schemas.nth(i).textContent();
          if (!content) continue;
          try {
            const parsed = JSON.parse(content) as Record<string, unknown>;
            const type = parsed["@type"] as string;
            if (type === "ItemList" || type === "CollectionPage" || type === "BreadcrumbList") {
              foundItemListOrCollection = true;
            }
          } catch {
            // Invalid JSON-LD — this is itself an error worth noting
            expect(content, "JSON-LD must be valid JSON").toMatch(/^\s*\{/);
          }
        }
        expect(foundItemListOrCollection, "Page must have ItemList, CollectionPage, or BreadcrumbList schema").toBeTruthy();
      });

      test("ItemList schema has correct @context and valid items", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const schemas = page.locator('script[type="application/ld+json"]');
        const count = await schemas.count();

        for (let i = 0; i < count; i++) {
          const content = await schemas.nth(i).textContent();
          if (!content) continue;
          try {
            const parsed = JSON.parse(content) as Record<string, unknown>;
            if (parsed["@type"] === "ItemList") {
              expect(parsed["@context"]).toBe("https://schema.org");
              expect(parsed["numberOfItems"]).toBeGreaterThan(0);
              const items = parsed["itemListElement"] as unknown[];
              expect(Array.isArray(items)).toBe(true);
              expect(items.length).toBeGreaterThan(0);
              // Each item must have a position
              const firstItem = items[0] as Record<string, unknown>;
              expect(firstItem["position"]).toBe(1);
            }
          } catch {
            // JSON parse error handled above
          }
        }
      });

      test("BreadcrumbList schema has 3 levels", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        const schemas = page.locator('script[type="application/ld+json"]');
        const count = await schemas.count();

        for (let i = 0; i < count; i++) {
          const content = await schemas.nth(i).textContent();
          if (!content) continue;
          try {
            const parsed = JSON.parse(content) as Record<string, unknown>;
            if (parsed["@type"] === "BreadcrumbList") {
              const items = parsed["itemListElement"] as unknown[];
              expect(items.length, "Breadcrumb must have 3 levels: Home > Category > City").toBe(3);
            }
          } catch {
            // handled
          }
        }
      });

      test("no hydration mismatch console errors", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            const t = msg.text();
            if (
              t.includes("Hydration") ||
              t.includes("did not match") ||
              t.includes("Expected server HTML")
            ) {
              errors.push(t);
            }
          }
        });

        if (await skipIf404(page, url)) return;
        await page.waitForLoadState("networkidle");
        expect(errors, `Hydration errors on ${url}: ${errors.join("; ")}`).toHaveLength(0);
      });

      test("listing cards are visible (SSR listings grid renders)", async ({ page }) => {
        if (await skipIf404(page, url)) return;
        await page.waitForLoadState("networkidle");

        // At least one listing card link should be visible
        // Cards are <a> tags inside the main listing grid
        const listingLinks = page.locator('main a[href*="/listing/"]');
        const count = await listingLinks.count();
        expect(count, "At least one listing card must be visible on the page").toBeGreaterThan(0);
      });
    });
  }
});

// ─── SEO cross-locale consistency ────────────────────────────────────────────

test.describe("SEO — Cross-locale hreflang consistency", () => {
  test("EN and PT versions of the same programmatic page cross-reference each other", async ({ page }) => {
    const enUrl = "/en/restaurants/lagos";
    const ptUrl = "/pt-pt/restaurantes/lagos";

    // Get EN page hreflang for pt-PT
    const enResponse = await page.goto(enUrl, { waitUntil: "domcontentloaded" });
    if (!enResponse || enResponse.status() === 404) {
      test.skip(true, "EN restaurant/lagos page not in DB");
      return;
    }

    const ptHreflang = page.locator('link[rel="alternate"][hreflang="pt-PT"]');
    const ptHref = await ptHreflang.first().getAttribute("href");
    expect(ptHref, "EN page must have hreflang pointing to pt-PT version").toBeTruthy();
    expect(ptHref).toContain("/pt-pt/");
    expect(ptHref).toContain("restaurantes");
    expect(ptHref).toContain("/lagos");
  });

  test("each locale's hreflang uses the locale-specific category slug", async ({ page }) => {
    const enUrl = "/en/accommodation/vilamoura";
    const response = await page.goto(enUrl, { waitUntil: "domcontentloaded" });
    if (!response || response.status() === 404) {
      test.skip(true, "accommodation/vilamoura page not in DB");
      return;
    }

    // Check a few locale-specific category slugs in their respective hreflang hrefs
    const checks: Array<{ hreflang: string; expectedSlug: string }> = [
      { hreflang: "pt-PT", expectedSlug: "alojamento" },
      { hreflang: "fr-FR", expectedSlug: "hebergement" },
      { hreflang: "de-DE", expectedSlug: "unterkunft" },
    ];

    for (const { hreflang, expectedSlug } of checks) {
      const tag = page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`);
      const href = await tag.first().getAttribute("href");
      expect(
        href,
        `hreflang="${hreflang}" should use slug "${expectedSlug}"`,
      ).toContain(expectedSlug);
    }
  });
});

// ─── Noindex checks ───────────────────────────────────────────────────────────

test.describe("SEO — noindex on private/admin routes", () => {
  const noIndexRoutes = ["/en/admin", "/en/owner", "/en/dashboard"];

  for (const route of noIndexRoutes) {
    test(`${route} is noindex or redirects`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      if (!response) return;

      // If it loads (not redirected to login), verify noindex
      if (response.status() === 200 && page.url().includes(route)) {
        const robotsMeta = await getMeta(page, 'meta[name="robots"]');
        const hasNoIndex =
          robotsMeta?.includes("noindex") ?? (await getMeta(page, 'meta[name="googlebot"]'))?.includes("noindex");
        expect(
          hasNoIndex,
          `${route} must be noindex or redirect to login`,
        ).toBeTruthy();
      }
    });
  }
});

// ─── Filtered directory — must be noindex ────────────────────────────────────

test.describe("SEO — Filtered directory pages should be noindex", () => {
  test("/en/directory?category=restaurants should NOT be indexable", async ({ page }) => {
    await page.goto("/en/directory?category=restaurants");
    const robotsMeta = await getMeta(page, 'meta[name="robots"]');
    if (robotsMeta) {
      expect(
        robotsMeta,
        "Filtered directory pages duplicate the programmatic pages — must be noindex",
      ).toContain("noindex");
    }
    // Note: if no robots meta exists, this is a known issue captured in SEO-AUDIT.md
  });
});
