import { describe, expect, it } from "vitest";

import { getListingTierRules, resolveListingTierRuleKey } from "@/lib/listingTierRules";

describe("listing tier rules", () => {
  it("defaults unknown tiers to unverified public limits", () => {
    expect(resolveListingTierRuleKey(null)).toBe("unverified");
    expect(resolveListingTierRuleKey("free")).toBe("unverified");
    expect(getListingTierRules("free")).toMatchObject({
      maxGalleryImages: 1,
      allowPublicContactFields: false,
      allowPublicSocialLinks: false,
      allowDirectContactButton: false,
      allowCtaButton: false,
    });
  });

  it("keeps unverified listings basic-only", () => {
    expect(getListingTierRules("unverified")).toEqual({
      maxGalleryImages: 1,
      allowPublicContactFields: false,
      allowPublicSocialLinks: false,
      allowDirectContactButton: false,
      allowCtaButton: false,
    });
  });

  it("allows verified listings to show trusted public contact surfaces", () => {
    expect(getListingTierRules("verified")).toEqual({
      maxGalleryImages: 10,
      allowPublicContactFields: true,
      allowPublicSocialLinks: true,
      allowDirectContactButton: true,
      allowCtaButton: true,
    });
  });

  it("allows signature listings to show trusted public contact surfaces", () => {
    expect(getListingTierRules("signature")).toEqual({
      maxGalleryImages: 20,
      allowPublicContactFields: true,
      allowPublicSocialLinks: true,
      allowDirectContactButton: true,
      allowCtaButton: true,
    });
  });
});
