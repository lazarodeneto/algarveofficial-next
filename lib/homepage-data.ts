import { createClient } from "@supabase/supabase-js";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { CityRow, RegionRow, CategoryRow } from "@/hooks/useReferenceData";
import type { ListingWithRelations } from "@/hooks/useListings";
import type { Tables } from "@/integrations/supabase/types";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import type { CuratedListingWithRelations } from "@/hooks/useCuratedAssignments";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_LISTING_FIELDS =
  "id, slug, name, short_description, description, tier, status, latitude, longitude, featured_image_url, google_rating, google_review_count, created_at";
const PUBLIC_CITY_FIELDS = "id, slug, name, short_description, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, slug, name, short_description";
const PUBLIC_CATEGORY_FIELDS = "id, slug, name, icon, image_url";

function getServerSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

function normalizePublicContentLocale(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (!normalized) return "en";
  if (normalized === "pt") return "pt-pt";
  if (normalized.startsWith("pt-pt")) return "pt-pt";
  if (["de", "fr", "es", "it", "nl", "sv", "no", "da"].includes(normalized)) return normalized;
  return "en";
}

function normalizeHomepageLocale(language: string | undefined): string {
  return normalizePublicContentLocale(language ?? "en");
}

function preferTranslatedValue(
  translated: string | null | undefined,
  fallback: string | null,
): string | null {
  const trimmed = translated?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
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
  listings: ListingWithRelations[];
  curatedAssignments: CuratedListingWithRelations[];
  globalSettings: GlobalSetting[];
  locale: string;
}

async function fetchHomepageSettingsWithTranslation(
  supabase: ReturnType<typeof getServerSupabase>,
  locale: string,
): Promise<HomepageSettingsLike | null> {
  const { data, error } = await supabase
    .from("homepage_settings")
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
        hero_title: preferTranslatedValue(t.hero_title, data.hero_title),
        hero_subtitle: preferTranslatedValue(t.hero_subtitle, data.hero_subtitle),
        hero_cta_primary_text: preferTranslatedValue(
          t.hero_cta_primary_text,
          data.hero_cta_primary_text,
        ),
        hero_cta_secondary_text: preferTranslatedValue(
          t.hero_cta_secondary_text,
          data.hero_cta_secondary_text,
        ),
      } satisfies HomepageSettingsLike;
    }
  }

  return data as HomepageSettingsLike;
}

async function fetchRegions(supabase: ReturnType<typeof getServerSupabase>): Promise<RegionRow[]> {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as RegionRow[];
}

async function fetchCategories(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as CategoryRow[];
}

async function fetchCities(supabase: ReturnType<typeof getServerSupabase>): Promise<CityRow[]> {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as CityRow[];
}

async function fetchSignatureListings(
  supabase: ReturnType<typeof getServerSupabase>,
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
    .eq("tier", "signature")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as unknown as ListingWithRelations[];
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
    .eq("context_type", "home")
    .order("position", { ascending: true })
    .limit(4);

  if (error) return [];
  return (data ?? []) as unknown as CuratedListingWithRelations[];
}

async function fetchGlobalSettings(
  supabase: ReturnType<typeof getServerSupabase>,
): Promise<GlobalSetting[]> {
  const { data, error } = await supabase
    .from("global_settings")
    .select("*")
    .eq("category", "homepage");

  if (error) return [];
  return (data ?? []) as GlobalSetting[];
}

export async function getHomePageData(locale?: string): Promise<HomePageData> {
  const resolvedLocale = normalizeHomepageLocale(locale ?? "en");
  const supabase = getServerSupabase();

  const [homepageSettings, regions, categories, cities, signatureListings, curatedAssignments, globalSettings] =
    await Promise.all([
      fetchHomepageSettingsWithTranslation(supabase, resolvedLocale),
      fetchRegions(supabase),
      fetchCategories(supabase),
      fetchCities(supabase),
      fetchSignatureListings(supabase),
      fetchCuratedAssignments(supabase),
      fetchGlobalSettings(supabase),
    ]);

  return {
    homepageSettings,
    regions,
    categories,
    allCategories: categories,
    cities,
    listings: signatureListings,
    curatedAssignments,
    globalSettings,
    locale: resolvedLocale,
  };
}

export async function getDehydratedHomePageState(): Promise<{
  dehydratedState: ReturnType<typeof dehydrate>;
  queryClient: QueryClient;
}> {
  const data = await getHomePageData();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
      },
    },
  });

  if (data.homepageSettings) {
    queryClient.setQueryData(["homepage-settings"], data.homepageSettings);
  }
  if (data.listings.length > 0) {
    queryClient.setQueryData(["listings", "signature", data.locale], data.listings);
  }
  if (data.globalSettings.length > 0) {
    queryClient.setQueryData(["global-settings", "homepage"], data.globalSettings);
  }
  if (data.regions.length > 0) {
    queryClient.setQueryData(["reference-data", "regions"], data.regions);
  }
  if (data.categories.length > 0) {
    queryClient.setQueryData(["reference-data", "categories"], data.categories);
  }
  if (data.cities.length > 0) {
    queryClient.setQueryData(["reference-data", "cities"], data.cities);
  }

  const dehydratedState = dehydrate(queryClient);
  return { dehydratedState, queryClient };
}
