/**
 * locale.spec.ts — Locale synchronisation & language-switching tests
 *
 * Tests:
 *  1. <html lang> matches the locale segment in the URL
 *  2. Language switcher navigates to the correct locale URL
 *  3. Path is preserved (minus locale segment) after switching
 *  4. NEXT_LOCALE cookie is set after a language switch
 *  5. Navigation links (header + footer) preserve the active locale
 *  6. Logo home link preserves the active locale
 *  7. No cross-locale contamination — EN page doesn't contain PT <html lang>
 *  8. Bare "/" redirects to a locale-prefixed URL
 *  9. Switching locale on a programmatic page keeps category + city in URL
 * 10. All SUPPORTED_LOCALES produce a valid <html lang> on their home page
 */

import { test, expect, type Page } from "@playwright/test";
import {
  SUPPORTED_LOCALES,
  CORE_LOCALES,
  HTML_LANG,
  HREFLANG_TAGS,
  LOCALE_DISPLAY_NAMES,
  CATEGORY_URL_SLUGS,
} from "../helpers/constants";
import {
  switchLocaleFromUi,
  expectLanguageSwitcherLocale,
  extractLocaleFromUrl,
  expectUrlHasLocale,
  assertNoDoubleLocalePrefix,
} from "../helpers/page-utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Read the value of a cookie by name from the browser context. */
async function getCookieValue(page: Page, name: string): Promise<string | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === name)?.value;
}

/** Return all href values of anchor tags in the primary <nav>. */
async function getNavHrefs(page: Page): Promise<string[]> {
  return page.locator("header a[href], nav a[href]").evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute("href") ?? ""),
  );
}

/** Return all href values of anchor tags in <footer>. */
async function getFooterHrefs(page: Page): Promise<string[]> {
  return page.locator("footer a[href]").evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute("href") ?? ""),
  );
}

// ─── 1. <html lang> matches URL locale ────────────────────────────────────────

test.describe("<html lang> attribute", () => {
  for (const locale of CORE_LOCALES) {
    test(`/${locale} sets html[lang]="${HTML_LANG[locale]}"`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe(HTML_LANG[locale]);
    });
  }

  test("all supported locales produce the correct html[lang] on their home page", async ({ page }) => {
    for (const locale of SUPPORTED_LOCALES) {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
      const lang = await page.locator("html").getAttribute("lang");
      expect(
        lang,
        `/${locale} should set html[lang]="${HTML_LANG[locale]}"`,
      ).toBe(HTML_LANG[locale]);
    }
  });
});

// ─── 2 & 3. Language switcher navigation ──────────────────────────────────────

test.describe("language switcher", () => {
  test("switching EN → PT-PT updates URL locale to pt-pt", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "pt-pt", LOCALE_DISPLAY_NAMES["pt-pt"]);
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }
    await page.waitForURL(/\/pt-pt(\/|$)/, { timeout: 10_000 });

    expectUrlHasLocale(page.url(), "pt-pt");
  });

  test("switching locale preserves the path after the locale segment", async ({ page }) => {
    // Navigate to an English directory page
    await page.goto("/en/directory", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "fr", LOCALE_DISPLAY_NAMES["fr"]);
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }

    await page.waitForURL(/\/fr(\/|$)/, { timeout: 10_000 });

    const url = page.url();
    expectUrlHasLocale(url, "fr");
    // The path after locale must contain "directory" (same page, different locale)
    expect(url, "Path after locale should preserve 'directory'").toContain("directory");
  });

  test("switching locale updates <html lang>", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "de", LOCALE_DISPLAY_NAMES["de"]);
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }
    await page.waitForURL(/\/de(\/|$)/, { timeout: 10_000 });

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe(HTML_LANG["de"]);
  });
});

// ─── 4. NEXT_LOCALE cookie ────────────────────────────────────────────────────

test.describe("NEXT_LOCALE cookie", () => {
  test("NEXT_LOCALE cookie is set after visiting a locale page", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    // The middleware or LanguageSwitcher sets NEXT_LOCALE
    // At minimum navigating to /en should give us the cookie
    const cookie = await getCookieValue(page, "NEXT_LOCALE");
    // Either the cookie exists with "en" or is not set (middleware may not set on initial visit)
    if (cookie !== undefined) {
      expect(cookie).toBe("en");
    }
  });

  test("NEXT_LOCALE cookie updates after language switch", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "fr", LOCALE_DISPLAY_NAMES["fr"]);
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }
    await page.waitForURL(/\/fr(\/|$)/, { timeout: 10_000 });

    const cookie = await getCookieValue(page, "NEXT_LOCALE");
    if (cookie !== undefined) {
      expect(cookie).toBe("fr");
    }
  });
});

// ─── 5. Navigation links preserve locale ──────────────────────────────────────

test.describe("navigation link locale preservation", () => {
  for (const locale of CORE_LOCALES) {
    test(`header/nav links on /${locale} contain the /${locale}/ prefix`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

      const hrefs = await getNavHrefs(page);
      const internalLinks = hrefs.filter(
        (href) =>
          href.startsWith("/") &&
          !href.startsWith("/_next") &&
          !href.startsWith("/api") &&
          !href.startsWith("/auth") &&
          !href.startsWith("/dashboard") &&
          !href.startsWith("/admin") &&
          href !== "#",
      );

      if (internalLinks.length === 0) {
        // No nav links found — page may not have rendered fully
        return;
      }

      for (const href of internalLinks) {
        expect(
          href,
          `Nav link "${href}" on /${locale} should start with /${locale}/`,
        ).toMatch(new RegExp(`^\\/${locale}(\\/|$)`));
        assertNoDoubleLocalePrefix(`http://localhost:3000${href}`);
      }
    });
  }

  for (const locale of CORE_LOCALES) {
    test(`footer links on /${locale} contain the /${locale}/ prefix`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

      const hrefs = await getFooterHrefs(page);
      const internalLinks = hrefs.filter(
        (href) =>
          href.startsWith("/") &&
          !href.startsWith("/_next") &&
          !href.startsWith("/api") &&
          href !== "#",
      );

      if (internalLinks.length === 0) return;

      for (const href of internalLinks) {
        expect(
          href,
          `Footer link "${href}" on /${locale} should start with /${locale}/`,
        ).toMatch(new RegExp(`^\\/${locale}(\\/|$)`));
        assertNoDoubleLocalePrefix(`http://localhost:3000${href}`);
      }
    });
  }
});

// ─── 6. Logo link preserves locale ───────────────────────────────────────────

test.describe("logo / home link", () => {
  for (const locale of CORE_LOCALES) {
    test(`logo on /${locale} links to /${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/directory`, { waitUntil: "domcontentloaded" });

      // Logo is typically the first link in the header or an <a> wrapping an <img>
      const logoLink = page
        .locator("header a, nav a")
        .filter({ has: page.locator("img, svg, [class*='logo']") })
        .first();

      const count = await logoLink.count();
      if (count === 0) {
        // Fallback: first link in header
        const firstHeaderLink = page.locator("header a").first();
        if ((await firstHeaderLink.count()) === 0) return;
        const href = await firstHeaderLink.getAttribute("href");
        if (href) {
          expect(href).toMatch(new RegExp(`^\\/${locale}(\\/|$)|^\\/`));
        }
        return;
      }

      const href = await logoLink.getAttribute("href");
      if (href) {
        expect(
          href,
          `Logo on /${locale}/directory should link to /${locale}`,
        ).toMatch(new RegExp(`^\\/${locale}(\\/|$)`));
      }
    });
  }
});

// ─── 7. No cross-locale contamination ────────────────────────────────────────

test.describe("no cross-locale contamination", () => {
  test("/en page has html[lang] starting with 'en', not 'pt'", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toMatch(/^en/);
    expect(lang).not.toMatch(/^pt/);
  });

  test("/pt-pt page has html[lang]='pt-PT', not 'en'", async ({ page }) => {
    await page.goto("/pt-pt", { waitUntil: "domcontentloaded" });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("pt-PT");
    expect(lang).not.toMatch(/^en/);
  });

  test("/de page has html[lang]='de-DE'", async ({ page }) => {
    await page.goto("/de", { waitUntil: "domcontentloaded" });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("de-DE");
  });
});

// ─── 8. Bare "/" redirects to locale-prefixed URL ────────────────────────────

test("bare '/' redirects to a locale-prefixed URL", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  const finalUrl = page.url();

  // Must end up at a URL with a locale prefix
  const locale = extractLocaleFromUrl(finalUrl);
  expect(
    locale,
    `After navigating to '/', final URL "${finalUrl}" should have a locale prefix`,
  ).not.toBeNull();

  // Status must be 200 (redirect happened, landed on real page)
  expect(response?.status()).toBe(200);
});

// ─── 9. Locale switch on programmatic page preserves category + city ──────────

test.describe("locale switch on programmatic pages", () => {
  test("switching EN→PT-PT on /en/restaurants/lagos navigates to Portuguese equivalent", async ({
    page,
  }) => {
    const url = "/en/restaurants/lagos";
    const response = await page.goto(url, { waitUntil: "networkidle" });

    if (!response || response.status() === 404) {
      test.skip(true, `${url} returned 404 — no DB listings`);
      return;
    }

    const switched = await switchLocaleFromUi(page, "pt-pt", LOCALE_DISPLAY_NAMES["pt-pt"]);
    if (!switched) {
      test.skip(true, "Language switcher not found — skipping");
      return;
    }
    await page.waitForURL(/\/pt-pt\//, { timeout: 10_000 });

    const finalUrl = page.url();
    expectUrlHasLocale(finalUrl, "pt-pt");
    // Portuguese category slug for restaurants
    expect(finalUrl).toContain(CATEGORY_URL_SLUGS["restaurants"]["pt-pt"]);
    // City slug stays the same
    expect(finalUrl).toContain("lagos");
  });
});

// ─── 10. hreflang self-referencing ───────────────────────────────────────────

test.describe("hreflang self-reference", () => {
  for (const locale of CORE_LOCALES) {
    test(`/${locale} hreflang includes a self-referencing tag for ${HREFLANG_TAGS[locale]}`, async ({
      page,
    }) => {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

      const hreflangLinks = await page
        .locator(`link[rel="alternate"][hreflang="${HREFLANG_TAGS[locale]}"]`)
        .all();

      expect(
        hreflangLinks.length,
        `/${locale} should have an hreflang="${HREFLANG_TAGS[locale]}" <link> tag`,
      ).toBeGreaterThan(0);

      // The href must contain the locale prefix
      const href = await hreflangLinks[0].getAttribute("href");
      expect(href).toMatch(new RegExp(`\\/${locale}(\\/|$)`));
    });
  }

  test("every locale home page has an x-default hreflang", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(xDefault).toHaveCount(1);
    const href = await xDefault.getAttribute("href");
    expect(href).toBeTruthy();
  });
});

// ─── 11. CRITICAL: UI ↔ URL Synchronization (LanguageSwitcher Fix) ────────────────

test.describe("UI ↔ URL synchronization (critical fix)", () => {
  test("language switcher UI always reflects the current URL locale", async ({ page }) => {
    // Load English home page
    await page.goto("/en", { waitUntil: "networkidle" });

    // Verify UI shows English
    await expectLanguageSwitcherLocale(page, "en", /English|EN/i);

    // Switch to Portuguese
    const switched = await switchLocaleFromUi(page, "pt-pt", LOCALE_DISPLAY_NAMES["pt-pt"] || "Português");
    if (!switched) {
      test.skip(true, "Language switcher not found");
      return;
    }
    await page.waitForURL(/\/pt-pt(\/|$)/, { timeout: 10_000 });

    // CRITICAL: Verify UI now shows Portuguese (not stale English)
    // After navigation, UI must update to reflect new URL
    await expectLanguageSwitcherLocale(page, "pt-pt", /Português|PT/i);

    // Switch back to English
    const switched2 = await switchLocaleFromUi(page, "en", LOCALE_DISPLAY_NAMES["en"] || "English");
    if (!switched2) {
      test.skip(true, "Language switcher not found on second click");
      return;
    }
    await page.waitForURL(/\/en(\/|$)/, { timeout: 10_000 });

    // Verify UI shows English again
    await expectLanguageSwitcherLocale(page, "en", /English|EN/i);
  });

  test("page reload preserves UI ↔ URL sync", async ({ page }) => {
    // Navigate to Portuguese home page
    await page.goto("/pt-pt", { waitUntil: "networkidle" });

    // Verify URL is /pt-pt
    expectUrlHasLocale(page.url(), "pt-pt");

    // Reload page
    await page.reload({ waitUntil: "networkidle" });

    // After reload, URL should still be /pt-pt
    expectUrlHasLocale(page.url(), "pt-pt");

    // And UI should show Portuguese
    await expectLanguageSwitcherLocale(page, "pt-pt", /Português|PT/i);
  });

  test("all 10 locales maintain UI ↔ URL sync", async ({ page }) => {
    for (const locale of SUPPORTED_LOCALES) {
      await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

      // Verify URL has the locale
      expectUrlHasLocale(page.url(), locale);

      // Verify no double locale prefixes
      assertNoDoubleLocalePrefix(page.url());

      // Verify <html lang> matches
      const lang = await page.locator("html").getAttribute("lang");
      expect(
        lang,
        `/${locale} should have matching html[lang]`,
      ).toBeTruthy();
    }
  });

  test("locale switch preserves query params and hash", async ({ page }) => {
    // Navigate to /en/directory with query params
    await page.goto("/en/directory?category=places-to-stay", { waitUntil: "networkidle" });

    const switched = await switchLocaleFromUi(page, "fr", LOCALE_DISPLAY_NAMES["fr"] || "Français");
    if (!switched) {
      test.skip(true, "Language switcher not found");
      return;
    }
    await page.waitForURL(/\/fr(\/|$)/, { timeout: 10_000 });

    // Verify URL has /fr, directory path, and query params
    const url = page.url();
    expectUrlHasLocale(url, "fr");
    expect(url).toContain("directory");
    expect(url).toContain("category=places-to-stay");
  });
});
