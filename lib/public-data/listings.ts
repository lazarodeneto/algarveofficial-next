import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import {
  buildMergedCategoryOptions,
  filterVisibleListingCategories,
  getCanonicalCategorySlug,
  getMergedCategoryBySlug,
} from "@/lib/categoryMerges";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { addLocaleToPathname } from "@/lib/i18n/locale-utils";
import {
  ALL_CANONICAL_SLUGS as PROGRAMMATIC_CATEGORY_SLUGS,
  getCanonicalFromUrlSlug,
  getCategoryUrlSlug,
  type CanonicalCategorySlug as ProgrammaticCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import {
  resolvePublicLocation,
  toFiniteNumber,
  unwrapRelation,
} from "@/lib/public-data/location";
import {
  buildPublicReviewsSummary,
  EMPTY_PUBLIC_REVIEWS_SUMMARY,
  getPublicReviewsSummary,
} from "@/lib/public-data/reviews";
import type {
  CategoryResolution,
  PublicCategoryCityCountDTO,
  PublicCategoryCountsDTO,
  PublicCategoryDTO,
  PublicListingDTO,
  PublicMapListingDTO,
  PublicPlaceRefDTO,
  PublicResolvedCategoryDTO,
} from "@/lib/public-data/types";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type PublicContentLocale =
  | "en"
  | "pt-pt"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "nl"
  | "sv"
  | "no"
  | "da";

type PublicSupabase = ReturnType<typeof createPublicServerClient>;
type CityRow = Pick<Tables<"cities">, "id" | "name" | "slug" | "latitude" | "longitude">;
type RegionRow = Pick<Tables<"regions">, "id" | "name" | "slug">;
type CategoryRow = Pick<Tables<"categories">, "id" | "name" | "slug" | "icon" | "image_url" | "is_active">;
type ListingRow = Tables<"listings"> & {
  city?: CityRow | CityRow[] | null;
  region?: RegionRow | RegionRow[] | null;
  category?: CategoryRow | CategoryRow[] | null;
};
type PublicCategoryCountRow = Pick<
  Tables<"categories">,
  | "id"
  | "name"
  | "slug"
  | "icon"
  | "image_url"
  | "is_active"
  | "is_featured"
  | "display_order"
  | "short_description"
>;
type PublicCategoryCountListingRow = {
  category_id: string | null;
  status: Tables<"listings">["status"] | null;
};
type PublicCategoryCityCountInputRow = {
  city_id?: string | null;
  city?: CityRow | CityRow[] | null;
};

type ListingTranslationRow = {
  listing_id: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
};

type CityTranslationRow = {
  city_id: string;
  name: string | null;
};

type RegionTranslationRow = {
  region_id: string;
  name: string | null;
};

type CategoryTranslationRow = {
  category_id: string;
  name: string | null;
};

export type PublicListingFilters = {
  search?: string;
  categoryId?: string;
  categoryIds?: string[];
  categorySlug?: string;
  cityId?: string;
  regionId?: string;
  tier?: Tables<"listings">["tier"];
  limit?: number;
  includeReviewsSummary?: boolean;
};

const PUBLIC_LISTING_SELECT = `
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
  address,
  contact_phone,
  contact_email,
  website_url,
  google_business_url,
  google_rating,
  google_review_count,
  tags,
  category_data,
  published_at,
  created_at,
  updated_at,
  city:cities(id, name, slug, latitude, longitude),
  region:regions(id, name, slug),
  category:categories(id, name, slug, icon, image_url, is_active)
`;

const CATEGORY_REFERENCE_SELECT = "id, name, slug, icon, image_url, is_active, display_order, is_featured, short_description";
const PROGRAMMATIC_CATEGORY_SLUG_SET = new Set<string>(PROGRAMMATIC_CATEGORY_SLUGS);

function normalizePublicContentLocale(raw?: string | null): PublicContentLocale {
  const normalized = raw?.toLowerCase().replaceAll("_", "-").trim();
  if (normalized === "pt" || normalized === "pt-pt") return "pt-pt";
  if (normalized?.startsWith("de")) return "de";
  if (normalized?.startsWith("fr")) return "fr";
  if (normalized?.startsWith("es")) return "es";
  if (normalized?.startsWith("it")) return "it";
  if (normalized?.startsWith("nl")) return "nl";
  if (normalized?.startsWith("sv")) return "sv";
  if (normalized === "no" || normalized?.startsWith("nb") || normalized?.startsWith("nn")) return "no";
  if (normalized?.startsWith("da")) return "da";
  return "en";
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeRouteCategorySlug(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

function normalizeRouteLocale(value?: string | null): Locale {
  const normalized = normalizePublicContentLocale(value);
  return isValidLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

function isProgrammaticCategorySlug(slug: string): slug is ProgrammaticCategorySlug {
  return PROGRAMMATIC_CATEGORY_SLUG_SET.has(slug);
}

function getCanonicalUrlSlug(canonicalSlug: string, locale: Locale): string {
  return isProgrammaticCategorySlug(canonicalSlug)
    ? getCategoryUrlSlug(canonicalSlug, locale)
    : canonicalSlug;
}

function buildCategoryRedirectPath(canonicalSlug: string, locale: Locale): string {
  return addLocaleToPathname(`/category/${getCanonicalUrlSlug(canonicalSlug, locale)}`, locale);
}

async function fetchListingTranslations(
  supabase: PublicSupabase,
  locale: PublicContentLocale,
  listingIds: readonly string[],
): Promise<ListingTranslationRow[]> {
  if (locale === "en" || listingIds.length === 0) return [];
  const { data, error } = await supabase
    .from("listing_translations")
    .select("listing_id, title, short_description, description")
    .eq("language_code", locale)
    .in("listing_id", Array.from(new Set(listingIds)));
  if (error) throw error;
  return (data ?? []) as ListingTranslationRow[];
}

async function fetchCityTranslations(
  supabase: PublicSupabase,
  locale: PublicContentLocale,
  cityIds: readonly string[],
): Promise<CityTranslationRow[]> {
  if (locale === "en" || cityIds.length === 0) return [];
  const { data, error } = await supabase
    .from("city_translations")
    .select("city_id, name")
    .eq("locale", locale)
    .in("city_id", Array.from(new Set(cityIds)));
  if (error) throw error;
  return (data ?? []) as CityTranslationRow[];
}

async function fetchRegionTranslations(
  supabase: PublicSupabase,
  locale: PublicContentLocale,
  regionIds: readonly string[],
): Promise<RegionTranslationRow[]> {
  if (locale === "en" || regionIds.length === 0) return [];
  const { data, error } = await supabase
    .from("region_translations")
    .select("region_id, name")
    .eq("locale", locale)
    .in("region_id", Array.from(new Set(regionIds)));
  if (error) throw error;
  return (data ?? []) as RegionTranslationRow[];
}

async function fetchCategoryTranslations(
  supabase: PublicSupabase,
  locale: PublicContentLocale,
  categoryIds: readonly string[],
): Promise<CategoryTranslationRow[]> {
  if (locale === "en" || categoryIds.length === 0) return [];
  const { data, error } = await supabase
    .from("category_translations")
    .select("category_id, name")
    .eq("locale", locale)
    .in("category_id", Array.from(new Set(categoryIds)));
  if (error) throw error;
  return (data ?? []) as CategoryTranslationRow[];
}

async function localizeListingRows(
  supabase: PublicSupabase,
  rows: ListingRow[],
  locale: PublicContentLocale,
): Promise<ListingRow[]> {
  if (locale === "en" || rows.length === 0) return rows;

  const cityIds = rows.map((row) => unwrapRelation(row.city)?.id).filter(Boolean) as string[];
  const regionIds = rows.map((row) => unwrapRelation(row.region)?.id).filter(Boolean) as string[];
  const categoryIds = rows.map((row) => unwrapRelation(row.category)?.id).filter(Boolean) as string[];
  const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
    fetchListingTranslations(supabase, locale, rows.map((row) => row.id)),
    fetchCityTranslations(supabase, locale, cityIds),
    fetchRegionTranslations(supabase, locale, regionIds),
    fetchCategoryTranslations(supabase, locale, categoryIds),
  ]);

  const listingMap = new Map(listingTranslations.map((row) => [row.listing_id, row]));
  const cityMap = new Map(cityTranslations.map((row) => [row.city_id, row]));
  const regionMap = new Map(regionTranslations.map((row) => [row.region_id, row]));
  const categoryMap = new Map(categoryTranslations.map((row) => [row.category_id, row]));

  return rows.map((row) => {
    const city = unwrapRelation(row.city);
    const region = unwrapRelation(row.region);
    const category = unwrapRelation(row.category);
    const listingTranslation = listingMap.get(row.id);
    const cityTranslation = city ? cityMap.get(city.id) : undefined;
    const regionTranslation = region ? regionMap.get(region.id) : undefined;
    const categoryTranslation = category ? categoryMap.get(category.id) : undefined;

    return {
      ...row,
      name: cleanText(listingTranslation?.title) ?? row.name,
      short_description: cleanText(listingTranslation?.short_description) ?? row.short_description,
      description: cleanText(listingTranslation?.description) ?? row.description,
      city: city
        ? {
            ...city,
            name: cleanText(cityTranslation?.name) ?? city.name,
          }
        : city,
      region: region
        ? {
            ...region,
            name: cleanText(regionTranslation?.name) ?? region.name,
          }
        : region,
      category: category
        ? {
            ...category,
            name: cleanText(categoryTranslation?.name) ?? category.name,
          }
        : category,
    };
  });
}

function toPlaceRef(entity: CityRow | RegionRow | null): PublicPlaceRefDTO | null {
  if (!entity?.id || !entity.name || !entity.slug) return null;
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
  };
}

function toCategoryRef(entity: CategoryRow | null): PublicCategoryDTO | null {
  if (!entity?.id || !entity.name || !entity.slug) return null;
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    icon: entity.icon ?? null,
    imageUrl: entity.image_url ?? null,
  };
}

export function normalizePublicListing(
  row: ListingRow,
  reviews = EMPTY_PUBLIC_REVIEWS_SUMMARY,
  options: { allowCityCoordinateFallback?: boolean } = {},
): PublicListingDTO {
  const city = unwrapRelation(row.city);
  const region = unwrapRelation(row.region);
  const category = unwrapRelation(row.category);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.featured_image_url,
    status: row.status,
    tier: row.tier,
    isCurated: Boolean(row.is_curated),
    category: toCategoryRef(category),
    categoryId: row.category_id,
    city: toPlaceRef(city),
    cityId: row.city_id,
    region: toPlaceRef(region),
    regionId: row.region_id,
    location: resolvePublicLocation(
      {
        city,
        region,
        latitude: row.latitude,
        longitude: row.longitude,
      },
      options,
    ),
    address: row.address,
    websiteUrl: row.website_url,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    priceFrom: row.price_from,
    priceTo: row.price_to,
    priceCurrency: row.price_currency,
    googleBusinessUrl: row.google_business_url,
    reviews,
    tags: row.tags ?? [],
    categoryData: row.category_data,
    claimStatus: row.claim_status ?? null,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

async function resolveCategoryIds(
  supabase: PublicSupabase,
  filters: PublicListingFilters,
): Promise<string[] | null> {
  if (Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
    return Array.from(new Set(filters.categoryIds.filter(Boolean)));
  }

  if (filters.categoryId) return [filters.categoryId];
  if (!filters.categorySlug) return [];

  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_REFERENCE_SELECT)
    .eq("is_active", true);

  if (error || !data) return [];

  const ids = resolvePublicCategoryFilterIds(data as Tables<"categories">[], filters.categorySlug);
  return ids.length > 0 ? ids : null;
}

export function resolvePublicCategoryFilterIds(
  categoriesInput: Tables<"categories">[],
  categorySlug?: string | null,
): string[] {
  const slug = categorySlug?.trim().toLowerCase();
  if (!slug) return [];

  const categories = filterVisibleListingCategories(categoriesInput);
  const merged = getMergedCategoryBySlug(slug, buildMergedCategoryOptions(categories));
  if (merged?.memberIds?.length) return merged.memberIds;

  const direct = categories.find((category) => category.slug === slug);
  return direct?.id ? [direct.id] : [];
}

export function buildPublicCategoryCountsFromRows(
  categoriesInput: PublicCategoryCountRow[],
  listingsInput: PublicCategoryCountListingRow[],
): PublicCategoryCountsDTO {
  const visibleCategories = filterVisibleListingCategories(
    categoriesInput.filter((category) => category.is_active),
  ) as Tables<"categories">[];
  const visibleCategoryIds = new Set(visibleCategories.map((category) => category.id));
  const slugByCategoryId = new Map(visibleCategories.map((category) => [category.id, category.slug]));
  const byMemberCategoryId: Record<string, number> = {};
  const byMemberCategorySlug: Record<string, number> = {};

  for (const listing of listingsInput) {
    const categoryId = listing.category_id;
    if (listing.status !== "published" || !categoryId || !visibleCategoryIds.has(categoryId)) continue;
    byMemberCategoryId[categoryId] = (byMemberCategoryId[categoryId] ?? 0) + 1;
  }

  for (const [categoryId, count] of Object.entries(byMemberCategoryId)) {
    const slug = slugByCategoryId.get(categoryId);
    if (slug) byMemberCategorySlug[slug] = count;
  }

  const byCategoryId: Record<string, number> = { ...byMemberCategoryId };
  const byCategorySlug: Record<string, number> = { ...byMemberCategorySlug };
  const byCanonicalCategoryId: Record<string, number> = {};
  const byCanonicalCategorySlug: Record<string, number> = {};
  const mergedCategories = buildMergedCategoryOptions(visibleCategories);

  for (const category of mergedCategories) {
    const countedMemberIds = new Set(category.memberIds);
    let total = 0;
    for (const memberId of countedMemberIds) {
      total += byMemberCategoryId[memberId] ?? 0;
    }

    byCanonicalCategoryId[category.id] = total;
    byCanonicalCategorySlug[category.slug] = total;
    byCategoryId[category.id] = total;
    byCategorySlug[category.slug] = total;
  }

  return {
    byCategoryId,
    byCategorySlug,
    byCanonicalCategoryId,
    byCanonicalCategorySlug,
    byMemberCategoryId,
    byMemberCategorySlug,
  };
}

export function buildPublicCategoryCityCountsFromRows(
  rows: PublicCategoryCityCountInputRow[],
  translations: CityTranslationRow[] = [],
  limit = 12,
): PublicCategoryCityCountDTO[] {
  const translationByCityId = new Map(
    translations
      .map((translation) => [translation.city_id, cleanText(translation.name)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[0] && entry[1])),
  );
  const cityCounts = new Map<string, PublicCategoryCityCountDTO>();

  for (const row of rows) {
    const city = unwrapRelation(row.city);
    if (!city?.id || !city.slug || !city.name) continue;

    const existing = cityCounts.get(city.id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    cityCounts.set(city.id, {
      id: city.id,
      slug: city.slug,
      name: translationByCityId.get(city.id) ?? city.name,
      count: 1,
    });
  }

  return Array.from(cityCounts.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, Math.max(0, Math.floor(limit)));
}

export const getPublicCategoryCityCounts = cache(
  async ({
    categoryIds,
    locale: localeInput,
    limit = 12,
  }: {
    categoryIds: readonly string[];
    locale?: string | null;
    limit?: number;
  }): Promise<PublicCategoryCityCountDTO[]> => {
    const ids = Array.from(new Set(categoryIds.filter(Boolean)));
    if (ids.length === 0) return [];

    const supabase = createPublicServerClient();
    const rows: PublicCategoryCityCountInputRow[] = [];
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("listings")
        .select("city_id, city:cities!inner(id, name, slug, latitude, longitude)")
        .eq("status", "published")
        .in("category_id", ids)
        .not("city_id", "is", null)
        .range(from, from + pageSize - 1);

      if (error) throw error;

      const pageRows = (data ?? []) as unknown as PublicCategoryCityCountInputRow[];
      rows.push(...pageRows);
      if (pageRows.length < pageSize) break;
      from += pageSize;
    }

    const locale = normalizePublicContentLocale(localeInput);
    const cityIds = Array.from(
      new Set(
        rows
          .map((row) => unwrapRelation(row.city)?.id)
          .filter(Boolean) as string[],
      ),
    );
    const translations = await fetchCityTranslations(supabase, locale, cityIds);

    return buildPublicCategoryCityCountsFromRows(rows, translations, limit);
  },
);

async function fetchPublicListingRows(
  supabase: PublicSupabase,
  filters: PublicListingFilters,
): Promise<ListingRow[]> {
  const categoryIds = await resolveCategoryIds(supabase, filters);
  if (categoryIds === null) return [];

  let query = supabase
    .from("listings")
    .select(PUBLIC_LISTING_SELECT)
    .eq("status", "published")
    .order("tier", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(filters.limit ?? 48, 1), 1000));

  if (categoryIds.length > 0) query = query.in("category_id", categoryIds);
  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.regionId) query = query.eq("region_id", filters.regionId);
  if (filters.tier) query = query.eq("tier", filters.tier);

  const search = filters.search?.replace(/[,%(){}'"]/g, " ").replace(/\s+/g, " ").trim();
  if (search) {
    query = query.or(
      [
        `name.ilike.%${search}%`,
        `short_description.ilike.%${search}%`,
        `description.ilike.%${search}%`,
        `address.ilike.%${search}%`,
      ].join(","),
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ListingRow[];
}

export const getPublicListings = cache(
  async (filters: PublicListingFilters & { locale?: string } = {}): Promise<PublicListingDTO[]> => {
    const locale = normalizePublicContentLocale(filters.locale);
    const supabase = createPublicServerClient();
    const rows = await localizeListingRows(
      supabase,
      await fetchPublicListingRows(supabase, filters),
      locale,
    );
    const reviewsByListing = filters.includeReviewsSummary
      ? await getPublicReviewsSummary(rows.map((row) => row.id))
      : {};

    return rows.map((row) =>
      normalizePublicListing(
        row,
        reviewsByListing[row.id] ?? buildPublicReviewsSummary(row),
      ),
    );
  },
);

export const getPublicListingBySlug = cache(
  async (slug: string, localeInput?: string): Promise<PublicListingDTO | null> => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return null;

    const locale = normalizePublicContentLocale(localeInput);
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("listings")
      .select(PUBLIC_LISTING_SELECT)
      .eq("status", "published")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [row] = await localizeListingRows(supabase, [data as unknown as ListingRow], locale);
    const [reviewsByListing] = await Promise.all([getPublicReviewsSummary([row.id])]);

  return normalizePublicListing(
      row,
      reviewsByListing[row.id] ?? buildPublicReviewsSummary(row),
      { allowCityCoordinateFallback: true },
    );
  },
);

export function resolvePublicCategoryRouteFromRows(
  categoriesInput: Tables<"categories">[],
  incomingSlug: string,
  localeInput?: string | null,
): CategoryResolution {
  const locale = normalizeRouteLocale(localeInput);
  const normalizedSlug = normalizeRouteCategorySlug(incomingSlug);
  if (!normalizedSlug) return { ok: false, reason: "not_found" };

  const categories = filterVisibleListingCategories(categoriesInput);
  const mergedCategories = buildMergedCategoryOptions(categories);
  const categoriesBySlug = new Map(categories.map((category) => [category.slug.toLowerCase(), category]));

  const localizedCanonical = getCanonicalFromUrlSlug(normalizedSlug, locale);
  const directCategory = categoriesBySlug.get(normalizedSlug);
  const directMerged = getMergedCategoryBySlug(normalizedSlug, mergedCategories);
  const legacyAliasCanonical = getCanonicalCategorySlug(normalizedSlug);
  const directCategoryCanonical = directCategory
    ? getCanonicalCategorySlug(directCategory.slug)
    : null;
  const aliasCanonical =
    directMerged?.slug ??
    (directCategoryCanonical && getMergedCategoryBySlug(directCategoryCanonical, mergedCategories)
      ? directCategoryCanonical
      : null) ??
    (legacyAliasCanonical && getMergedCategoryBySlug(legacyAliasCanonical, mergedCategories)
      ? legacyAliasCanonical
      : null) ??
    (localizedCanonical && getMergedCategoryBySlug(localizedCanonical, mergedCategories)
      ? localizedCanonical
      : null);

  const resolvedCanonical =
    localizedCanonical && getMergedCategoryBySlug(localizedCanonical, mergedCategories)
      ? localizedCanonical
      : aliasCanonical;
  const matched = resolvedCanonical
    ? getMergedCategoryBySlug(resolvedCanonical, mergedCategories)
    : directMerged;

  if (!matched) return { ok: false, reason: "not_found" };

  const canonicalUrlSlug = getCanonicalUrlSlug(matched.slug, locale);
  if (normalizedSlug !== canonicalUrlSlug) {
    return {
      ok: false,
      reason: "redirect_required",
      redirectTo: buildCategoryRedirectPath(matched.slug, locale),
    };
  }

  return {
    ok: true,
    category: {
      id: matched.id,
      name: matched.name,
      slug: matched.slug,
      canonicalSlug: matched.slug,
      canonicalUrlSlug,
      icon: matched.icon ?? null,
      imageUrl: matched.image_url ?? null,
      memberIds: matched.memberIds,
      memberSlugs: matched.memberSlugs,
      pillar: null,
    },
  };
}

export const getPublicRoutableCategorySlugs = cache(async (): Promise<string[]> => {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_REFERENCE_SELECT)
    .eq("is_active", true);

  if (error) throw error;

  return buildMergedCategoryOptions(
    filterVisibleListingCategories((data ?? []) as Tables<"categories">[]),
  ).map((category) => category.slug);
});

export const resolvePublicCategoryRoute = cache(
  async (incomingSlug: string, localeInput?: string | null): Promise<CategoryResolution> => {
    const locale = normalizeRouteLocale(localeInput);
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_REFERENCE_SELECT)
      .eq("is_active", true);

    if (error) throw error;

    const resolution = resolvePublicCategoryRouteFromRows(
      (data ?? []) as Tables<"categories">[],
      incomingSlug,
      locale,
    );

    if (!resolution.ok || locale === "en") return resolution;

    const [translation] = await fetchCategoryTranslations(supabase, locale, [resolution.category.id]);
    return {
      ...resolution,
      category: {
        ...resolution.category,
        name: cleanText(translation?.name) ?? resolution.category.name,
      },
    };
  },
);

export const getPublicCategoryBySlug = cache(
  async (categorySlug: string, localeInput?: string): Promise<PublicCategoryDTO | null> => {
    const slug = categorySlug.trim().toLowerCase();
    if (!slug) return null;

    const locale = normalizePublicContentLocale(localeInput);
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_REFERENCE_SELECT)
      .eq("is_active", true);

    if (error) throw error;

    const categories = filterVisibleListingCategories((data ?? []) as Tables<"categories">[]);
    const merged = getMergedCategoryBySlug(slug, buildMergedCategoryOptions(categories));
    const matched = merged ?? categories.find((category) => category.slug === slug);
    if (!matched) return null;

    if (locale === "en") {
      return {
        id: matched.id,
        name: matched.name,
        slug: matched.slug,
        icon: matched.icon ?? null,
        imageUrl: matched.image_url ?? null,
      };
    }

    const [translation] = await fetchCategoryTranslations(supabase, locale, [matched.id]);
    return {
      id: matched.id,
      name: cleanText(translation?.name) ?? matched.name,
      slug: matched.slug,
      icon: matched.icon ?? null,
      imageUrl: matched.image_url ?? null,
    };
  },
);

export const getPublicListingsByCategory = cache(
  async (
    categorySlug: string,
    options: Omit<PublicListingFilters, "categorySlug"> & { locale?: string } = {},
  ): Promise<PublicListingDTO[]> =>
    getPublicListings({
      ...options,
      categorySlug,
    }),
);

export const getPublicMapListings = cache(
  async (localeInput?: string, limit = 200): Promise<PublicMapListingDTO[]> => {
    const listings = await getPublicListings({ locale: localeInput, limit, includeReviewsSummary: false });
    return listings
      .map((listing) => {
        const latitude = toFiniteNumber(listing.location.latitude);
        const longitude = toFiniteNumber(listing.location.longitude);
        if (latitude === null || longitude === null) return null;
        return {
          ...listing,
          location: {
            ...listing.location,
            latitude,
            longitude,
          },
        } satisfies PublicMapListingDTO;
      })
      .filter((listing): listing is PublicMapListingDTO => Boolean(listing));
  },
);

export const getPublicCategoryCounts = cache(async (): Promise<PublicCategoryCountsDTO> => {
  const supabase = createPublicServerClient();
  const [{ data: listings }, { data: categories }] = await Promise.all([
    supabase.from("listings").select("category_id, status").eq("status", "published").not("category_id", "is", null),
    supabase.from("categories").select(CATEGORY_REFERENCE_SELECT).eq("is_active", true),
  ]);

  return buildPublicCategoryCountsFromRows(
    (categories ?? []) as PublicCategoryCountRow[],
    (listings ?? []) as PublicCategoryCountListingRow[],
  );
});
