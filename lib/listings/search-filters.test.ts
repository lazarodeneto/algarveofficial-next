import { describe, expect, it } from "vitest";

import {
  buildListingSearchOrGroups,
  sanitizeListingSearchTerm,
  tokenizeListingSearchTerm,
} from "./search-filters";

describe("listing search filters", () => {
  it("sanitizes PostgREST-breaking punctuation without removing accents", () => {
    expect(sanitizeListingSearchTerm(" Hotel, Vila Galé (Collection) Praia ")).toBe(
      "Hotel Vila Galé Collection Praia",
    );
  });

  it("tokenizes specific listing searches into meaningful accented tokens", () => {
    expect(tokenizeListingSearchTerm("Hotel Vila Galé Collection Praia")).toEqual([
      "Hotel",
      "Vila",
      "Galé",
      "Collection",
      "Praia",
    ]);
  });

  it("builds AND-combined groups for multi-word searches", () => {
    const groups = buildListingSearchOrGroups("Hotel Vila Galé Collection Praia");

    expect(groups).toHaveLength(5);
    expect(groups[0]).toContain("name.ilike.%Hotel%");
    expect(groups[1]).toContain("name.ilike.%Vila%");
    expect(groups[2]).toContain("name.ilike.%Galé%");
    expect(groups.join("|")).not.toContain("category_id.in");
  });

  it("keeps broad single-word searches able to match categories", () => {
    const groups = buildListingSearchOrGroups("golf", ["category-golf"]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toContain("name.ilike.%golf%");
    expect(groups[0]).toContain("tags.cs.{golf}");
    expect(groups[0]).toContain("category_id.in.(category-golf)");
  });
});
