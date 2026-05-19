import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { withTimeout } from "@/lib/supabase/db-utils";
import { buildBreadcrumbSchema, buildFAQSchema, buildLocalBusinessSchema } from "@/lib/seo/advanced/schema-builders";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import {
  buildAbsoluteRouteUrl,
  buildLocalizedPath,
  buildStaticRouteData,
  buildLocaleSwitchPathsForEntity,
  buildUniformLocalizedSlugMap,
  buildLocalizedSlugMapWithFallback,
  type ListingRouteData,
} from "@/lib/i18n/localized-routing";
import {
  ALL_CANONICAL_SLUGS,
  getCategoryUrlSlug,
  type CanonicalCategorySlug as ProgrammaticCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import type { ListingReview } from "@/hooks/useListingReviews";
import {
  ListingDetailClient,
  type NearbyBusinessListing,
  type ListingTranslationRow,
  type ListingWithRelations,
  type RelatedListing,
  type WhatsAppStatus,
  type OtherRegion,
} from "@/components/listing/ListingDetailClient";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { buildCategoryRouteData as buildPublicCategoryRouteData } from "@/lib/public-route-builders";
import { getAllowedListingGalleryImageInputs } from "@/lib/listings/gallery-images";
import { publicListingTranslationOrNull } from "@/lib/listings/publicListingTranslations";
import { resolveBeachDetails, shouldUseBeachBaseContent } from "@/lib/listings/verifiedBeachContent";
import {
  toPublicListingDetailPayload,
  type PublicListingDetailPayload,
} from "@/lib/listings/public-payload";
import { getListingTierRules } from "@/lib/listingTierRules";
import type { Json } from "@/integrations/supabase/types";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";

const PUBLIC_LISTING_CORE_FIELDS = `
  id, slug, name, short_description, description, featured_image_url,
  price_from, price_to, price_currency, tier, is_curated, status,
  city_id, region_id, category_id, owner_id, latitude, longitude,
  address, contact_phone, contact_email, website_url, facebook_url,
  instagram_url, twitter_url, linkedin_url, youtube_url, tiktok_url,
  telegram_url, whatsapp_number, google_business_url, google_rating, google_review_count,
  tags, category_data, published_at, created_at, updated_at
`;
const PUBLIC_LISTING_CLAIM_FIELDS = `
  claim_status, claimed_at, claim_verified_at, claim_verification_method
`;
const PUBLIC_LISTING_FIELDS = `
  ${PUBLIC_LISTING_CORE_FIELDS},
  ${PUBLIC_LISTING_CLAIM_FIELDS}
`;

const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";
const LISTING_REVIEW_FIELDS = `
  id, listing_id, user_id, rating, comment, status, rejection_reason,
  created_at, updated_at, approved_at, moderated_at, moderated_by
`;
const RELATED_LISTING_FIELDS = `
  id, slug, name, featured_image_url,
  city:cities(id, name)
`;
const NEARBY_BUSINESS_LISTING_FIELDS = `
  id, slug, name, short_description, featured_image_url, updated_at,
  latitude, longitude,
  city:cities(id, name),
  category:categories(id, name, slug)
`;
const NEARBY_BUSINESS_RADIUS_KM = 8;
const NEARBY_BUSINESS_LIMIT = 12;
const NEARBY_BUSINESS_CANDIDATE_LIMIT = 80;
const NEARBY_BUSINESS_LOCATION_STOPWORDS = new Set([
  "algarve",
  "beach",
  "portugal",
  "praia",
]);
const BEACH_NEARBY_RESOURCE_KEYS = [
  "nearby_beaches",
  "nearby_beach_list",
  "nearby_restaurants",
  "restaurants_nearby",
  "nearby_attractions",
  "attractions_nearby",
] as const;

type ListingReviewRow = ListingReview & {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

function applyPublicGalleryImageLimit(listing: ListingWithRelations): ListingWithRelations {
  return {
    ...listing,
    images: getAllowedListingGalleryImageInputs({
      featuredImageUrl: listing.featured_image_url,
      galleryImages: listing.images ?? [],
      fallbackImageUrl: listing.category?.image_url,
      listingName: listing.name,
      tier: listing.tier,
    }),
  };
}

interface ListingPageData {
  listing: PublicListingDetailPayload;
  translations: Record<Locale, ListingTranslationRow | null>;
  reviews: ListingReviewRow[];
  relatedListings: RelatedListing[];
  nearbyBusinessListings: NearbyBusinessListing[];
  whatsappStatus: WhatsAppStatus;
  canonicalSlug: string;
  localizedSlugs: Partial<Record<Locale, string>>;
  otherRegions: OtherRegion[];
}

interface ListingPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncateMeta(value?: string | null, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function asJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !["[", "{"].includes(trimmed[0])) return value;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function stringFromJson(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

const LOCALE_KEY_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

function buildLocaleCandidates(locale: Locale): string[] {
  const normalized = locale.trim().toLowerCase();
  const [language] = normalized.split("-");
  return Array.from(new Set([normalized, language, DEFAULT_LOCALE, "en"].filter(Boolean)));
}

function resolveLocalizedCategoryData(
  categoryData: unknown,
  locale: Locale,
  options?: { isBeachListing?: boolean },
): Record<string, unknown> {
  if (options?.isBeachListing) {
    return resolveBeachDetails(categoryData, locale);
  }

  const base = asJsonRecord(parseJsonValue(categoryData));
  const localizedSource = base.localized_content ?? base.localizedContent ?? base.i18n_content ?? base.translations;
  const localizedRecord = asJsonRecord(parseJsonValue(localizedSource));
  const localizedKeys = Object.keys(localizedRecord);

  if (localizedKeys.length === 0 || !localizedKeys.every((key) => LOCALE_KEY_PATTERN.test(key))) {
    return base;
  }

  for (const candidate of buildLocaleCandidates(locale)) {
    const localizedValue = asJsonRecord(parseJsonValue(localizedRecord[candidate]));
    if (Object.keys(localizedValue).length > 0) {
      return { ...base, ...localizedValue };
    }
  }

  return base;
}

function readFaqItemsFromCategoryData(
  categoryData: unknown,
  locale: Locale,
  options?: { isBeachListing?: boolean },
): Array<{ question: string; answer: string }> {
  const details = resolveLocalizedCategoryData(categoryData, locale, options);
  const parsed = parseJsonValue(details.faq_items ?? details.faqs ?? details.faq);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      const row = asJsonRecord(item);
      const question = stringFromJson(row.question ?? row.q);
      const answer = stringFromJson(row.answer ?? row.a);
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is { question: string; answer: string } => item !== null);
}

function internalListingSlugFromPath(value: unknown): string | null {
  const raw = stringFromJson(value);
  if (!raw) return null;

  const internalPath = raw.startsWith("http")
    ? (() => {
        try {
          const url = new URL(raw);
          if (!["algarveofficial.com", "www.algarveofficial.com"].includes(url.hostname)) {
            return null;
          }
          return url.pathname;
        } catch {
          return null;
        }
      })()
    : raw;

  const match = internalPath?.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?listing\/([^/?#]+)\/?$/i);
  return match?.[1] ?? null;
}

function internalListingSlugFromNearbyResource(value: unknown): string | null {
  const row = asJsonRecord(value);
  return (
    internalListingSlugFromPath(row.href) ??
    internalListingSlugFromPath(row.internal_href) ??
    internalListingSlugFromPath(row.internalHref) ??
    internalListingSlugFromPath(row.url) ??
    stringFromJson(row.internal_slug ?? row.internalSlug ?? row.listing_slug ?? row.listingSlug ?? row.slug) ??
    null
  );
}

function collectNearbyResourceSlugsFromContainer(container: Record<string, unknown>, slugs: Set<string>) {
  for (const key of BEACH_NEARBY_RESOURCE_KEYS) {
    const value = parseJsonValue(container[key]);
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      const slug = internalListingSlugFromNearbyResource(item);
      if (slug) slugs.add(slug);
    }
  }

  const localizedSource = container.localized_content ?? container.localizedContent ?? container.i18n_content ?? container.translations;
  const localizedRecord = asJsonRecord(parseJsonValue(localizedSource));
  for (const localizedValue of Object.values(localizedRecord)) {
    collectNearbyResourceSlugsFromContainer(asJsonRecord(parseJsonValue(localizedValue)), slugs);
  }
}

function collectNearbyResourceSlugs(categoryData: unknown): string[] {
  const slugs = new Set<string>();
  collectNearbyResourceSlugsFromContainer(asJsonRecord(parseJsonValue(categoryData)), slugs);
  return Array.from(slugs);
}

function sanitizeNearbyResourceArray(value: unknown, publishedSlugs: Map<string, string>) {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return value;

  return parsed
    .map((item) => {
      const row = asJsonRecord(item);
      const slug = internalListingSlugFromNearbyResource(row);
      const canonicalSlug = slug ? publishedSlugs.get(slug) : null;
      if (!canonicalSlug) return null;

      const {
        url: _url,
        website_url: _websiteUrl,
        websiteUrl: _websiteUrlCamel,
        google_maps_url: _googleMapsUrl,
        googleMapsUrl: _googleMapsUrlCamel,
        ...safeRow
      } = row;

      return {
        ...safeRow,
        href: `/listing/${canonicalSlug}`,
      };
    })
    .filter((item): item is Record<string, unknown> & { href: string } => item !== null);
}

function sanitizeNearbyResourceContainer(
  container: Record<string, unknown>,
  publishedSlugs: Map<string, string>,
): Record<string, unknown> {
  const sanitized = { ...container };

  for (const key of BEACH_NEARBY_RESOURCE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      sanitized[key] = sanitizeNearbyResourceArray(sanitized[key], publishedSlugs);
    }
  }

  const localizedKey = ["localized_content", "localizedContent", "i18n_content", "translations"].find((key) =>
    Object.prototype.hasOwnProperty.call(sanitized, key),
  );
  if (localizedKey) {
    const localizedRecord = asJsonRecord(parseJsonValue(sanitized[localizedKey]));
    sanitized[localizedKey] = Object.fromEntries(
      Object.entries(localizedRecord).map(([localeKey, localizedValue]) => [
        localeKey,
        sanitizeNearbyResourceContainer(asJsonRecord(parseJsonValue(localizedValue)), publishedSlugs),
      ]),
    );
  }

  return sanitized;
}

async function sanitizeBeachNearbyResourceLinks(listing: ListingWithRelations): Promise<ListingWithRelations> {
  if (getCanonicalCategorySlug(listing.category?.slug) !== "beaches") {
    return listing;
  }

  const slugs = collectNearbyResourceSlugs(listing.category_data);
  if (slugs.length === 0) return listing;

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("slug")
    .eq("status", "published")
    .in("slug", slugs);

  if (error) return listing;

  const publishedSlugs = new Map((data ?? []).map((row) => [row.slug as string, row.slug as string]));
  const sanitizedCategoryData = sanitizeNearbyResourceContainer(
    asJsonRecord(parseJsonValue(listing.category_data)),
    publishedSlugs,
  );

  return {
    ...listing,
    category_data: sanitizedCategoryData as unknown as Json,
  };
}

function getLocalizedValue(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function getLocalizedRequiredValue(
  value: string | null | undefined,
  fallback: string,
  hasTranslation: boolean,
): string {
  const localized = getLocalizedValue(value);
  if (localized) return localized;
  return hasTranslation ? "" : fallback;
}

function getLocalizedOptionalValue(
  value: string | null | undefined,
  fallback?: string | null,
  hasTranslation = false,
): string | null {
  const localized = getLocalizedValue(value);
  if (localized) return localized;
  return hasTranslation ? null : (fallback ?? null);
}

function isMissingClaimColumnError(error: unknown): boolean {
  const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string } | null;
  if (supabaseError?.code !== "42703") return false;

  const text = [
    supabaseError.message,
    supabaseError.details,
    supabaseError.hint,
  ]
    .filter(Boolean)
    .join(" ");

  return /claim_status|claimed_at|claim_verified_at|claim_verification_method/i.test(text) || text.length === 0;
}

function buildListingDescription({
  translation,
  listing,
}: {
  translation: ListingTranslationRow | null;
  listing: PublicListingDetailPayload;
}) {
  const hasTranslation = Boolean(translation);
  return (
    truncateMeta(getLocalizedOptionalValue(translation?.seo_description, null, hasTranslation)) ||
    truncateMeta(getLocalizedOptionalValue(translation?.description, null, hasTranslation)) ||
    truncateMeta(hasTranslation ? null : listing.description) ||
    truncateMeta(hasTranslation ? null : listing.short_description) ||
    "Discover this curated Algarve listing on AlgarveOfficial."
  );
}

function buildListingRouteData(data: ListingPageData): ListingRouteData {
  return {
    routeType: "listing",
    id: data.listing.id,
    slugs: buildLocalizedSlugMapWithFallback(data.localizedSlugs, data.canonicalSlug),
  };
}

async function fetchApprovedReviews(listingId: string) {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("listing_reviews")
    .select(LISTING_REVIEW_FIELDS)
    .eq("listing_id", listingId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviews = ((data ?? []) as ListingReviewRow[]) ?? [];
  const userIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));

  if (userIds.length === 0) return reviews;

  const { data: profiles, error: profilesError } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id as string,
      {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
    ]),
  );

  return reviews.map((review) => ({
    ...review,
    profile: profileMap.get(review.user_id) ?? null,
  }));
}

async function fetchAllTranslations(listingId: string) {
  const supabase = createPublicServerClient();

  const { data: allTranslations, error } = await supabase
    .from("listing_translations")
    .select("language_code, title, short_description, description, seo_title, seo_description, translation_status, translation_source, updated_at")
    .eq("listing_id", listingId);

  if (error) throw error;

  const translations: Record<Locale, ListingTranslationRow | null> = {} as Record<
    Locale,
    ListingTranslationRow | null
  >;

  for (const locale of SUPPORTED_LOCALES) {
    const dbLocale = locale === "en" ? "en" : locale;
    const found = (allTranslations ?? []).find((t) => t.language_code === dbLocale);
    translations[locale] = publicListingTranslationOrNull(found as ListingTranslationRow | null);
  }

  return translations;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function distanceKmBetween({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}: {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
}) {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = toRadians(fromLatitude);
  const toLatitudeRadians = toRadians(toLatitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function coordinateBounds(latitude: number, longitude: number, radiusKm: number) {
  const latitudeDelta = radiusKm / 111;
  const longitudeDelta = radiusKm / Math.max(1, Math.abs(111 * Math.cos(latitude * (Math.PI / 180))));

  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
  };
}

function locationTokensFromText(value: string | null | undefined): string[] {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !NEARBY_BUSINESS_LOCATION_STOPWORDS.has(token));
}

function buildListingLocationTokens(listing: ListingWithRelations): Set<string> {
  return new Set([
    ...locationTokensFromText(listing.city?.name),
    ...locationTokensFromText(listing.address),
  ]);
}

function hasNearbyLocationTokenOverlap(tokens: Set<string>, candidate: NearbyBusinessCandidate): boolean {
  if (tokens.size === 0) return true;

  const candidateTokens = new Set([
    ...locationTokensFromText(candidate.city?.name),
    ...locationTokensFromText(candidate.slug),
    ...locationTokensFromText(candidate.short_description),
  ]);

  return Array.from(tokens).some((token) => candidateTokens.has(token));
}

type NearbyBusinessCandidate = Omit<NearbyBusinessListing, "distance_km"> & {
  latitude: number | null;
  longitude: number | null;
};

async function fetchNearbyBusinessListings(listing: ListingWithRelations): Promise<NearbyBusinessListing[]> {
  if (getCanonicalCategorySlug(listing.category?.slug) !== "beaches") {
    return [];
  }

  const listingLatitude = finiteNumber(listing.latitude);
  const listingLongitude = finiteNumber(listing.longitude);
  if (listingLatitude === null || listingLongitude === null) {
    return [];
  }

  const bounds = coordinateBounds(listingLatitude, listingLongitude, NEARBY_BUSINESS_RADIUS_KM);
  const supabase = createPublicServerClient();
  let query = supabase
    .from("listings")
    .select(NEARBY_BUSINESS_LISTING_FIELDS)
    .eq("status", "published")
    .neq("id", listing.id)
    .gte("latitude", bounds.minLatitude)
    .lte("latitude", bounds.maxLatitude)
    .gte("longitude", bounds.minLongitude)
    .lte("longitude", bounds.maxLongitude)
    .limit(NEARBY_BUSINESS_CANDIDATE_LIMIT);

  if (listing.category_id) {
    query = query.neq("category_id", listing.category_id);
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }

  const deduped = new Map<string, NearbyBusinessListing>();
  const locationTokens = buildListingLocationTokens(listing);

  for (const row of (data ?? []) as unknown as NearbyBusinessCandidate[]) {
    if (!row.slug) continue;
    if (getCanonicalCategorySlug(row.category?.slug) === "beaches") continue;
    if (!hasNearbyLocationTokenOverlap(locationTokens, row)) continue;

    const businessLatitude = finiteNumber(row.latitude);
    const businessLongitude = finiteNumber(row.longitude);
    if (businessLatitude === null || businessLongitude === null) continue;

    const distanceKm = distanceKmBetween({
      fromLatitude: listingLatitude,
      fromLongitude: listingLongitude,
      toLatitude: businessLatitude,
      toLongitude: businessLongitude,
    });
    if (distanceKm > NEARBY_BUSINESS_RADIUS_KM) continue;

    const business: NearbyBusinessListing = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      short_description: row.short_description,
      featured_image_url: row.featured_image_url,
      updated_at: row.updated_at,
      city: row.city ?? null,
      category: row.category ?? null,
      distance_km: Math.round(distanceKm * 10) / 10,
    };
    const dedupeKey = `${business.name.trim().toLowerCase()}|${business.category?.slug ?? ""}`;
    const existing = deduped.get(dedupeKey);
    if (!existing || (business.distance_km ?? Infinity) < (existing.distance_km ?? Infinity)) {
      deduped.set(dedupeKey, business);
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
    .slice(0, NEARBY_BUSINESS_LIMIT);
}

async function fetchLocalizedSlugs(listingId: string) {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("listing_slugs")
    .select("slug, is_current")
    .eq("listing_id", listingId);

  if (error) return {};

  const slugs: Partial<Record<Locale, string>> = {};
  const currentSlug = (data ?? []).find((row) => row.is_current)?.slug;

  if (currentSlug) {
    slugs[DEFAULT_LOCALE] = currentSlug;
  }

  return slugs;
}

const getListingPageData = cache(async (locale: Locale, idOrSlug: string): Promise<ListingPageData | null> => {
  const supabase = createPublicServerClient();
  const isParamUuid = isUuid(idOrSlug);

  let resolvedListingId: string | null = isParamUuid ? idOrSlug : null;

  if (!isParamUuid) {
    const { data: slugRow, error: slugError } = await supabase
      .from("listing_slugs")
      .select("listing_id, slug, is_current")
      .eq("slug", idOrSlug)
      .maybeSingle();

    if (slugError) throw slugError;
    resolvedListingId = slugRow?.listing_id ?? null;
  }

  const runListingQuery = async (fields: string) => {
    let listingQuery = supabase.from("listings").select(`
        ${fields},
        city:cities(${PUBLIC_CITY_FIELDS}),
        region:regions(${PUBLIC_REGION_FIELDS}),
        category:categories(${PUBLIC_CATEGORY_FIELDS}),
        images:listing_images(id, image_url, alt_text, display_order, is_featured)
      `);

    listingQuery = resolvedListingId
      ? listingQuery.eq("id", resolvedListingId)
      : listingQuery.eq("slug", idOrSlug);

    return (await withTimeout(
      listingQuery.maybeSingle() as unknown as Promise<{
        data: ListingWithRelations | null;
        error: { code?: string; message: string; details?: string; hint?: string } | null;
      }>,
      15000,
      { data: null, error: null },
    )) ?? { data: null, error: null };
  };

  let listingResult = await runListingQuery(PUBLIC_LISTING_FIELDS);

  if (listingResult.error && isMissingClaimColumnError(listingResult.error)) {
    listingResult = await runListingQuery(PUBLIC_LISTING_CORE_FIELDS);
  }

  if (listingResult.error) throw listingResult.error;

  const listing = listingResult.data ?? null;
  if (!listing || listing.status !== "published") return null;

  const publicListing = toPublicListingDetailPayload(
    await sanitizeBeachNearbyResourceLinks(applyPublicGalleryImageLimit(listing)),
  );
  const canonicalSlug = publicListing.slug ?? publicListing.id;
  const tierRules = getListingTierRules(listing.tier);
  const isVerifiedBeachListing =
    getCanonicalCategorySlug(listing.category?.slug) === "beaches" &&
    shouldUseBeachBaseContent(publicListing.details);

  const settledResults =
    (await withTimeout(
      Promise.all([
        fetchApprovedReviews(listing.id),
        fetchAllTranslations(listing.id),
        fetchLocalizedSlugs(listing.id),
        listing.category_id
          ? supabase
              .from("listings")
              .select(RELATED_LISTING_FIELDS)
              .eq("status", "published")
              .eq("category_id", listing.category_id)
              .neq("id", listing.id)
              .order("created_at", { ascending: false })
              .limit(3)
          : Promise.resolve({ data: [], error: null }),
        tierRules.allowDirectContactButton && listing.owner_id
          ? supabase
              .from("whatsapp_accounts")
              .select("wa_enabled, business_phone_e164")
              .eq("owner_id", listing.owner_id)
              .eq("wa_enabled", true)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("regions")
          .select("id, slug, name, short_description, image_url, hero_image_url")
          .eq("is_active", true)
          .eq("is_visible_destinations", true)
          .order("display_order", { ascending: true })
          .limit(8),
        fetchNearbyBusinessListings(listing),
      ]),
      20000,
      null,
    )) ?? [null, {}, {}, { data: [], error: null }, { data: null, error: null }, { data: [], error: null }, []];

  const [reviews, rawTranslations, localizedSlugs, relatedResponse, whatsappResponse, regionsResponse, nearbyBusinessListings] = settledResults as [
    ListingReviewRow[],
    Record<Locale, ListingTranslationRow | null>,
    Partial<Record<Locale, string>>,
    { data: RelatedListing[] | null; error: { message: string } | null },
    { data: { wa_enabled?: boolean | null; business_phone_e164?: string | null } | null; error: { message: string } | null },
    { data: OtherRegion[] | null; error: { message: string } | null },
    NearbyBusinessListing[],
  ];

  if (relatedResponse.error) throw relatedResponse.error;
  if (whatsappResponse.error) throw whatsappResponse.error;

  const translations = isVerifiedBeachListing
    ? Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, null])) as Record<Locale, ListingTranslationRow | null>
    : rawTranslations;

  return {
    listing: publicListing,
    translations,
    reviews: reviews ?? [],
    relatedListings: relatedResponse.data ?? [],
    nearbyBusinessListings: nearbyBusinessListings ?? [],
    whatsappStatus: {
      enabled: !!whatsappResponse.data,
      phone: whatsappResponse.data?.business_phone_e164 ?? null,
    },
    canonicalSlug,
    localizedSlugs,
    otherRegions: regionsResponse.data ?? [],
  };
});

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getListingPageData(resolvedLocale, id);

  if (!data) {
    return buildPageMetadata({
      title: "Listing Not Found",
      description: "This Algarve listing is no longer available.",
      localizedPath: `/listing/${id}`,
      locale: resolvedLocale,
      noIndex: true,
      noFollow: true,
    });
  }

  if (id.trim() !== data.canonicalSlug) {
    permanentRedirect(buildLocalizedPath(resolvedLocale, `/listing/${data.canonicalSlug}`));
  }

  const { listing, translations } = data;
  const currentTranslation = translations[resolvedLocale];
  const title = getLocalizedRequiredValue(
    currentTranslation?.seo_title ?? currentTranslation?.title,
    listing.name,
    Boolean(currentTranslation),
  );
  const description = buildListingDescription({ listing, translation: currentTranslation });
  const ogImage =
    (normalizePublicImageUrl(listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(listing.featured_image_url)) ?? "/og-image.png";
  const routeData = buildListingRouteData(data);

  return buildPageMetadata({
    title,
    description,
    localizedRoute: routeData,
    image: ogImage,
    type: "place",
    locale: resolvedLocale,
  });
}

export default async function LocaleListingPage({ params }: ListingPageProps) {
  const { locale, id } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getListingPageData(resolvedLocale, id);

  if (!data) notFound();

  if (id.trim() !== data.canonicalSlug) {
    permanentRedirect(buildLocalizedPath(resolvedLocale, `/listing/${data.canonicalSlug}`));
  }

  const currentTranslation = data.translations[resolvedLocale];
  const title = getLocalizedRequiredValue(
    currentTranslation?.title,
    data.listing.name,
    Boolean(currentTranslation),
  );
  const categoryName = data.listing.category?.name ?? "Directory";
  const categorySlug = getCanonicalCategorySlug(data.listing.category?.slug);
  const isBeachListing = categorySlug === "beaches";
  const programmaticCategorySlug = ALL_CANONICAL_SLUGS.includes(categorySlug as ProgrammaticCategorySlug)
    ? (categorySlug as ProgrammaticCategorySlug)
    : null;
  const citySlug = data.listing.city?.slug?.trim() ?? null;
  const routeData = buildListingRouteData(data);
  const canonicalUrl = buildAbsoluteRouteUrl(resolvedLocale, routeData);
  const listingPathByLocale = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);
  const homeUrl = buildAbsoluteRouteUrl(resolvedLocale, buildStaticRouteData("home"));
  const categoryRouteData = buildPublicCategoryRouteData(categorySlug);
  const categoryUrl = buildAbsoluteRouteUrl(
    resolvedLocale,
    categoryRouteData ?? buildStaticRouteData("stay"),
  );
  const cityRouteData = citySlug
    ? {
        routeType: "city" as const,
        citySlugs: buildUniformLocalizedSlugMap(citySlug),
      }
    : null;
  const cityCategoryRouteData =
    citySlug && programmaticCategorySlug
      ? {
          routeType: "city-category" as const,
          citySlugs: buildUniformLocalizedSlugMap(citySlug),
          categorySlugs: Object.fromEntries(
            SUPPORTED_LOCALES.map((locale) => [
              locale,
              getCategoryUrlSlug(programmaticCategorySlug, locale),
            ]),
          ) as Record<Locale, string>,
        }
      : null;
  const cityUrl = cityRouteData
    ? buildAbsoluteRouteUrl(resolvedLocale, cityRouteData)
    : null;
  const cityCategoryUrl = cityCategoryRouteData
    ? buildAbsoluteRouteUrl(resolvedLocale, cityCategoryRouteData)
    : null;
  const ogImage =
    (normalizePublicImageUrl(data.listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(data.listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(data.listing.featured_image_url)) ?? "/og-image.png";

   
  const businessSchema = buildLocalBusinessSchema({
    id: data.listing.id,
    slug: routeData.slugs[resolvedLocale],
    url: canonicalUrl,
    name: title,
    description:
      truncateMeta(
        getLocalizedOptionalValue(
          currentTranslation?.description,
          data.listing.description,
          Boolean(currentTranslation),
        ),
      ) ?? undefined,
    image_url: absoluteUrl(String(ogImage)),
    category_slug: data.listing.category?.slug ?? "",
    category_name: data.listing.category?.name ?? undefined,
    city: data.listing.city?.name ?? undefined,
    region: data.listing.region?.name ?? undefined,
    address: data.listing.address ?? undefined,
    latitude: (data.listing.latitude || data.listing.city?.latitude) ?? undefined,
    longitude: (data.listing.longitude || data.listing.city?.longitude) ?? undefined,
    telephone: data.listing.contact_phone ?? undefined,
    email: data.listing.contact_email ?? undefined,
    website: isBeachListing ? undefined : (data.listing.website_url ?? undefined),
    price_range: data.listing.price_from
      ? `€${data.listing.price_from}${data.listing.price_to ? ` - €${data.listing.price_to}` : "+"}`
      : undefined,
    google_rating: data.listing.google_rating ?? undefined,
    google_review_count: data.listing.google_review_count ?? undefined,
    tags: data.listing.tags ?? undefined,
  } as Parameters<typeof buildLocalBusinessSchema>[0]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: homeUrl },
    ...(cityUrl && data.listing.city?.name
      ? [{ name: data.listing.city.name, url: cityUrl }]
      : []),
    {
      name: categoryName,
      url: cityCategoryUrl ?? categoryUrl,
    },
    { name: title, url: canonicalUrl },
  ]);
  const faqItems = readFaqItemsFromCategoryData(data.listing.details, resolvedLocale, { isBeachListing });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqItems.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(faqItems)) }}
        />
      ) : null}

      <ListingDetailClient
        locale={resolvedLocale}
        localeSwitchPaths={listingPathByLocale}
        listing={data.listing}
        initialTranslation={currentTranslation}
        initialReviews={data.reviews}
        initialRelatedListings={data.relatedListings}
        initialNearbyBusinessListings={data.nearbyBusinessListings}
        initialWhatsAppStatus={data.whatsappStatus}
        initialLookupValue={data.canonicalSlug}
        initialOtherRegions={data.otherRegions}
      />
    </>
  );
}
