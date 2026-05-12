import { describe, expect, it } from "vitest";

import {
  buildCategoryPageMetaCopy,
  hasNonCanonicalCategorySearchParams,
} from "@/lib/seo/category-page-metadata";

describe("category page metadata helpers", () => {
  it("detects query variants that should not be indexed as canonical category pages", () => {
    expect(hasNonCanonicalCategorySearchParams()).toBe(false);
    expect(hasNonCanonicalCategorySearchParams({})).toBe(false);
    expect(hasNonCanonicalCategorySearchParams({ sort: "" })).toBe(true);
    expect(hasNonCanonicalCategorySearchParams({ city: ["lagoa", "lagos"] })).toBe(true);
  });

  it("uses accurate public listing counts in metadata copy", () => {
    expect(
      buildCategoryPageMetaCopy({
        categoryName: "Restaurants",
        locale: "en",
        listingCount: 42,
      }),
    ).toMatchObject({
      title: "42 Restaurants in the Algarve",
      description: expect.stringContaining("42 published restaurants"),
    });
  });

  it("uses empty-state copy when a valid category has no published listings", () => {
    expect(
      buildCategoryPageMetaCopy({
        categoryName: "Markets",
        locale: "en",
        listingCount: 0,
      }).description,
    ).toContain("will appear here when available");
  });
});
