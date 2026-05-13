import type { Database } from "@/integrations/supabase/types";

export type ListingTierRuleKey = Database["public"]["Enums"]["listing_tier"] | "curated";

export interface ListingTierRules {
  maxGalleryImages: number;
  allowPublicContactFields: boolean;
  allowPublicSocialLinks: boolean;
  allowDirectContactButton: boolean;
  allowCtaButton: boolean;
}

const LISTING_TIER_RULES: Record<ListingTierRuleKey, ListingTierRules> = {
  unverified: {
    maxGalleryImages: 1,
    allowPublicContactFields: false,
    allowPublicSocialLinks: false,
    allowDirectContactButton: false,
    allowCtaButton: false,
  },
  verified: {
    maxGalleryImages: 10,
    allowPublicContactFields: true,
    allowPublicSocialLinks: true,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
  signature: {
    maxGalleryImages: 20,
    allowPublicContactFields: true,
    allowPublicSocialLinks: true,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
  curated: {
    maxGalleryImages: 20,
    allowPublicContactFields: true,
    allowPublicSocialLinks: true,
    allowDirectContactButton: true,
    allowCtaButton: true,
  },
};

export function resolveListingTierRuleKey(
  tier: string | null | undefined,
): ListingTierRuleKey {
  const normalized = String(tier ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "curated") return "curated";
  if (normalized === "signature" || normalized === "signature_partner") return "signature";
  if (normalized === "verified" || normalized === "verified_business") return "verified";
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
