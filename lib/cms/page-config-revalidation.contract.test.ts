import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_CONFIG_ROUTE_PATH = join(
  process.cwd(),
  "app",
  "api",
  "admin",
  "cms",
  "page-config",
  "route.ts",
);

describe("cms page-config revalidation contract", () => {
  it("revalidates canonical and legacy English paths after publishing CMS pages", () => {
    const source = readFileSync(PAGE_CONFIG_ROUTE_PATH, "utf8");

    expect(source).toContain("function getRevalidatablePaths");
    expect(source).toContain("addLocaleToPathname(path, normalizedLocale)");
    expect(source).toContain("paths.add(normalizedPath || \"/\");");
    expect(source).toContain("paths.add(`/${DEFAULT_LOCALE}${normalizedPath}`);");
    expect(source).toContain("for (const pathToRevalidate of pathsToRevalidate)");
  });
});
