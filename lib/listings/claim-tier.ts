import type { Database } from "@/integrations/supabase/types";

export type BusinessClaimTier = Database["public"]["Enums"]["business_claim_tier"];
export type ListingClaimStatus = Database["public"]["Enums"]["listing_claim_status"];
export type ListingTier = Database["public"]["Enums"]["listing_tier"];

export type PublicClaimTierBadge = {
  tier: Extract<ListingTier, "verified" | "signature">;
  label: "Verified Business" | "Signature Partner";
  description: string;
};

export type TierUpgradePrompt = {
  targetTier: Extract<BusinessClaimTier, "verified" | "signature">;
  label: "Upgrade to Verified" | "Become a Signature Partner";
  description: string;
};

export function normalizeBusinessClaimTier(value: unknown): BusinessClaimTier | null {
  return value === "free" || value === "verified" || value === "signature" ? value : null;
}

export function normalizeListingTier(value: unknown): ListingTier {
  return value === "verified" || value === "signature" ? value : "unverified";
}

export function mapClaimTierToListingTier(tier: BusinessClaimTier | null | undefined): ListingTier | null {
  if (tier === "verified" || tier === "signature") return tier;
  if (tier === "free") return "unverified";
  return null;
}

export function getBusinessClaimTierLabel(tier: BusinessClaimTier | null | undefined) {
  switch (tier) {
    case "signature":
      return "Signature Partner";
    case "verified":
      return "Verified Business";
    case "free":
      return "Free Claim";
    default:
      return null;
  }
}

export function getOwnerDisplayTier(
  listingTier: ListingTier | string | null | undefined,
  selectedClaimTier?: BusinessClaimTier | string | null,
): ListingTier {
  const normalizedListingTier = normalizeListingTier(listingTier);
  if (normalizedListingTier === "verified" || normalizedListingTier === "signature") {
    return normalizedListingTier;
  }

  return mapClaimTierToListingTier(normalizeBusinessClaimTier(selectedClaimTier)) ?? normalizedListingTier;
}

export function getPublicClaimTierBadge({
  claimStatus,
  listingTier,
}: {
  claimStatus?: ListingClaimStatus | string | null;
  listingTier?: ListingTier | string | null;
}): PublicClaimTierBadge | null {
  if (claimStatus !== "claimed") return null;

  if (listingTier === "signature") {
    return {
      tier: "signature",
      label: "Signature Partner",
      description: "Premium AlgarveOfficial partner listing",
    };
  }

  if (listingTier === "verified") {
    return {
      tier: "verified",
      label: "Verified Business",
      description: "Ownership verified by AlgarveOfficial",
    };
  }

  return null;
}

export function getTierUpgradePrompts(currentTier: ListingTier | string | null | undefined): TierUpgradePrompt[] {
  const tier = normalizeListingTier(currentTier);

  if (tier === "signature") return [];

  const prompts: TierUpgradePrompt[] = [];

  if (tier === "unverified") {
    prompts.push({
      targetTier: "verified",
      label: "Upgrade to Verified",
      description: "Add a stronger trust signal and unlock richer owner visibility.",
    });
  }

  prompts.push({
    targetTier: "signature",
    label: "Become a Signature Partner",
    description: "Signal premium partner interest for editorial-style visibility.",
  });

  return prompts;
}
