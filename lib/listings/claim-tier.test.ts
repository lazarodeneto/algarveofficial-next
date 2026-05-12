import { describe, expect, it } from "vitest";

import {
  getBusinessClaimTierLabel,
  getOwnerDisplayTier,
  getPublicClaimTierBadge,
  getTierUpgradePrompts,
  mapClaimTierToListingTier,
  normalizeBusinessClaimTier,
} from "./claim-tier";

describe("business claim tier helpers", () => {
  it("maps claim tiers onto the existing listing tier model", () => {
    expect(mapClaimTierToListingTier("free")).toBe("unverified");
    expect(mapClaimTierToListingTier("verified")).toBe("verified");
    expect(mapClaimTierToListingTier("signature")).toBe("signature");
    expect(mapClaimTierToListingTier(null)).toBeNull();
  });

  it("normalizes unknown claim tiers to null", () => {
    expect(normalizeBusinessClaimTier("verified")).toBe("verified");
    expect(normalizeBusinessClaimTier("enterprise")).toBeNull();
    expect(normalizeBusinessClaimTier(undefined)).toBeNull();
  });

  it("uses the selected claim tier as owner display fallback", () => {
    expect(getOwnerDisplayTier("unverified", "verified")).toBe("verified");
    expect(getOwnerDisplayTier("unverified", "signature")).toBe("signature");
    expect(getOwnerDisplayTier("signature", "verified")).toBe("signature");
    expect(getOwnerDisplayTier(null, "free")).toBe("unverified");
  });

  it("only exposes public tier badges for claimed verified or signature listings", () => {
    expect(getPublicClaimTierBadge({ claimStatus: "claim_pending", listingTier: "verified" })).toBeNull();
    expect(getPublicClaimTierBadge({ claimStatus: "claimed", listingTier: "unverified" })).toBeNull();
    expect(getPublicClaimTierBadge({ claimStatus: "claimed", listingTier: "verified" })?.label).toBe(
      "Verified Business",
    );
    expect(getPublicClaimTierBadge({ claimStatus: "claimed", listingTier: "signature" })?.label).toBe(
      "Signature Partner",
    );
  });

  it("returns visible owner upgrade prompts without payment checkout", () => {
    expect(getTierUpgradePrompts("unverified").map((prompt) => prompt.label)).toEqual([
      "Upgrade to Verified",
      "Become a Signature Partner",
    ]);
    expect(getTierUpgradePrompts("verified").map((prompt) => prompt.label)).toEqual([
      "Become a Signature Partner",
    ]);
    expect(getTierUpgradePrompts("signature")).toEqual([]);
  });

  it("labels claim tiers consistently", () => {
    expect(getBusinessClaimTierLabel("free")).toBe("Free Claim");
    expect(getBusinessClaimTierLabel("verified")).toBe("Verified Business");
    expect(getBusinessClaimTierLabel("signature")).toBe("Signature Partner");
  });
});
