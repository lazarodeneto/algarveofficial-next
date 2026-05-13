import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

describe("listing slug redirect contracts", () => {
  it("normal listing route resolves historical aliases and redirects to listings.slug", () => {
    const route = source("app/[locale]/listing/[id]/page.tsx");

    expect(route).toContain('.from("listing_slugs")');
    expect(route).toContain(".eq(\"slug\", idOrSlug)");
    expect(route).toContain("canonicalSlug = publicListing.slug ?? publicListing.id");
    expect(route).toContain("permanentRedirect(buildLocalizedPath(resolvedLocale, `/listing/${data.canonicalSlug}`))");
  });

  it("golf listing route resolves historical aliases and redirects to listings.slug", () => {
    const golfLib = source("lib/golf/index.ts");
    const route = source("app/[locale]/golf/courses/[slug]/page.tsx");

    expect(golfLib).toContain('.from("listing_slugs")');
    expect(golfLib).toContain(".eq(\"slug\", normalizedSlug)");
    expect(golfLib).toContain("canonicalSlug: listing.slug");
    expect(route).toContain("!resolvedCourse.isCanonical");
    expect(route).toContain("permanentRedirect(buildLocalizedPath(locale, `/golf/courses/${resolvedCourse.canonicalSlug}`))");
  });
});
