import { createPublicServerClient } from "@/lib/supabase/public-server";
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import type { Tables } from "@/integrations/supabase/types";
import type { CityRow, RegionRow, CategoryRow } from "@/hooks/useReferenceData";
import type { ListingWithRelations, ListingFilters } from "@/hooks/useListings";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { buildMergedCategoryOptions, getMergedCategoryBySlug, resolveCategoryFilterSlug } from "@/lib/categoryMerges";

type ListingRow = Tables<"listings">;

const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, slug, name, short_description";
const PUBLIC_CATEGORY_FIELDS = "id, slug, name, icon, short_description, image_url";

const PUBLIC_LISTING_FIELDS = `
  id, slug, name, short_description, description, featured_image_url,
  price_from, price_to, price_currency, tier, is_curated, status,
  city_id, region_id, category_id, owner_id, latitude, longitude,
  address, website_url, facebook_url, instagram_url, twitter_url,
  linkedin_url, youtube_url, tiktok_url, telegram_url,
  google_business_url, google_rating, google_review_count,
  tags, category_data, view_count, published_at, created_at, updated_at
`;

interface ListingsFilterQuery {
  in: (column: string, values: readonly string[]) => this;
  eq: (column: string, value: unknown) => this;
  or: (filters: string) => this;
}

interface DirectoryInitialFilters {
  q: string;
  city: string;
  region: string;
  category: string;
  tier: string;
}

export interface DirectoryPageData {
  cities: CityRow[];
  regions: RegionRow[];
  categories: CategoryRow[];
  listings: ListingWithRelations[];
  categoryCounts: Record<string, number>;
  globalSettings: GlobalSetting[];
  filters: DirectoryInitialFilters;
  locale: string;
}

function resolveFilterEntityId<T extends { id: string; slug: string }>(
  value: string | undefined,
  entities: T[],
): string | undefined {
  if (!value || value === "all") return undefined;
  const match = entities.find((e) => e.id === value || e.slug === value);
  return match?.id ?? undefined;
}

function applyListingFiltersServer(
  query: ListingsFilterQuery,
  filters: ListingFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
): ListingsFilterQuery {
  const mergedCategories = buildMergedCategoryOptions(categories);
  const normalizedCategory =
    filters.categoryId && filters.categoryId !== "all"
      ? resolveCategoryFilterSlug(filters.categoryId, categories, mergedCategories)
      : null;
  const selectedCategoryItem = normalizedCategory
    ? getMergedCategoryBySlug(normalizedCategory, mergedCategories)
    : null;
  const selectedCategoryIds = selectedCategoryItem?.memberIds ?? [];

  let result = query;

  if (selectedCategoryIds.length > 0) {
    result = result.in("category_id", selectedCategoryIds);
  }

  const selectedCityId = resolveFilterEntityId(filters.cityId, cities);
  if (selectedCityId) {
    result = result.eq("city_id", selectedCityId);
  }

  const selectedRegionId = resolveFilterEntityId(filters.regionId, regions);
  if (selectedRegionId) {
    result = result.eq("region_id", selectedRegionId);
  }

  if (filters.tier && String(filters.tier) !== "all") {
    result = result.eq("tier", filters.tier);
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[,%(){}'"]/g, " ").replace(/\s+/g, " ");
    const tagTokens = term
      .toLowerCase()
      .split(" ")
      .map((t) => t.replace(/[^a-z0-9_-]/gi, ""))
      .filter(Boolean)
      .slice(0, 5);

    const searchClauses = [
      `name.ilike.%${term}%`,
      `short_description.ilike.%${term}%`,
      `description.ilike.%${term}%`,
    ];

    tagTokens.forEach((token) => {
      searchClauses.push(`name.ilike.%${token}%`);
      searchClauses.push(`short_description.ilike.%${token}%`);
      searchClauses.push(`description.ilike.%${token}%`);
      searchClauses.push(`tags.cs.{${token}}`);
    });

    result = result.or(searchClauses.join(","));
  }

  return result;
}

async function fetchDirectoryCities(
  supabase: ReturnType<typeof createPublicServerClient>,
  locale: PublicContentLocale,
): Promise<CityRow[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];

  const cities = (data ?? []) as CityRow[];
  if (locale === "en" || cities.length === 0) return cities;

  const translations = await fetchCityTranslations(locale, cities.map((c) => c.id));
  const map = new Map(translations.map((t) => [t.city_id, t]));

  return cities.map((city) => {
    const t = map.get(city.id);
    return t
      ? { ...city, name: t.name?.trim() || city.name, short_description: t.short_description?.trim() || city.short_description }
      : city;
  });
}

async function fetchDirectoryRegions(
  supabase: ReturnType<typeof createPublicServerClient>,
  locale: PublicContentLocale,
): Promise<RegionRow[]> {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];

  const regions = (data ?? []) as RegionRow[];
  if (locale === "en" || regions.length === 0) return regions;

  const translations = await fetchRegionTranslations(locale, regions.map((r) => r.id));
  const map = new Map(translations.map((t) => [t.region_id, t]));

  return regions.map((region) => {
    const t = map.get(region.id);
    return t
      ? { ...region, name: t.name?.trim() || region.name, short_description: t.short_description?.trim() || region.short_description }
      : region;
  });
}

async function fetchDirectoryCategories(
  supabase: ReturnType<typeof createPublicServerClient>,
  locale: PublicContentLocale,
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];

  const categories = (data ?? []) as CategoryRow[];
  if (locale === "en" || categories.length === 0) return categories;

  const translations = await fetchCategoryTranslations(locale, categories.map((c) => c.id));
  const map = new Map(translations.map((t) => [t.category_id, t]));

  return categories.map((category) => {
    const t = map.get(category.id);
    return t
      ? { ...category, name: t.name?.trim() || category.name, short_description: t.short_description?.trim() || category.short_description }
      : category;
  });
}

async function fetchDirectoryCategoryCounts(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("listings")
    .select("category_id")
    .eq("status", "published")
    .not("category_id", "is", null);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  (data as Pick<ListingRow, "category_id">[]).forEach((row) => {
    if (row.category_id) {
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }
  });

  return counts;
}

async function fetchDirectoryListings(
  supabase: ReturnType<typeof createPublicServerClient>,
  filters: ListingFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
  locale: PublicContentLocale,
  limit = 100,
): Promise<ListingWithRelations[]> {
  let query = supabase
    .from("listings")
    .select(
      `
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(limit);

  query = applyListingFiltersServer(query as unknown as ListingsFilterQuery, filters, categories, cities, regions) as unknown as typeof query;

  const { data, error } = await query;

  if (error || !data) return [];
  let listings = data as unknown as ListingWithRelations[];

  const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
  listings = listings.sort((a, b) => (tierOrder[a.tier ?? "unverified"] ?? 2) - (tierOrder[b.tier ?? "unverified"] ?? 2));

  if (locale === "en" || listings.length === 0) return listings;

  const listingIds = listings.map((l) => l.id);
  const cityIds = listings.map((l) => l.city?.id).filter(Boolean) as string[];
  const regionIds = listings.map((l) => l.region?.id).filter(Boolean) as string[];
  const categoryIds = listings.map((l) => l.category?.id).filter(Boolean) as string[];

  const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
    fetchListingTranslations(locale, listingIds),
    fetchCityTranslations(locale, cityIds),
    fetchRegionTranslations(locale, regionIds),
    fetchCategoryTranslations(locale, categoryIds),
  ]);

  const listingMap = new Map(listingTranslations.map((t) => [t.listing_id, t]));
  const cityMap = new Map(cityTranslations.map((t) => [t.city_id, t]));
  const regionMap = new Map(regionTranslations.map((t) => [t.region_id, t]));
  const categoryMap = new Map(categoryTranslations.map((t) => [t.category_id, t]));

  return listings.map((listing) => {
    const lt = listingMap.get(listing.id);
    const ct = listing.city?.id ? cityMap.get(listing.city.id) : undefined;
    const rt = listing.region?.id ? regionMap.get(listing.region.id) : undefined;
    const catT = listing.category?.id ? categoryMap.get(listing.category.id) : undefined;

    return {
      ...listing,
      name: lt?.title?.trim() || listing.name,
      short_description: lt?.short_description?.trim() || listing.short_description,
      description: lt?.description?.trim() || listing.description,
      city: listing.city
        ? { ...listing.city, name: ct?.name?.trim() || listing.city.name, short_description: ct?.short_description?.trim() || listing.city.short_description }
        : listing.city,
      region: listing.region
        ? { ...listing.region, name: rt?.name?.trim() || listing.region.name, short_description: rt?.short_description?.trim() || listing.region.short_description }
        : listing.region,
      category: listing.category
        ? { ...listing.category, name: catT?.name?.trim() || listing.category.name, short_description: catT?.short_description?.trim() || listing.category.short_description }
        : listing.category,
    };
  });
}

async function fetchDirectoryGlobalSettings(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<GlobalSetting[]> {
  const keys = [
    "cms_text_overrides",
    "cms_page_configs",
  ];

  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", keys);

  if (error || !data) return [];
  return data as unknown as GlobalSetting[];
}

export async function getDirectoryPageData(
  locale: string,
  filters: DirectoryInitialFilters,
): Promise<DirectoryPageData> {
  const supabase = createPublicServerClient();
  const contentLocale = normalizePublicContentLocale(locale);

  const normalizedFilters: ListingFilters = {
    search: filters.q?.trim() || undefined,
    categoryId: filters.category && filters.category !== "all" ? filters.category : undefined,
    cityId: filters.city && filters.city !== "all" ? filters.city : undefined,
    regionId: filters.region && filters.region !== "all" ? filters.region : undefined,
    tier: filters.tier && filters.tier !== "all" ? (filters.tier as "signature" | "verified") : undefined,
  };

  const [cities, regions, categories, categoryCounts, globalSettings] = await Promise.all([
    fetchDirectoryCities(supabase, contentLocale),
    fetchDirectoryRegions(supabase, contentLocale),
    fetchDirectoryCategories(supabase, contentLocale),
    fetchDirectoryCategoryCounts(supabase),
    fetchDirectoryGlobalSettings(supabase),
  ]);

  const listings = await fetchDirectoryListings(
    supabase,
    normalizedFilters,
    categories,
    cities,
    regions,
    contentLocale,
    100,
  );

  return {
    cities,
    regions,
    categories,
    listings,
    categoryCounts,
    globalSettings,
    filters,
    locale: contentLocale,
  };
}
