import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully and shows primary content", async ({ page }) => {
    const response = await page.goto("/");
    expect(response, "Expected a document response for /").not.toBeNull();
    expect(response?.ok(), "Expected homepage response to be OK").toBeTruthy();

    await expect(page).toHaveTitle(/AlgarveOfficial/i);
    await expect(page.getByRole("link", { name: /skip to main content/i })).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
