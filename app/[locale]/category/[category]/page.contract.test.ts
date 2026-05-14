import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("category page route contract", () => {
  it("resolves category params through the canonical public category resolver", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain("resolvePublicCategoryRoute(rawCategory, locale)");
    expect(page).not.toContain(".eq(\"category_id\", rawCategory)");
    expect(page).not.toContain(".eq(\"category_slug\", rawCategory)");
    expect(page).not.toContain(".ilike(\"category");
  });

  it("redirects alias slugs and returns notFound for invalid category slugs", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain("resolution.reason === \"redirect_required\"");
    expect(page).toContain("permanentRedirect(resolution.redirectTo)");
    expect(page).toContain("notFound()");
  });

  it("does not index query-driven category variants", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain("searchParams");
    expect(page).toContain("hasNonCanonicalCategorySearchParams(resolvedSearchParams)");
  });

  it("uses canonical category data for metadata counts and JSON-LD", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain("getPublicCategoryCounts()");
    expect(page).toContain("categoryCounts.byCanonicalCategorySlug[canonical]");
    expect(page).toContain("buildItemListSchema(");
    expect(page).toContain("id=\"schema-category-item-list\"");
    expect(page).toContain("id=\"schema-category-breadcrumb\"");
  });

  it("removes the top cities section from the beaches category page", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain('const shouldShowTopCities = canonicalSlug !== "beaches"');
    expect(page).toContain("shouldShowTopCities &&");
  });

  it("renders every fetched beaches category listing card", () => {
    const page = source("app/[locale]/category/[category]/page.tsx");

    expect(page).toContain('const categoryListingLimit = canonicalSlug === "beaches" ? 1000 : 50');
    expect(page).toContain('canonicalSlug === "beaches"');
    expect(page).toContain('const shouldRenderListingCards = canonicalSlug === "beaches" || featuredListingsEnabled');
    expect(page).toContain("shouldRenderListingCards && categoryListingCards.length > 0");
    expect(page).toContain("categoryListingCards.map");
    expect(page).not.toContain("safeListingsForLocale.slice(0, 12).map");
  });
});
