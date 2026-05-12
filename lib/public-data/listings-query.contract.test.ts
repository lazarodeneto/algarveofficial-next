import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("public listings category query contract", () => {
  it("queries listings by resolved category_id values instead of loose category slugs", () => {
    const source = readFileSync(join(REPO_ROOT, "lib", "public-data", "listings.ts"), "utf8");

    expect(source).toContain("resolvePublicCategoryFilterIds(data as Tables<\"categories\">[], filters.categorySlug)");
    expect(source).toContain("if (categoryIds.length > 0) query = query.in(\"category_id\", categoryIds)");
    expect(source).not.toContain(".eq(\"category_slug\"");
    expect(source).not.toContain(".ilike(\"category\"");
  });
});
