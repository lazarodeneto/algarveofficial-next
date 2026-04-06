import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const ADMIN_ROUTE_FILE = join(REPO_ROOT, "components", "routes", "AdminDashboardPage.tsx");
const LEGACY_PAGES_EDITOR_FILE = join(
  REPO_ROOT,
  "legacy-pages",
  "admin",
  "cms",
  "AdminPages.tsx",
);

describe("admin route contract", () => {
  it("keeps /admin/content/pages bound to the deprecation module", () => {
    const source = readFileSync(ADMIN_ROUTE_FILE, "utf8");
    expect(source).toContain('import AdminPagesDeprecated from "@/legacy-pages/admin/cms/AdminPagesDeprecated"');
    expect(source).toContain('"content/pages": <AdminPagesDeprecated />');
  });

  it("does not keep the removed legacy pages editor implementation", () => {
    expect(existsSync(LEGACY_PAGES_EDITOR_FILE)).toBe(false);
  });
});
