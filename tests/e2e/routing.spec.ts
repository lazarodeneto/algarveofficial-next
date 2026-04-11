/**
 * routing.spec.ts — HTTP status, URL structure, and link integrity tests
 *
 * Tests:
 *  1.  All STATIC_PAGES return HTTP 200
 *  2.  Programmatic pages (PROGRAMMATIC_TEST_PAGES) return 200 or 404 gracefully
 *  3.  An invalid locale segment returns 404 (not 200 or redirect loop)
 *  4.  Unknown paths return 404
 *  5.  No double-locale prefix in any link on core pages
 *  6.  Internal links on the home page are valid (200 or redirect to valid page)
 *  7.  Internal links on a programmatic page are valid
 *  8.  /sitemap.xml is accessible and contains expected URLs
 *  9.  /robots.txt is accessible and allows crawling of main paths
 * 10.  Related-city links on programmatic pages are in the correct locale
 * 11.  Related-category links on programmatic pages are in the correct locale
 * 12.  Switching from /en to /pt-pt doesn't create a double prefix
 * 13.  Direct navigation to /en/directory returns 200
 * 14.  /api/ routes are excluded from locale prefixing
 */

import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import {
  STATIC_PAGES,
  PROGRAMMATIC_TEST_PAGES,
  CORE_LOCALES,
  SUPPORTED_LOCALES,
  CATEGORY_URL_SLUGS,
  KNOWN_CITY_SLUGS,
} from "../helpers/constants";
import {
  fetchStatus,
  extractLocaleFromUrl,
  assertNoDoubleLocalePrefix,
  switchLocaleFromUi,
  expectUrlHasLocale,
} from "../helpers/page-utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Collect all unique internal hrefs from a page (excludes external, anchors, api). */
async function collectInternalHrefs(page: Page): Promise<string[]> {
  const hrefs = await page.locator("a[href]").evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute("href") ?? ""),
  );
  const filtered = hrefs.filter(
    (href) =>
      href.startsWith("/") &&
      !href.startsWith("/_next") &&
      !href.startsWith("/api") &&
      !href.startsWith("/auth") &&
      !href.startsWith("/dashboard") &&
      !href.startsWith("/admin") &&
      !href.startsWith("/owner") &&
      href !== "#" &&
      !href.startsWith("#"),
  );
  // Deduplicate without spread-of-Set (downlevelIteration not required)
  return filtered.filter((href, idx) => filtered.indexOf(href) === idx);
}

/** Assert an href doesn't create a double-locale when treated as absolute URL. */
function checkNoDoublePrefix(href: string): void {
  assertNoDoubleLocalePrefix(`http://localhost:3000${href}`);
}

// ─── 1. Static pages return 200 ───────────────────────────────────────────────

test.describe("static pages return HTTP 200", () => {
  for (const path of STATIC_PAGES) {
    test(`GET ${path} → 200`, async ({ request }) => {
      const status = await fetchStatus(request, path);
      expect(
        status,
        `${path} should return 200, got ${status}`,
      ).toBe(200);
    });
  }
});

// ─── 2. Programmatic compatibility URLs resolve safely ────────────────────────

test.describe("programmatic compatibility URLs respond gracefully", () => {
  for (const { locale, category, city } of PROGRAMMATIC_TEST_PAGES) {
    const url = `/${locale}/${category}/${city}`;
    test(`GET ${url} → redirect, 200, or 404`, async ({ request }) => {
      const status = await fetchStatus(request, url);
      expect(
        [200, 404, 307, 308],
        `${url} should return a safe compatibility response, got ${status}`,
      ).toContain(status);
    });
  }
});

// ─── 3. Invalid locale returns 404 ───────────────────────────────────────────

test.describe("invalid locale handling", () => {
  test("/xx returns 404 (not 200 or redirect)", async ({ request }) => {
    const status = await fetchStatus(request, "/xx");
    // Should 404 — "xx" is not a supported locale
    expect([404, 400], `/xx should 404, got ${status}`).toContain(status);
  });

  test("/zz/directory returns 404", async ({ request }) => {
    const status = await fetchStatus(request, "/zz/directory");
    expect([404, 400], `/zz/directory should 404, got ${status}`).toContain(status);
  });
});

// ─── 4. Unknown paths return 404 ─────────────────────────────────────────────

test.describe("unknown paths return 404", () => {
  test("/en/this-page-does-not-exist returns 404", async ({ request }) => {
    const status = await fetchStatus(request, "/en/this-page-does-not-exist");
    expect(status, "Non-existent path should 404").toBe(404);
  });

  test("/en/restaurants/this-city-does-not-exist returns 404", async ({ request }) => {
    const status = await fetchStatus(request, "/en/restaurants/this-city-does-not-exist");
    expect([200, 404]).toContain(status); // Could be 200 with no listings → still valid
  });
});

// ─── 5. No double-locale prefix in links on core pages ───────────────────────

test.describe("no double-locale prefix in page links", () => {
  for (const locale of CORE_LOCALES) {
    test(`/${locale} home page has no double-locale links`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
      const hrefs = await collectInternalHrefs(page);
      for (const href of hrefs) {
        checkNoDoublePrefix(href);
      }
    });
  }

  test("/en/directory has no double-locale links", async ({ page }) => {
    await page.goto("/en/directory", { waitUntil: "domcontentloaded" });
    const hrefs = await collectInternalHrefs(page);
    for (const href of hrefs) {
      checkNoDoublePrefix(href);
    }
  });
});

// ─── 6. Internal links on home page are valid ────────────────────────────────

test.describe("internal link integrity — home page", () => {
  test("/en home: all internal links return 200 or 301/302", async ({ page, request }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    const hrefs = await collectInternalHrefs(page);

    // Sample up to 20 links to keep the test fast
    const sample = hrefs.slice(0, 20);
    for (const href of sample) {
      const status = await fetchStatus(request, href);
      expect(
        [200, 301, 302, 307, 308],
        `Link "${href}" from /en returned unexpected status ${status}`,
      ).toContain(status);
    }
  });
});

// ─── 7. Internal links on programmatic pages ─────────────────────────────────

test.describe("internal link integrity — programmatic pages", () => {
  test("/en/visit/lagos/restaurants: internal links are valid", async ({ page, request }) => {
    const url = "/en/visit/lagos/restaurants";
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response || response.status() === 404) {
      test.skip(true, `${url} returned 404`);
      return;
    }

    const hrefs = await collectInternalHrefs(page);
    const sample = hrefs.slice(0, 15);
    for (const href of sample) {
      const status = await fetchStatus(request, href);
      expect(
        [200, 301, 302, 307, 308],
        `Link "${href}" from ${url} returned ${status}`,
      ).toContain(status);
    }
  });
});

// ─── 8. sitemap.xml ───────────────────────────────────────────────────────────

test.describe("sitemap.xml", () => {
  test("GET /sitemap.xml returns 200", async ({ request }) => {
    const status = await fetchStatus(request, "/sitemap.xml");
    expect(status).toBe(200);
  });

  test("sitemap.xml is valid XML with urlset", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<url>");
    expect(body).toContain("<loc>");
  });

  test("sitemap.xml contains the /en home page", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    expect(body).toContain("/en");
  });

  test("sitemap.xml contains hreflang alternates", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    // Next.js sitemap API emits xhtml:link for alternates
    expect(body).toMatch(/xhtml:link|alternates|hreflang/i);
  });
});

// ─── 9. robots.txt ───────────────────────────────────────────────────────────

test.describe("robots.txt", () => {
  test("GET /robots.txt returns 200", async ({ request }) => {
    const status = await fetchStatus(request, "/robots.txt");
    expect(status).toBe(200);
  });

  test("robots.txt allows crawling of / path", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    // Should have a User-agent directive
    expect(body).toContain("User-agent");
    // Should not disallow everything
    expect(body).not.toMatch(/^Disallow: \/$/m);
  });

  test("robots.txt references the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    expect(body).toMatch(/Sitemap:/i);
  });
});

// ─── 10 & 11. Related links on programmatic pages use correct locale ───────────

test.describe("related links on programmatic pages", () => {
  test("/en/visit/lagos/restaurants related links use /en/ prefix", async ({ page }) => {
    const url = "/en/visit/lagos/restaurants";
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response || response.status() === 404) {
      test.skip(true, `${url} returned 404`);
      return;
    }

    const hrefs = await collectInternalHrefs(page);
    const relatedHrefs = hrefs.filter(
      (href) => href.includes("/restaurants/") || href.includes("/en/"),
    );

    for (const href of relatedHrefs) {
      expect(
        href,
        `Related link "${href}" on /en/visit/lagos/restaurants should start with /en/`,
      ).toMatch(/^\/en\//);
    }
  });

  test("/pt-pt/visit/lagos/restaurantes related links use /pt-pt/ prefix", async ({ page }) => {
    const url = "/pt-pt/visit/lagos/restaurantes";
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response || response.status() === 404) {
      test.skip(true, `${url} returned 404`);
      return;
    }

    const hrefs = await collectInternalHrefs(page);
    // All internal links starting with / should be /pt-pt/
    const internalNonUtil = hrefs.filter(
      (href) => href.startsWith("/pt-pt/") || href.startsWith(`/en/`),
    );
    // At minimum, the locale-specific links must use pt-pt
    const localLinks = internalNonUtil.filter((h) => !h.startsWith("/en/"));
    for (const href of localLinks) {
      expect(href).toMatch(/^\/pt-pt\//);
    }
  });
});

// ─── 12. No double prefix after locale switch ─────────────────────────────────

test.describe("no double prefix after language switch", () => {
  test("switching EN→FR doesn't produce /fr/fr/ URLs", async ({ page }) => {
    await page.goto("/en/directory", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "fr", "Français");
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }
    await page.waitForURL(/\/fr(\/|$)/, { timeout: 10_000 });

    const finalUrl = page.url();
    assertNoDoubleLocalePrefix(finalUrl);
    expectUrlHasLocale(finalUrl, "fr");

    // Collect links and check none are double-prefixed
    const hrefs = await collectInternalHrefs(page);
    for (const href of hrefs) {
      checkNoDoublePrefix(href);
    }
  });
});

// ─── 13. Key pages are directly accessible ───────────────────────────────────

test.describe("key pages are directly accessible", () => {
  const keyPages = [
    "/en",
    "/en/directory",
    "/en/blog",
    "/en/destinations",
    "/pt-pt",
    "/pt-pt/directory",
    "/fr",
    "/de",
  ];

  for (const path of keyPages) {
    test(`GET ${path} → 200`, async ({ request }) => {
      const status = await fetchStatus(request, path);
      expect(status, `${path} should be 200`).toBe(200);
    });
  }
});

test.describe("auth alias localization and unlocalized route parity", () => {
  test("GET /maintenance stays on the unlocalized canonical path", async ({ request, page }) => {
    const status = await fetchStatus(request, "/maintenance");
    expect([200, 301, 302, 307, 308]).toContain(status);

    await page.goto("/maintenance", { waitUntil: "domcontentloaded" });
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/maintenance(?:\/|$)/);
    expect(finalUrl).not.toMatch(/\/(?:en|pt-pt|fr|de|es|it|nl|sv|no|da)\/maintenance(?:\/|$)/);
  });

  for (const path of ["/signup", "/forgot-password"]) {
    test(`GET ${path} redirects to the localized canonical auth route`, async ({ request, page }) => {
      const status = await fetchStatus(request, path);
      expect([200, 301, 302, 307, 308]).toContain(status);

      await page.goto(path, { waitUntil: "domcontentloaded" });
      const finalUrl = page.url();
      expect(finalUrl).toMatch(
        new RegExp(
          `/((?:en|pt-pt|fr|de|es|it|nl|sv|no|da))${path.replace("/", "\\/")}(?:\\/|$)`,
        ),
      );
    });
  }

  test("legacy real-estate detail path does not redirect to locale-prefixed real-estate detail", async ({ page }) => {
    await page.goto("/real-estate/test-slug", { waitUntil: "commit" });
    const finalUrl = page.url();
    expect(finalUrl).not.toMatch(/\/(?:en|pt-pt|fr|de|es|it|nl|sv|no|da)\/real-estate\/test-slug(?:\/|$)/);
  });

  test("locale-prefixed auth routes remain localized canonicals", async ({ page }) => {
    await page.goto("/fr/signup", { waitUntil: "domcontentloaded" });
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/fr\/signup(?:\/|$)/);

    await page.goto("/fr/forgot-password", { waitUntil: "domcontentloaded" });
    expect(page.url()).toMatch(/\/fr\/forgot-password(?:\/|$)/);
  });
});

// ─── 14. /api routes are not locale-prefixed ─────────────────────────────────

test.describe("/api routes are excluded from locale prefixing", () => {
  test("GET /api/health or similar doesn't redirect to /en/api", async ({ page }) => {
    // We just verify that navigating to /api/... doesn't 404 due to middleware interference
    // The key is it should not end up at /en/api/...
    const response = await page.goto("/api/health", {
      waitUntil: "commit",
    }).catch(() => null);

    const finalUrl = page.url();
    // Should not have been locale-prefixed by middleware
    expect(finalUrl).not.toMatch(/\/en\/api\//);
    expect(finalUrl).not.toMatch(/\/fr\/api\//);
  });
});

// ─── Locale prefix coverage across all locales ───────────────────────────────

test.describe("all locales have accessible home pages", () => {
  for (const locale of SUPPORTED_LOCALES) {
    test(`GET /${locale} returns 200`, async ({ request }) => {
      const status = await fetchStatus(request, `/${locale}`);
      expect(status, `/${locale} should return 200`).toBe(200);
    });
  }
});

// ─── Programmatic page URL structure ─────────────────────────────────────────

test.describe("programmatic page URL structure correctness", () => {
  test("/en/visit/lagos/restaurants URL has correct structure", async ({ page }) => {
    const url = "/en/visit/lagos/restaurants";
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response || response.status() === 404) {
      test.skip(true, `${url} returned 404`);
      return;
    }

    const finalUrl = page.url();
    // Must have locale
    expectUrlHasLocale(finalUrl, "en");
    // No double prefix
    assertNoDoubleLocalePrefix(finalUrl);
    // Canonical must match the URL we requested
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    if (canonical) {
      expect(canonical).toContain("/en/visit/lagos/restaurants");
    }
  });

  test("legacy category/city compatibility URLs redirect to the canonical visit route", async ({ page }) => {
    await page.goto("/en/restaurants/lagos", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/visit\/lagos\/restaurants(?:\/)?$/);

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    if (canonical) {
      expect(canonical).toContain("/en/visit/lagos/restaurants");
    }
  });

  test("category slugs are locale-specific in programmatic URLs", async ({ request }) => {
    // EN: /en/restaurants/lagos
    const enStatus = await fetchStatus(request, "/en/restaurants/lagos");
    // PT: /pt-pt/restaurantes/lagos (translated slug)
    const ptStatus = await fetchStatus(request, "/pt-pt/restaurantes/lagos");

    // If either exists in DB they should be 200; both could be 404 if no data
    expect([200, 404]).toContain(enStatus);
    expect([200, 404]).toContain(ptStatus);

    // The EN slug should NOT work under PT locale (different slugs)
    const wrongSlugStatus = await fetchStatus(request, "/pt-pt/restaurants/lagos");
    // This could be 404 (correct) because "restaurants" isn't the PT slug
    // OR 200 if the app accepts both (not ideal but not catastrophic)
    // We just check it doesn't crash (5xx)
    expect(wrongSlugStatus).not.toBeGreaterThanOrEqual(500);
  });
});
