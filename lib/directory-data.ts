import { unstable_cache } from "next/cache";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { fetchCmsRuntimeSettings } from "@/lib/cms/runtime-settings";
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
import {
  buildMergedCategoryOptions,
  filterVisibleListingCategories,
  resolveCategoryFilterSelection,
} from "@/lib/categoryMerges";
import { PUBLIC_LISTING_SUMMARY_FIELDS } from "@/lib/listings/public-payload";
import { buildPublicCategoryCountsFromRows } from "@/lib/public-data/listings";
import { getProgrammaticCityIndexEntries } from "@/lib/seo/programmatic/category-city-data";
import { buildMunicipalityCityIndex, type MunicipalityCityIndexItem } from "@/lib/cities/municipalityIndex";

type ListingRow = Tables<"listings">;

const DIRECTORY_CITY_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url,
  latitude, longitude, is_active, is_featured, display_order, created_at
`;
const DIRECTORY_REGION_FIELDS = `
  id, slug, name, short_description, description, image_url, hero_image_url,
  is_active, is_featured, is_visible_destinations, display_order, created_at
`;
const DIRECTORY_CATEGORY_FIELDS = `
  id, slug, name, icon, short_description, description, image_url,
  is_active, is_featured, display_order, created_at
`;
const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url, hero_image_url, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, slug, name, short_description";
const PUBLIC_CATEGORY_FIELDS = "id, slug, name, icon, short_description, image_url";
const NO_MATCH_CATEGORY_ID = "00000000-0000-0000-0000-000000000000";

const DIRECTORY_INITIAL_LISTING_LIMIT = 60;

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
  visitCityIndex: VisitCityIndexItem[];
  featuredVisitCity: VisitCityIndexItem | null;
  globalSettings: GlobalSetting[];
  filters: DirectoryInitialFilters;
  locale: string;
}

export interface VisitCityIndexItem {
  id: MunicipalityCityIndexItem["id"];
  slug: MunicipalityCityIndexItem["slug"];
  name: MunicipalityCityIndexItem["name"];
  short_description: MunicipalityCityIndexItem["short_description"];
  image_url: MunicipalityCityIndexItem["image_url"];
  hero_image_url: MunicipalityCityIndexItem["hero_image_url"];
  totalCount: MunicipalityCityIndexItem["totalCount"];
  municipalityRegionId?: MunicipalityCityIndexItem["municipalityRegionId"];
  municipalityCityIds?: MunicipalityCityIndexItem["municipalityCityIds"];
}

interface DirectoryReferenceData {
  cities: CityRow[];
  regions: RegionRow[];
  categories: CategoryRow[];
  categoryCounts: Record<string, number>;
  visitCityIndex: VisitCityIndexItem[];
  featuredVisitCity: VisitCityIndexItem | null;
  globalSettings: GlobalSetting[];
}

type CityRegionMappingRow = Tables<"city_region_mapping">;

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
  const categorySelection = resolveCategoryFilterSelection(
    filters.categoryId,
    categories,
    mergedCategories,
  );
  const selectedCategoryIds = categorySelection.kind === "matched"
    ? categorySelection.memberIds
    : [];

  let result = query;

  if (selectedCategoryIds.length > 0) {
    result = result.in("category_id", selectedCategoryIds);
  } else if (categorySelection.kind === "invalid") {
    result = result.eq("category_id", NO_MATCH_CATEGORY_ID);
  }

  // Handle multiple city filtering (from municipalities) or single city
  if (Array.isArray(filters.cityIds) && filters.cityIds.length > 0) {
    result = result.in("city_id", filters.cityIds);
  } else {
    const selectedCityId = resolveFilterEntityId(filters.cityId, cities);
    if (selectedCityId) {
      result = result.eq("city_id", selectedCityId);
    }
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
    .select(DIRECTORY_CITY_FIELDS)
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
      ? { ...city, name: t.name?.trim() ?? city.name, short_description: t.short_description?.trim() ?? city.short_description }
      : city;
  });
}

async function fetchDirectoryRegions(
  supabase: ReturnType<typeof createPublicServerClient>,
  locale: PublicContentLocale,
): Promise<RegionRow[]> {
  const { data, error } = await supabase
    .from("regions")
    .select(DIRECTORY_REGION_FIELDS)
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
      ? { ...region, name: t.name?.trim() ?? region.name, short_description: t.short_description?.trim() ?? region.short_description }
      : region;
  });
}

async function fetchDirectoryCategories(
  supabase: ReturnType<typeof createPublicServerClient>,
  locale: PublicContentLocale,
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(DIRECTORY_CATEGORY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];

  const categories = filterVisibleListingCategories((data ?? []) as CategoryRow[]);
  if (locale === "en" || categories.length === 0) return categories;

  const translations = await fetchCategoryTranslations(locale, categories.map((c) => c.id));
  const map = new Map(translations.map((t) => [t.category_id, t]));

  return categories.map((category) => {
    const t = map.get(category.id);
    return t
      ? { ...category, name: t.name?.trim() ?? category.name, short_description: t.short_description?.trim() ?? category.short_description }
      : category;
  });
}

async function fetchDirectoryCategoryCounts(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<Record<string, number>> {
  const [{ data: listings, error: listingsError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase
      .from("listings")
      .select("category_id, status")
      .eq("status", "published")
      .not("category_id", "is", null),
    supabase
      .from("categories")
      .select(DIRECTORY_CATEGORY_FIELDS)
      .eq("is_active", true),
  ]);

  if (listingsError || categoriesError || !listings || !categories) return {};

  return buildPublicCategoryCountsFromRows(
    categories as unknown as Tables<"categories">[],
    listings as Pick<ListingRow, "category_id" | "status">[],
  ).byCategoryId;
}

async function buildVisitCityIndex(
  cities: CityRow[],
  cityRegionMappings: CityRegionMappingRow[],
  regions: RegionRow[],
): Promise<{
  visitCityIndex: VisitCityIndexItem[];
  featuredVisitCity: VisitCityIndexItem | null;
}> {
  const indexEntries = await getProgrammaticCityIndexEntries();
  const cityBySlug = new Map(cities.map((city) => [city.slug, city.id]));
  const cityListingCounts: Record<string, number> = {};

  for (const entry of indexEntries) {
    const cityId = cityBySlug.get(entry.citySlug);
    if (!cityId) continue;
    cityListingCounts[cityId] = entry.totalCount;
  }

  const visitCityIndex = buildMunicipalityCityIndex({
    cities,
    cityListingCounts,
    cityRegionMappings,
    regions,
  }) as VisitCityIndexItem[];

  const featuredVisitCity =
    visitCityIndex.find((city) => city.hero_image_url || city.image_url) ??
    visitCityIndex[0] ??
    null;

  return { visitCityIndex, featuredVisitCity };
}

async function fetchCityRegionMappings(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<CityRegionMappingRow[]> {
  const { data, error } = await supabase
    .from("city_region_mapping")
    .select("city_id, region_id, is_primary, id, created_at");

  if (error || !data) return [];
  return data as CityRegionMappingRow[];
}

async function fetchDirectoryListings(
  supabase: ReturnType<typeof createPublicServerClient>,
  filters: ListingFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
  locale: PublicContentLocale,
  limit = DIRECTORY_INITIAL_LISTING_LIMIT,
): Promise<ListingWithRelations[]> {
  let query = supabase
    .from("listings")
    .select(
      `
      ${PUBLIC_LISTING_SUMMARY_FIELDS},
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
      name: lt?.title?.trim() ?? listing.name,
      short_description: lt?.short_description?.trim() ?? listing.short_description,
      description: lt?.description?.trim() ?? listing.description,
      city: listing.city
        ? { ...listing.city, name: ct?.name?.trim() ?? listing.city.name, short_description: ct?.short_description?.trim() ?? listing.city.short_description }
        : listing.city,
      region: listing.region
        ? { ...listing.region, name: rt?.name?.trim() ?? listing.region.name, short_description: rt?.short_description?.trim() ?? listing.region.short_description }
        : listing.region,
      category: listing.category
        ? { ...listing.category, name: catT?.name?.trim() ?? listing.category.name, short_description: catT?.short_description?.trim() ?? listing.category.short_description }
        : listing.category,
    };
  });
}

async function fetchDirectoryGlobalSettings(locale: PublicContentLocale): Promise<GlobalSetting[]> {
  try {
    return await fetchCmsRuntimeSettings({
      requestedKeys: [
        CMS_GLOBAL_SETTING_KEYS.textOverrides,
        CMS_GLOBAL_SETTING_KEYS.pageConfigs,
      ],
      locale,
    });
  } catch {
    return [];
  }
}

const getDirectoryReferenceData = unstable_cache(
  async (locale: PublicContentLocale): Promise<DirectoryReferenceData> => {
    const supabase = createPublicServerClient();
    const [cities, regions, categories, categoryCounts, globalSettings, cityRegionMappings] = await Promise.all([
      fetchDirectoryCities(supabase, locale),
      fetchDirectoryRegions(supabase, locale),
      fetchDirectoryCategories(supabase, locale),
      fetchDirectoryCategoryCounts(supabase),
      fetchDirectoryGlobalSettings(locale),
      fetchCityRegionMappings(supabase),
    ]);

    const { visitCityIndex, featuredVisitCity } = await buildVisitCityIndex(
      cities,
      cityRegionMappings,
      regions,
    );

    return {
      cities,
      regions,
      categories,
      categoryCounts,
      visitCityIndex,
      featuredVisitCity,
      globalSettings,
    };
  },
  ["directory-reference-data-v1"],
  { revalidate: 300 },
);

export async function getDirectoryPageData(
  locale: string,
  filters: DirectoryInitialFilters,
): Promise<DirectoryPageData> {
  const contentLocale = normalizePublicContentLocale(locale);

  const normalizedFilters: ListingFilters = {
    search: filters.q?.trim() ?? undefined,
    categoryId: filters.category && filters.category !== "all" ? filters.category : undefined,
    cityId: filters.city && filters.city !== "all" ? filters.city : undefined,
  };

  const {
    cities,
    regions,
    categories,
    categoryCounts,
    visitCityIndex,
    featuredVisitCity,
    globalSettings,
  } = await getDirectoryReferenceData(contentLocale);

  const supabase = createPublicServerClient();
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
    visitCityIndex,
    featuredVisitCity,
    globalSettings,
    filters,
    locale: contentLocale,
  };
}
