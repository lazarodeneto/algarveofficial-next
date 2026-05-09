import { describe, expect, it } from "vitest";

import {
  buildMergedCategoryOptions,
  filterVisibleListingCategories,
  inferCategorySlugsFromSearch,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";

const category = (slug: string, name: string, id = slug) =>
  ({
    id,
    slug,
    name,
    icon: null,
    short_description: null,
    description: null,
    image_url: null,
    is_active: true,
    is_featured: false,
    display_order: 1,
  }) as any;

describe("listing category filter visibility", () => {
  it("hides Events and legacy event aliases from listing category filters", () => {
    const categories = [
      category("events", "Events"),
      category("premier-events", "Premier Events"),
      category("concierge-services", "Concierge Services"),
      category("accommodation", "Accommodation"),
    ];

    expect(filterVisibleListingCategories(categories).map((item) => item.slug)).toEqual([
      "concierge-services",
      "accommodation",
    ]);

    const merged = buildMergedCategoryOptions(categories);

    expect(merged.map((item) => item.slug)).not.toContain("events");
    expect(merged.map((item) => item.slug)).toContain("concierge-services");
    expect(resolveCategoryFilterSlug("events", categories, merged)).toBe("all");
    expect(inferCategorySlugsFromSearch("events in the algarve")).toEqual([]);
  });
});
