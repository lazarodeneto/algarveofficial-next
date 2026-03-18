import { describe, expect, it } from "vitest";
import { hasRealEstateSignals, isRealEstateCategorySlug } from "./realEstateDetection";

describe("realEstateDetection", () => {
  it("detects real estate category slugs", () => {
    expect(isRealEstateCategorySlug("real-estate")).toBe(true);
    expect(isRealEstateCategorySlug("prime-real-estate")).toBe(true);
    expect(isRealEstateCategorySlug("REAL-ESTATE")).toBe(true);
    expect(isRealEstateCategorySlug("luxury-accommodation")).toBe(false);
  });

  it("detects real estate signal fields in category_data", () => {
    expect(hasRealEstateSignals({ bedrooms: 3, agent_name: "" })).toBe(true);
    expect(hasRealEstateSignals({ agent_email: "agent@example.com" })).toBe(true);
    expect(hasRealEstateSignals({ price: 0 })).toBe(true);
    expect(hasRealEstateSignals({ bedrooms: null, notes: "test" })).toBe(false);
    expect(hasRealEstateSignals({})).toBe(false);
  });
});
