import type { Page, APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Fetch a URL using only the network layer (no full render).
 * Use this for bulk 200/404 checks to avoid spinning up a full browser page.
 */
export async function fetchStatus(
  request: APIRequestContext,
  url: string,
): Promise<number> {
  const res = await request.get(url, { failOnStatusCode: false });
  return res.status();
}

/**
 * Returns the raw HTML source of a page BEFORE JavaScript hydration.
 * Used to confirm content is server-rendered (SSR) and not injected by React.
 *
 * Strategy: navigate with waitUntil: "commit" to get the first byte, then
 * use page.content() which returns the current HTML snapshot. Since this is
 * called immediately after the navigation resolves (before scripts run),
 * the HTML reflects SSR output only.
 */
export async function getServerRenderedHtml(page: Page, url: string): Promise<string> {
  // Navigate but only wait for the response to start (before scripts execute)
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return page.content();
}

/**
 * Assert that a page is NOT empty — has visible textual content.
 * This catches pages that render an empty shell client-side only.
 */
export async function assertPageHasContent(page: Page): Promise<void> {
  const body = page.locator("body");
  const bodyText = await body.innerText();
  expect(
    bodyText.replace(/\s+/g, " ").trim().length,
    "Page body should contain substantial text — not an empty shell",
  ).toBeGreaterThan(50);
}

/**
 * Collect all console errors and warnings from a page after loading.
 * Returns messages that match known problematic patterns.
 */
export async function collectHydrationErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      const text = msg.text();
      if (
        text.includes("Hydration") ||
        text.includes("hydration") ||
        text.includes("did not match") ||
        text.includes("Minified React error") ||
        text.includes("Expected server HTML")
      ) {
        errors.push(text);
      }
    }
  });
  return errors;
}

/**
 * Wait for the language switcher dropdown to open.
 * Tries multiple selector strategies to handle different render states.
 */
export async function openLanguageSwitcher(page: Page): Promise<boolean> {
  // Try the Globe-icon button
  const triggers = [
    page.locator('button').filter({ has: page.locator('[data-lucide="Globe"]') }),
    page.locator('button').filter({ has: page.locator('svg.lucide-globe') }),
    page.locator('[data-testid="language-switcher"]'),
    page.locator('button[aria-label*="language" i]'),
    page.locator('button').filter({ hasText: /^(EN|PT|FR|DE|ES|IT|NL|SV|NO|DA)$/i }),
  ];

  for (const trigger of triggers) {
    if (await trigger.count() > 0) {
      await trigger.first().click();
      // Wait for dropdown content to appear
      await page.waitForTimeout(300);
      return true;
    }
  }
  return false;
}

/**
 * Extract the locale segment from a full URL string.
 * Returns null if no valid locale is found.
 */
export function extractLocaleFromUrl(url: string): string | null {
  const LOCALE_PATTERN = /^https?:\/\/[^/]+\/([a-z]{2}(?:-[a-z]{2})?)(\/|$)/i;
  const match = url.match(LOCALE_PATTERN);
  return match?.[1] ?? null;
}

/**
 * Assert that a URL contains a specific locale segment at the correct position.
 */
export function expectUrlHasLocale(url: string, locale: string): void {
  const extracted = extractLocaleFromUrl(url);
  expect(
    extracted,
    `URL "${url}" should contain locale "${locale}" as first path segment`,
  ).toBe(locale);
}

/**
 * Check for double-prefixed locales (e.g. /en/en/directory — a common bug).
 */
export function assertNoDoubleLocalePrefix(url: string): void {
  const DOUBLE_LOCALE = /\/([a-z]{2}(?:-[a-z]{2})?)\/\1\//i;
  expect(
    DOUBLE_LOCALE.test(url),
    `URL "${url}" contains a double locale prefix`,
  ).toBe(false);
}
