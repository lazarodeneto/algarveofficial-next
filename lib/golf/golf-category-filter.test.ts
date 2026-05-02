import { describe, expect, it } from "vitest";

import {
  CANONICAL_GOLF_CATEGORY_SLUG,
  filterGolfListings,
  isGolfCategoryValue,
} from "@/lib/golf";

describe("golf category filtering", () => {
  it("accepts the canonical Golf category and approved aliases", () => {
    expect(isGolfCategoryValue("golf")).toBe(true);
    expect(isGolfCategoryValue("Golf")).toBe(true);
    expect(isGolfCategoryValue("golf-course")).toBe(true);
    expect(isGolfCategoryValue("golf-courses")).toBe(true);
    expect(isGolfCategoryValue("golf courses")).toBe(true);
    expect(isGolfCategoryValue("golf_courses")).toBe(true);
  });

  it("rejects non-golf categories even when golf appears in the listing copy", () => {
    const listings = [
      {
        name: "Golf-front villa",
        description: "A villa overlooking a championship golf course.",
        categorySlug: "real-estate",
        categoryName: "Real Estate",
      },
      {
        name: "Vilamoura Championship Course",
        description: "Golf course listing.",
        categorySlug: "golf",
        categoryName: "Golf",
      },
    ];

    expect(filterGolfListings(listings)).toEqual([listings[1]]);
  });

  it("keeps alias-category listings and drops fallback listings from other categories", () => {
    const listings = [
      { categorySlug: "golf-courses", categoryName: "Golf Courses" },
      { categorySlug: "restaurants", categoryName: "Restaurants" },
      { categorySlug: null, categoryName: "Golf Course" },
      { categorySlug: "properties", categoryName: "Properties" },
    ];

    expect(filterGolfListings(listings)).toEqual([listings[0], listings[2]]);
  });

  it("documents the canonical normalized Golf slug used by the module", () => {
    expect(CANONICAL_GOLF_CATEGORY_SLUG).toBe("golf");
  });
});
