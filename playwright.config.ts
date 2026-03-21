import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",

  // ─── Timeouts ─────────────────────────────────────────────────────────────
  /** Per-test timeout. SSR + ISR revalidation on CI can be slow. */
  timeout: 90_000,
  /** Timeout for expect() assertions (e.g. waitForURL, toHaveText). */
  expect: {
    timeout: 15_000,
  },

  // ─── Parallelism ──────────────────────────────────────────────────────────
  /** Run all spec files in parallel; tests within a file run sequentially. */
  fullyParallel: true,
  /** 1 retry on CI to catch flaky network / ISR timing issues. */
  retries: isCI ? 1 : 0,
  /**
   * CI: 2 workers keeps memory manageable on a single GH Actions runner.
   * Local: let Playwright choose based on CPU count.
   */
  workers: isCI ? 2 : undefined,

  // ─── Reporters ────────────────────────────────────────────────────────────
  reporter: isCI
    ? [["github"], ["html", { open: "never" }], ["json", { outputFile: "playwright-results.json" }]]
    : [["list"], ["html", { open: "never" }]],

  // ─── Shared context defaults ──────────────────────────────────────────────
  use: {
    baseURL,
    /** Collect Playwright traces on the first retry for easy debugging. */
    trace: "on-first-retry",
    /** Screenshot on failure — attached to the HTML report. */
    screenshot: "only-on-failure",
    /** Video on first retry to diagnose flakes. */
    video: isCI ? "on-first-retry" : "off",
    /** Accept-Language header — tests that care about locale set it explicitly. */
    locale: "en-US",
    /** Ignore HTTPS errors for local dev/preview environments. */
    ignoreHTTPSErrors: true,
  },

  // ─── Dev / preview server ─────────────────────────────────────────────────
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: isCI ? "npm run build && npm run start" : "npm run dev",
        url: baseURL,
        timeout: isCI ? 240_000 : 120_000,
        reuseExistingServer: !isCI,
        /** Pipe server output so build errors are visible in CI logs. */
        stdout: "pipe",
        stderr: "pipe",
      },

  // ─── Browser projects ─────────────────────────────────────────────────────
  projects: [
    // ── Desktop ──────────────────────────────────────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      // Only run on CI or when explicitly requested (BROWSERS=all)
      ...(isCI || process.env.BROWSERS === "all" ? {} : { grep: /^$/ }),
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      // WebKit / Safari: run on CI only
      ...(isCI || process.env.BROWSERS === "all" ? {} : { grep: /^$/ }),
    },

    // ── Mobile ───────────────────────────────────────────────────────────────
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      // Mobile: CI + explicit opt-in
      ...(isCI || process.env.BROWSERS === "all" ? {} : { grep: /^$/ }),
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
      ...(isCI || process.env.BROWSERS === "all" ? {} : { grep: /^$/ }),
    },
  ],
});
