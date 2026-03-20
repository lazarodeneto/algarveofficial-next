import { describe, expect, it } from "vitest";

import { hasRealEstateSignals, isRealEstateCategorySlug } from "./realEstateDetection";

describe("isRealEstateCategorySlug", () => {
  it("returns true for real estate slugs", () => {
    expect(isRealEstateCategorySlug("real-estate")).toBe(true);
    expect(isRealEstateCategorySlug("prime-real-estate")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isRealEstateCategorySlug("Real-Estate")).toBe(true);
    expect(isRealEstateCategorySlug("PRIME-REAL-ESTATE")).toBe(true);
  });

  it("returns false for non-real-estate slugs", () => {
    expect(isRealEstateCategorySlug("restaurants")).toBe(false);
    expect(isRealEstateCategorySlug("beaches")).toBe(false);
    expect(isRealEstateCategorySlug("")).toBe(false);
    expect(isRealEstateCategorySlug(null)).toBe(false);
    expect(isRealEstateCategorySlug(undefined)).toBe(false);
  });
});

describe("hasRealEstateSignals", () => {
  it("detects real estate signal fields", () => {
    expect(hasRealEstateSignals({ bedrooms: 3, agent_name: "" })).toBe(true);
    expect(hasRealEstateSignals({ agent_email: "agent@example.com" })).toBe(true);
    expect(hasRealEstateSignals({ price: 0 })).toBe(true);
    expect(hasRealEstateSignals({})).toBe(false);
    expect(hasRealEstateSignals({ bedrooms: null, notes: "test" })).toBe(false);
  });

  it("handles various signal keys", () => {
    const signals = [
      "property_type",
      "transaction_type",
      "bedrooms",
      "bathrooms",
      "property_size_m2",
      "plot_size_m2",
      "agent_name",
      "agent_email",
      "agent_phone",
      "price",
    ];

    signals.forEach((signal) => {
      expect(hasRealEstateSignals({ [signal]: "test" })).toBe(true);
      expect(hasRealEstateSignals({ [signal]: 123 })).toBe(true);
    });
  });

  it("returns false for null/undefined", () => {
    expect(hasRealEstateSignals(null)).toBe(false);
    expect(hasRealEstateSignals(undefined)).toBe(false);
  });

  it("returns false for non-real-estate signals", () => {
    const details = { name: "Test Restaurant", description: "Great food" };
    expect(hasRealEstateSignals(details)).toBe(false);
  });

  it("handles string values with whitespace", () => {
    expect(hasRealEstateSignals({ agent_name: "   " })).toBe(false);
    expect(hasRealEstateSignals({ agent_name: "John" })).toBe(true);
  });

  it("handles numeric values", () => {
    expect(hasRealEstateSignals({ bedrooms: 0 })).toBe(true);
    expect(hasRealEstateSignals({ bedrooms: NaN })).toBe(false);
    expect(hasRealEstateSignals({ bedrooms: Infinity })).toBe(false);
  });
});
