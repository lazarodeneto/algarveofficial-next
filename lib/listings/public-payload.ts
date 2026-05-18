import { getListingTierRules } from "@/lib/listingTierRules";

export const PUBLIC_LISTING_SUMMARY_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  price_from,
  price_to,
  price_currency,
  tier,
  is_curated,
  status,
  city_id,
  region_id,
  category_id,
  latitude,
  longitude,
  google_rating,
  google_review_count,
  tags,
  published_at,
  created_at,
  updated_at,
  featured_rank
`;

const TIER_GATED_CONTACT_FIELDS = [
  "contact_phone",
  "contact_email",
  "website_url",
  "google_business_url",
] as const;

const TIER_GATED_SOCIAL_FIELDS = [
  "facebook_url",
  "instagram_url",
  "twitter_url",
  "linkedin_url",
  "youtube_url",
  "tiktok_url",
] as const;

const TIER_GATED_DIRECT_FIELDS = [
  "telegram_url",
  "whatsapp_number",
] as const;

const TIER_GATED_INTERNAL_FIELDS = [
  "owner_id",
] as const;

export const PUBLIC_LISTING_SUMMARY_EXCLUDED_FIELDS = [
  "address",
  "category_data",
  "view_count",
  ...TIER_GATED_INTERNAL_FIELDS,
  ...TIER_GATED_CONTACT_FIELDS,
  ...TIER_GATED_SOCIAL_FIELDS,
  ...TIER_GATED_DIRECT_FIELDS,
] as const;

export function maskTierGatedListingFields<T extends object>(listing: T): T {
  const source = listing as Record<string, unknown>;
  const tierRules = getListingTierRules(typeof source.tier === "string" ? source.tier : null);
  const next: Record<string, unknown> = { ...source };

  if (!tierRules.allowPublicContactFields) {
    TIER_GATED_CONTACT_FIELDS.forEach((field) => {
      if (field in next) next[field] = null;
    });
  }

  if (!tierRules.allowPublicSocialLinks) {
    TIER_GATED_SOCIAL_FIELDS.forEach((field) => {
      if (field in next) next[field] = null;
    });
  }

  if (!tierRules.allowDirectContactButton) {
    TIER_GATED_DIRECT_FIELDS.forEach((field) => {
      if (field in next) next[field] = null;
    });
  }

  if (!tierRules.allowPublicContactFields) {
    TIER_GATED_INTERNAL_FIELDS.forEach((field) => {
      if (field in next) next[field] = null;
    });
  }

  return next as T;
}
