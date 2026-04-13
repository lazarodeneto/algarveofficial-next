import { dehydrate, type QueryClient } from "@tanstack/react-query";
import type { CityRow, RegionRow, CategoryRow } from "@/hooks/useReferenceData";
import type { ListingWithRelations } from "@/hooks/useListings";
import type { Tables } from "@/integrations/supabase/types";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import type { CuratedListingWithRelations } from "@/hooks/useCuratedAssignments";
import { HERO_OVERLAY_INTENSITY_SETTING_KEY } from "@/lib/heroOverlay";
import { HOME_QUICK_LINK_SETTING_KEYS } from "@/lib/homeQuickLinks";
import type { Locale } from "@/lib/i18n/config";
import {
  categoriesQueryKey,
  citiesQueryKey,
  curatedAssignmentsQueryKey,
  globalSettingsQueryKey,
  homepageSettingsQueryKey,
  publishedListingsQueryKey,
  regionListingCountsQueryKey,
  regionsQueryKey,
} from "@/lib/query-keys";
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";
import { createAppQueryClient } from "@/lib/react-query";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const PUBLIC_LISTING_FIELDS =
  "id, slug, name, short_description, description, tier, status, latitude, longitude, featured_image_url, google_rating, google_review_count, created_at";
const PUBLIC_CITY_FIELDS = "id, slug, name, short_description, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, slug, name, short_description";
const PUBLIC_CATEGORY_FIELDS = "id, slug, name, icon, image_url";
const HOMEPAGE_REGION_FIELDS =
  "id, name, slug, short_description, description, image_url, hero_image_url, is_active, is_featured, is_visible_destinations, display_order, created_at";
const HOMEPAGE_CATEGORY_FIELDS =
  "id, name, slug, short_description, description, icon, image_url, is_active, is_featured, display_order, created_at";
const HOMEPAGE_CITY_FIELDS =
  "id, name, slug, short_description, description, image_url, hero_image_url, latitude, longitude, is_active, is_featured, display_order, created_at";
function getServerSupabase() {
  return createPublicServerClient();
}

function normalizeHomepageLocale(language: string | undefined): Locale {
  return normalizePublicContentLocale(language ?? "en") as Locale;
}

function getLocalizedValue(
  translated: string | null | undefined,
): string | null {
  const trimmed = translated?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function getLocalizedRequiredValue(
  translated: string | null | undefined,
  fallback: string,
  hasTranslation: boolean,
): string {
  const localized = getLocalizedValue(translated);
  if (localized) return localized;
  return hasTranslation ? "" : fallback;
}

function getLocalizedOptionalValue(
  translated: string | null | undefined,
  fallback: string | null,
  hasTranslation: boolean,
): string | null {
  const localized = getLocalizedValue(translated);
  if (localized) return localized;
  return hasTranslation ? null : fallback;
}

function mergeListingLocalizations(
  listings: ListingWithRelations[],
  listingTranslations: Awaited<ReturnType<typeof fetchListingTranslations>>,
  cityTranslations: Awaited<ReturnType<typeof fetchCityTranslations>>,
  regionTranslations: Awaited<ReturnType<typeof fetchRegionTranslations>>,
  categoryTranslations: Awaited<ReturnType<typeof fetchCategoryTranslations>>,
) {
  const listingTranslationMap = new Map(
    listingTranslations.map((translation) => [translation.listing_id, translation]),
  );
  const cityTranslationMap = new Map(
    cityTranslations.map((translation) => [translation.city_id, translation]),
  );
  const regionTranslationMap = new Map(
    regionTranslations.map((translation) => [translation.region_id, translation]),
  );
  const categoryTranslationMap = new Map(
    categoryTranslations.map((translation) => [translation.category_id, translation]),
  );

  return listings.map((listing) => {
    const listingTranslation = listingTranslationMap.get(listing.id);
    const cityTranslation = listing.city?.id ? cityTranslationMap.get(listing.city.id) : undefined;
    const regionTranslation = listing.region?.id ? regionTranslationMap.get(listing.region.id) : undefined;
    const categoryTranslation = listing.category?.id
      ? categoryTranslationMap.get(listing.category.id)
      : undefined;
    const hasListingTranslation = Boolean(listingTranslation);
    const hasCityTranslation = Boolean(cityTranslation);
    const hasRegionTranslation = Boolean(regionTranslation);
    const hasCategoryTranslation = Boolean(categoryTranslation);

    return {
      ...listing,
      name: getLocalizedRequiredValue(listingTranslation?.title, listing.name, hasListingTranslation),
      short_description: getLocalizedOptionalValue(
        listingTranslation?.short_description,
        listing.short_description,
        hasListingTranslation,
      ),
      description: getLocalizedOptionalValue(
        listingTranslation?.description,
        listing.description,
        hasListingTranslation,
      ),
      city: listing.city
        ? {
            ...listing.city,
            name: getLocalizedRequiredValue(cityTranslation?.name, listing.city.name, hasCityTranslation),
            short_description: getLocalizedOptionalValue(
              cityTranslation?.short_description,
              listing.city.short_description,
              hasCityTranslation,
            ),
            description: getLocalizedOptionalValue(
              cityTranslation?.description,
              listing.city.description,
              hasCityTranslation,
            ),
          }
        : listing.city,
      region: listing.region
        ? {
            ...listing.region,
            name: getLocalizedRequiredValue(
              regionTranslation?.name,
              listing.region.name,
              hasRegionTranslation,
            ),
            short_description: getLocalizedOptionalValue(
              regionTranslation?.short_description,
              listing.region.short_description,
              hasRegionTranslation,
            ),
            description: getLocalizedOptionalValue(
              regionTranslation?.description,
              listing.region.description,
              hasRegionTranslation,
            ),
          }
        : listing.region,
      category: listing.category
        ? {
            ...listing.category,
            name: getLocalizedRequiredValue(
              categoryTranslation?.name,
              listing.category.name,
              hasCategoryTranslation,
            ),
            short_description: getLocalizedOptionalValue(
              categoryTranslation?.short_description,
              listing.category.short_description,
              hasCategoryTranslation,
            ),
          }
        : listing.category,
    };
  });
}

type HomepageSettingsLike = Pick<
  Tables<"homepage_settings">,
  | "id"
  | "hero_video_url"
  | "hero_youtube_url"
  | "hero_poster_url"
  | "hero_media_type"
  | "hero_overlay_intensity"
  | "hero_autoplay"
  | "hero_loop"
  | "hero_muted"
  | "hero_title"
  | "hero_subtitle"
  | "hero_cta_primary_text"
  | "hero_cta_primary_link"
  | "hero_cta_secondary_text"
  | "hero_cta_secondary_link"
  | "show_regions_section"
  | "show_categories_section"
  | "show_cities_section"
  | "show_vip_section"
  | "show_curated_section"
  | "show_all_listings_section"
  | "show_cta_section"
  | "section_order"
  | "updated_at"
>;

interface HomePageTranslations {
  locale: string;
  status: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
}

export interface HomePageData {
  homepageSettings: HomepageSettingsLike | null;
  regions: RegionRow[];
  categories: CategoryRow[];
  allCategories: CategoryRow[];
  cities: CityRow[];
  regionListingCounts: Record<string, number>;
  listings: ListingWithRelations[];
  curatedAssignments: CuratedListingWithRelations[];
  globalSettings: GlobalSetting[];
  locale: Locale;
}

async function fetchHomepageSettingsWithTranslation(
  supabase: ReturnType<typeof getServerSupabase>,
  locale: string,
): Promise<HomepageSettingsLike | null> {
  const { data, error } = await supabase
    .from("homepage_settings")
    // Use "*" here because live environments can lag behind generated types.
    // A missing optional column should not blank the entire homepage hero.
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  if (locale !== "en") {
    const { data: translation } = await supabase
      .from("homepage_settings_translations")
      .select(
        "locale, status, hero_title, hero_subtitle, hero_cta_primary_text, hero_cta_secondary_text",
      )
      .eq("settings_id", data.id)
      .eq("locale", locale)
      .maybeSingle();

    if (translation) {
      const t = translation as HomePageTranslations;
      return {
        ...data,
        hero_title: getLocalizedValue(t.hero_title),
        hero_subtitle: getLocalizedValue(t.hero_subtitle),
        hero_cta_primary_text: getLocalizedValue(t.hero_cta_primary_text),
        hero_cta_secondary_text: getLocalizedValue(t.hero_cta_secondary_text),
      } satisfies HomepageSettingsLike;
    }
  }

  return data as HomepageSettingsLike;
}

async function fetchRegions(supabase: ReturnType<typeof getServerSupabase>): Promise<RegionRow[]> {
  const { data, error } = await supabase
    .from("regions")
    .select(HOMEPAGE_REGION_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as RegionRow[];
}

async function fetchCategories(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(HOMEPAGE_CATEGORY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as CategoryRow[];
}

async function fetchCities(supabase: ReturnType<typeof getServerSupabase>): Promise<CityRow[]> {
  const { data, error } = await supabase
    .from("cities")
    .select(HOMEPAGE_CITY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as CityRow[];
}

async function fetchPublishedListings(
  supabase: ReturnType<typeof getServerSupabase>,
  locale: Locale,
): Promise<ListingWithRelations[]> {
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) return [];

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
  const sortedListings = listings.sort(
    (a, b) => (tierOrder[a.tier] ?? 2) - (tierOrder[b.tier] ?? 2),
  );

  if (locale === "en" || sortedListings.length === 0) {
    return sortedListings;
  }

  const listingIds = sortedListings.map((listing) => listing.id);
  const cityIds = sortedListings.map((listing) => listing.city?.id).filter(Boolean) as string[];
  const regionIds = sortedListings.map((listing) => listing.region?.id).filter(Boolean) as string[];
  const categoryIds = sortedListings.map((listing) => listing.category?.id).filter(Boolean) as string[];

  const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] =
    await Promise.all([
      fetchListingTranslations(locale, listingIds),
      fetchCityTranslations(locale, cityIds),
      fetchRegionTranslations(locale, regionIds),
      fetchCategoryTranslations(locale, categoryIds),
    ]);

  return mergeListingLocalizations(
    sortedListings,
    listingTranslations,
    cityTranslations,
    regionTranslations,
    categoryTranslations,
  );
}

async function fetchCuratedAssignments(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<CuratedListingWithRelations[]> {
  const { data, error } = await supabase
    .from("curated_assignments")
    .select(
      `
      *,
      listing:listings(
        ${PUBLIC_LISTING_FIELDS},
        city:cities(${PUBLIC_CITY_FIELDS}),
        region:regions(${PUBLIC_REGION_FIELDS}),
        category:categories(${PUBLIC_CATEGORY_FIELDS})
      )
    `,
    )
    .eq("context_type", "homepage")
    .order("display_order", { ascending: true })
    .limit(4);

  if (error) return [];
  return (data ?? []) as unknown as CuratedListingWithRelations[];
}

async function fetchGlobalSettings(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<GlobalSetting[]> {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .eq("category", "homepage");

  if (error) return [];
  return (data ?? []) as GlobalSetting[];
}

async function fetchRegionListingCounts(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("listings")
    .select("region_id")
    .eq("status", "published")
    .not("region_id", "is", null);

  if (error) return {};

  return (data ?? []).reduce<Record<string, number>>((counts, row) => {
    if (row.region_id) {
      counts[row.region_id] = (counts[row.region_id] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export async function getHomePageData(locale?: string): Promise<HomePageData> {
  const resolvedLocale = normalizeHomepageLocale(locale ?? "en");
  const supabase = getServerSupabase();

  const [
    homepageSettings,
    regions,
    categories,
    cities,
    regionListingCounts,
    publishedListings,
    curatedAssignments,
    globalSettings,
  ] =
    await Promise.all([
      fetchHomepageSettingsWithTranslation(supabase, resolvedLocale),
      fetchRegions(supabase),
      fetchCategories(supabase),
      fetchCities(supabase),
      fetchRegionListingCounts(supabase),
      fetchPublishedListings(supabase, resolvedLocale),
      fetchCuratedAssignments(supabase),
      fetchGlobalSettings(supabase),
    ]);

  return {
    homepageSettings,
    regions,
    categories,
    allCategories: categories,
    cities,
    regionListingCounts,
    listings: publishedListings,
    curatedAssignments,
    globalSettings,
    locale: resolvedLocale,
  };
}

export async function getDehydratedHomePageState(locale?: string): Promise<{
  dehydratedState: ReturnType<typeof dehydrate>;
  queryClient: QueryClient;
}> {
  const data = await getHomePageData(locale);
  const queryClient = createAppQueryClient();

  queryClient.setQueryData(homepageSettingsQueryKey(data.locale), data.homepageSettings);
  queryClient.setQueryData(regionsQueryKey(data.locale), data.regions);
  queryClient.setQueryData(categoriesQueryKey(data.locale), data.categories);
  queryClient.setQueryData(citiesQueryKey(data.locale), data.cities);
  queryClient.setQueryData(regionListingCountsQueryKey(), data.regionListingCounts);
  queryClient.setQueryData(
    publishedListingsQueryKey({}, data.locale),
    data.listings,
  );
  queryClient.setQueryData(
    curatedAssignmentsQueryKey("homepage", null, 4),
    data.curatedAssignments,
  );
  queryClient.setQueryData(
    globalSettingsQueryKey(HOME_QUICK_LINK_SETTING_KEYS, "default"),
    data.globalSettings.filter((setting) => HOME_QUICK_LINK_SETTING_KEYS.includes(setting.key)),
  );
  queryClient.setQueryData(
    globalSettingsQueryKey([HERO_OVERLAY_INTENSITY_SETTING_KEY], "default"),
    data.globalSettings.filter((setting) => setting.key === HERO_OVERLAY_INTENSITY_SETTING_KEY),
  );

  const dehydratedState = dehydrate(queryClient);
  return { dehydratedState, queryClient };
}
