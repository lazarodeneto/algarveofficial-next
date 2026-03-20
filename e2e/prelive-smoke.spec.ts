import { expect, test } from "@playwright/test";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

test.describe("Pre-live smoke", () => {
  test("critical user path is healthy @smoke", async ({ page }) => {
    const email = requiredEnv("E2E_USER_EMAIL");
    const password = requiredEnv("E2E_USER_PASSWORD");
    const runtimeErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        runtimeErrors.push(`console: ${msg.text()}`);
      }
    });

    page.on("response", (response) => {
      if (response.status() >= 500 && response.url().includes("/api/")) {
        runtimeErrors.push(`api ${response.status()}: ${response.url()}`);
      }
    });

    await test.step("Home page is available", async () => {
      await page.goto("/");
      await expect(page).toHaveTitle(/AlgarveOfficial/i);
      await expect(page.getByText("We'll Be Back Soon")).toHaveCount(0);
    });

    await test.step("Login succeeds", async () => {
      await page.goto("/login");
      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByRole("textbox", { name: "Password" }).fill(password);
      await page.getByRole("button", { name: /sign in/i }).click();
    });

    await test.step("Protected dashboard is visible after auth", async () => {
      await expect(page).toHaveURL(/\/(admin|dashboard|owner)(\/.*)?$/);
      await expect(page.getByText(/dashboard/i)).toBeVisible();
    });

    expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);
  });
});
