import type { Json, Tables } from "@/integrations/supabase/types";
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

const PUBLIC_LISTING_DETAIL_BASE_FIELDS = [
  "id",
  "slug",
  "name",
  "short_description",
  "description",
  "featured_image_url",
  "price_from",
  "price_to",
  "price_currency",
  "tier",
  "is_curated",
  "status",
  "city_id",
  "region_id",
  "category_id",
  "latitude",
  "longitude",
  "address",
  "google_rating",
  "google_review_count",
  "tags",
  "published_at",
  "created_at",
  "updated_at",
  "claim_status",
  "claimed_at",
] as const;

const PUBLIC_LISTING_DETAIL_CONTACT_FIELDS = [
  "contact_phone",
  "contact_email",
  "website_url",
  "google_business_url",
] as const;

const PUBLIC_LISTING_DETAIL_SOCIAL_FIELDS = [
  "facebook_url",
  "instagram_url",
  "twitter_url",
  "linkedin_url",
  "youtube_url",
  "tiktok_url",
] as const;

const PUBLIC_LISTING_DETAIL_DIRECT_FIELDS = [
  "telegram_url",
  "whatsapp_number",
] as const;

const PUBLIC_DETAIL_ALWAYS_DENIED_KEYS = new Set([
  "admin_notes",
  "category_data",
  "claim_verified_at",
  "claim_verification_method",
  "created_by",
  "internal_notes",
  "moderated_by",
  "owner",
  "owner_email",
  "owner_id",
  "rejection_notes",
  "rejection_reason",
  "review_status",
  "source_url",
  "service_role",
  "status_history",
  "updated_by",
  "user_id",
  "view_count",
]);

const PUBLIC_DETAIL_CONTACT_DENIED_KEYS = new Set([
  "contact_email",
  "contact_phone",
  "email",
  "google_business_url",
  "phone",
  "website",
  "website_url",
  "agent_email",
  "agent_phone",
]);

const PUBLIC_DETAIL_SOCIAL_DENIED_KEYS = new Set([
  "facebook",
  "facebook_url",
  "instagram",
  "instagram_url",
  "linkedin",
  "linkedin_url",
  "social_url",
  "social_urls",
  "tiktok",
  "tiktok_url",
  "twitter",
  "twitter_url",
  "youtube",
  "youtube_url",
]);

const PUBLIC_DETAIL_DIRECT_DENIED_KEYS = new Set([
  "telegram",
  "telegram_url",
  "whatsapp",
  "whatsapp_number",
  "whatsapp_url",
]);

const PUBLIC_DETAIL_CTA_DENIED_KEYS = new Set([
  "booking_url",
  "booking_link",
  "reservation_url",
]);

export const PUBLIC_LISTING_SUMMARY_EXCLUDED_FIELDS = [
  "address",
  "category_data",
  "view_count",
  ...TIER_GATED_INTERNAL_FIELDS,
  ...TIER_GATED_CONTACT_FIELDS,
  ...TIER_GATED_SOCIAL_FIELDS,
  ...TIER_GATED_DIRECT_FIELDS,
] as const;

type PublicListingCity = Pick<
  Tables<"cities">,
  "id" | "name" | "slug" | "short_description" | "image_url" | "latitude" | "longitude"
>;

type PublicListingRegion = Pick<
  Tables<"regions">,
  "id" | "name" | "slug" | "short_description" | "image_url"
>;

type PublicListingCategory = Pick<
  Tables<"categories">,
  "id" | "name" | "slug" | "icon" | "short_description" | "image_url"
>;

type PublicListingImage = Pick<
  Tables<"listing_images">,
  "id" | "image_url" | "alt_text" | "display_order" | "is_featured"
>;

export type PublicListingDetailPayload = Pick<
  Tables<"listings">,
  (typeof PUBLIC_LISTING_DETAIL_BASE_FIELDS)[number]
> &
  Partial<Pick<Tables<"listings">, (typeof PUBLIC_LISTING_DETAIL_CONTACT_FIELDS)[number]>> &
  Partial<Pick<Tables<"listings">, (typeof PUBLIC_LISTING_DETAIL_SOCIAL_FIELDS)[number]>> &
  Partial<Pick<Tables<"listings">, (typeof PUBLIC_LISTING_DETAIL_DIRECT_FIELDS)[number]>> & {
    city?: PublicListingCity | null;
    region?: PublicListingRegion | null;
    category?: PublicListingCategory | null;
    images?: PublicListingImage[] | null;
    details?: Json | null;
  };

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

function normalizePayloadKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function isDeniedPublicDetailKey(key: string, rules: ReturnType<typeof getListingTierRules>): boolean {
  const normalizedKey = normalizePayloadKey(key);

  if (PUBLIC_DETAIL_ALWAYS_DENIED_KEYS.has(normalizedKey)) return true;
  if (!rules.allowPublicContactFields && PUBLIC_DETAIL_CONTACT_DENIED_KEYS.has(normalizedKey)) return true;
  if (!rules.allowPublicSocialLinks && PUBLIC_DETAIL_SOCIAL_DENIED_KEYS.has(normalizedKey)) return true;
  if (!rules.allowDirectContactButton && PUBLIC_DETAIL_DIRECT_DENIED_KEYS.has(normalizedKey)) return true;
  if (!rules.allowCtaButton && PUBLIC_DETAIL_CTA_DENIED_KEYS.has(normalizedKey)) return true;

  return false;
}

function isOptionalPublicDetailKey(key: string): boolean {
  const normalizedKey = normalizePayloadKey(key);
  return (
    PUBLIC_DETAIL_CONTACT_DENIED_KEYS.has(normalizedKey) ||
    PUBLIC_DETAIL_SOCIAL_DENIED_KEYS.has(normalizedKey) ||
    PUBLIC_DETAIL_DIRECT_DENIED_KEYS.has(normalizedKey) ||
    PUBLIC_DETAIL_CTA_DENIED_KEYS.has(normalizedKey)
  );
}

function sanitizePublicDetailValue(value: unknown, rules: ReturnType<typeof getListingTierRules>): Json | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizePublicDetailValue(item, rules))
      .filter((item): item is Json => item !== undefined);
  }
  if (typeof value !== "object") return undefined;

  const sanitized: Record<string, Json> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (isDeniedPublicDetailKey(key, rules)) continue;
    if (isOptionalPublicDetailKey(key) && (nestedValue === undefined || nestedValue === null)) continue;
    if (isOptionalPublicDetailKey(key) && typeof nestedValue === "string" && nestedValue.trim().length === 0) continue;
    const safeValue = sanitizePublicDetailValue(nestedValue, rules);
    if (safeValue !== undefined) sanitized[key] = safeValue;
  }

  return sanitized;
}

function copyDefinedFields(
  source: Record<string, unknown>,
  fields: readonly string[],
  target: Record<string, unknown>,
) {
  for (const field of fields) {
    if (source[field] !== undefined) {
      target[field] = source[field];
    }
  }
}

function copyPopulatedFields(
  source: Record<string, unknown>,
  fields: readonly string[],
  target: Record<string, unknown>,
) {
  for (const field of fields) {
    const value = source[field];
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim().length === 0) continue;
    target[field] = value;
  }
}

function pickPublicRelation(value: unknown, fields: readonly string[]): Record<string, unknown> | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;

  const source = value as Record<string, unknown>;
  const relation: Record<string, unknown> = {};
  copyDefinedFields(source, fields, relation);
  return relation;
}

function pickPublicImages(value: unknown): PublicListingImage[] | null | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;

  return value
    .map((image) =>
      pickPublicRelation(image, ["id", "image_url", "alt_text", "display_order", "is_featured"]),
    )
    .filter((image): image is PublicListingImage => Boolean(image?.id && image.image_url));
}

export function toPublicListingDetailPayload<T extends object>(listing: T): PublicListingDetailPayload {
  const source = listing as Record<string, unknown>;
  const tierRules = getListingTierRules(typeof source.tier === "string" ? source.tier : null);
  const payload: Record<string, unknown> = {};

  copyDefinedFields(source, PUBLIC_LISTING_DETAIL_BASE_FIELDS, payload);

  const city = pickPublicRelation(source.city, [
    "id",
    "name",
    "slug",
    "short_description",
    "image_url",
    "latitude",
    "longitude",
  ]);
  if (city !== undefined) payload.city = city;

  const region = pickPublicRelation(source.region, ["id", "name", "slug", "short_description", "image_url"]);
  if (region !== undefined) payload.region = region;

  const category = pickPublicRelation(source.category, [
    "id",
    "name",
    "slug",
    "icon",
    "short_description",
    "image_url",
  ]);
  if (category !== undefined) payload.category = category;

  const images = pickPublicImages(source.images);
  if (images !== undefined) payload.images = images;

  const details = sanitizePublicDetailValue(source.category_data, tierRules);
  if (details !== undefined) payload.details = details;

  if (tierRules.allowPublicContactFields) {
    copyPopulatedFields(source, PUBLIC_LISTING_DETAIL_CONTACT_FIELDS, payload);
  }

  if (tierRules.allowPublicSocialLinks) {
    copyPopulatedFields(source, PUBLIC_LISTING_DETAIL_SOCIAL_FIELDS, payload);
  }

  if (tierRules.allowDirectContactButton) {
    copyPopulatedFields(source, PUBLIC_LISTING_DETAIL_DIRECT_FIELDS, payload);
  }

  return payload as PublicListingDetailPayload;
}
