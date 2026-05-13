import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const STAY_PAGE_PATH = join(REPO_ROOT, "app", "[locale]", "stay", "page.tsx");
const DIRECTORY_CLIENT_PATH = join(REPO_ROOT, "components", "directory", "DirectoryClient.tsx");

describe("stay directory default category contract", () => {
  it("server-renders /stay with accommodation as the default category filter", () => {
    const source = readFileSync(STAY_PAGE_PATH, "utf8");

    expect(source).toContain('const STAY_DEFAULT_CATEGORY_SLUG = "accommodation"');
    expect(source).toContain('category: getFilterValue("category", STAY_DEFAULT_CATEGORY_SLUG)');
  });

  it("keeps the client-side /stay filter bound to accommodation when no category query exists", () => {
    const source = readFileSync(DIRECTORY_CLIENT_PATH, "utf8");

    expect(source).toContain('const STAY_DEFAULT_CATEGORY_SLUG = "accommodation"');
    expect(source).toContain("getDirectoryRouteDefaultCategory(cmsPageId, pathname)");
    expect(source).toContain('setSelectedCategory(defaultCategoryForRoute)');
    expect(source).toContain('selectedCategory !== "all" && selectedCategory !== defaultCategoryForRoute');
    expect(source).toContain('setSelectedCategory(defaultCategoryForRoute);');
  });
});
