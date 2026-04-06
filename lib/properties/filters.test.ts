import { describe, expect, it } from "vitest";

import { matchesPropertyCategoryFilters } from "@/lib/properties/filters";

describe("matchesPropertyCategoryFilters", () => {
  it("accepts listing when filters are all", () => {
    expect(
      matchesPropertyCategoryFilters(
        { category_data: { property_type: "Villa", bedrooms: 4 } },
        { type: "all", beds: "all" },
      ),
    ).toBe(true);
  });

  it("filters by property_type using case-insensitive matching", () => {
    expect(
      matchesPropertyCategoryFilters(
        { category_data: { property_type: "Villa", bedrooms: 4 } },
        { type: "villa", beds: "all" },
      ),
    ).toBe(true);
    expect(
      matchesPropertyCategoryFilters(
        { category_data: { property_type: "Apartment", bedrooms: 4 } },
        { type: "villa", beds: "all" },
      ),
    ).toBe(false);
  });

  it("filters by minimum bedrooms with number or string payload values", () => {
    expect(
      matchesPropertyCategoryFilters(
        { category_data: { property_type: "Villa", bedrooms: 4 } },
        { type: "all", beds: "3" },
      ),
    ).toBe(true);
    expect(
      matchesPropertyCategoryFilters(
        { category_data: { property_type: "Villa", bedrooms: "2" } },
        { type: "all", beds: "3" },
      ),
    ).toBe(false);
  });
});
