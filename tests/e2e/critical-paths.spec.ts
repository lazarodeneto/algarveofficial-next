import { expect, test, type Page } from "@playwright/test";

function languageSelect(page: Page) {
  return page
    .locator('select[aria-label*="language" i], header select')
    .first();
}

async function switchLocale(page: Page, nextLocale: string) {
  const select = languageSelect(page);
  await expect(select).toHaveCount(1);
  await select.selectOption(nextLocale, { force: true });
}

async function getFirstListingHref(page: Page) {
  await page.goto("/en/visit", { waitUntil: "networkidle" });
  const firstListingLink = page.locator('a[href^="/en/listing/"]').first();
  const count = await firstListingLink.count();
  if (count === 0) {
    return null;
  }
  return firstListingLink.getAttribute("href");
}

test.describe("Critical i18n smoke paths", () => {
  test("locale persists after language switch via NEXT_LOCALE cookie", async ({ page, request }) => {
    await page.goto("/en/destinations", { waitUntil: "networkidle" });

    await switchLocale(page, "pt-pt");
    await page.waitForURL(/\/pt-pt\/destinations(?:\/)?$/, { timeout: 15_000 });

    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((cookie) => cookie.name === "NEXT_LOCALE");
    expect(localeCookie?.value).toBe("pt-pt");

    const response = await request.get("/", {
      maxRedirects: 0,
      failOnStatusCode: false,
      headers: {
        Cookie: "NEXT_LOCALE=pt-pt",
      },
    });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe("/pt-pt");
  });

  test("programmatic category slug switches to locale-specific path", async ({ page }) => {
    await page.goto("/en/visit/lagos/restaurants", { waitUntil: "networkidle" });

    await switchLocale(page, "pt-pt");
    await page.waitForURL(/\/pt-pt\/visit\/lagos\/restaurantes(?:\/)?$/, { timeout: 15_000 });

    await expect(page).toHaveURL(/\/pt-pt\/visit\/lagos\/restaurantes(?:\/)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
    await expect(page.locator("body")).not.toContainText("404");
  });

  test("listing detail page renders without 404", async ({ page }) => {
    const listingHref = await getFirstListingHref(page);
    test.skip(!listingHref, "No listing link available from the public visit page.");

    await page.goto(listingHref!, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/en\/listing\/.+/);
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("Listing Not Found");
    await expect(page.locator("main")).toBeVisible();
  });

  test("auth redirect to login preserves locale and next param", async ({ page }) => {
    await page.goto("/de/dashboard", { waitUntil: "networkidle" });

    await page.waitForURL(/\/de\/login\?/, { timeout: 15_000 });

    const currentUrl = new URL(page.url());
    expect(currentUrl.pathname).toBe("/de/login");
    expect(currentUrl.searchParams.get("locale")).toBe("de");
    expect(currentUrl.searchParams.get("next")).toBe("/de/dashboard");
  });
});
