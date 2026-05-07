import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();

describe("public golf module allowlist wiring", () => {
  it("filters public golf data at the shared server loader before pages render", () => {
    const source = readFileSync(join(REPO_ROOT, "lib", "golf", "index.ts"), "utf8");

    expect(source).toContain("filterPublicGolfListings(listingRows");
    expect(source).toContain("isApprovedGolfCourse(listing)");
    expect(source).toContain("return filtered.slice(0, options.limit)");
  });

  it("keeps client-rendered golf cards guarded if unfiltered data is passed in", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "golf", "GolfPageClient.tsx"),
      "utf8",
    );
    const allListingsSource = readFileSync(
      join(REPO_ROOT, "components", "sections", "AllListingsSection.tsx"),
      "utf8",
    );

    expect(source).toContain("filterPublicGolfListings(courses)");
    expect(source).not.toContain("filterGolfListings(courses)");
    expect(allListingsSource).toContain("forcedCategorySlug === \"golf\"");
    expect(allListingsSource).toContain("isApprovedGolfCourse({ slug: listing.slug, name: listing.name })");
  });

  it("uses CMS discovery card image overrides on the public golf page", () => {
    const source = readFileSync(
      join(REPO_ROOT, "components", "golf", "GolfPageClient.tsx"),
      "utf8",
    );

    expect(source).toContain("const discoveryCardOverrides = Array.isArray(discoverySettings.cards)");
    expect(source).toContain('hasOwnKey(override, "imageUrl") ? override.imageUrl : option.imageUrl');
    expect(source).toContain("getSafeCmsImageSrc");
  });

  it("keeps the detail route on the existing notFound path for unapproved courses", () => {
    const pageSource = readFileSync(
      join(REPO_ROOT, "app", "[locale]", "golf", "courses", "[slug]", "page.tsx"),
      "utf8",
    );
    const loaderSource = readFileSync(join(REPO_ROOT, "lib", "golf", "index.ts"), "utf8");

    expect(pageSource).toContain("if (!course || course.categorySlug !== \"golf\")");
    expect(pageSource).toContain("notFound()");
    expect(loaderSource).toContain("isApprovedGolfCourse(listing)");
  });
});
