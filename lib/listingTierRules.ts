import type { Database } from "@/integrations/supabase/types";

export type ListingTierRuleKey = Database["public"]["Enums"]["listing_tier"] | "curated";

export interface ListingTierRules {
  maxGalleryImages: number;
  allowDirectContactButton: boolean;
  allowCtaButton: boolean;
}

const LISTING_TIER_RULES: Record<ListingTierRuleKey, ListingTierRules> = {
  unverified: {
    maxGalleryImages: 1,
    allowDirectContactButton: false,
    allowCtaButton: false,
  },
  verified: {
    maxGalleryImages: 10,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
  signature: {
    maxGalleryImages: 20,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
  curated: {
    maxGalleryImages: 20,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
};

export function resolveListingTierRuleKey(
  tier: string | null | undefined,
): ListingTierRuleKey {
  if (tier === "verified" || tier === "signature" || tier === "curated") return tier;
  return "unverified";
}

export function getListingTierRules(
  tier: string | null | undefined,
): ListingTierRules {
  return LISTING_TIER_RULES[resolveListingTierRuleKey(tier)];
}

export function getListingTierMaxGalleryImages(
  tier: string | null | undefined,
): number {
  return getListingTierRules(tier).maxGalleryImages;
}
