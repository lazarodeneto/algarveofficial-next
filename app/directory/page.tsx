export const dynamic = 'force-dynamic'; // Server-render on demand — never pre-build
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import type { Tables } from "@/integrations/supabase/types";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import {
  buildMergedCategoryOptions,
  getMergedCategoryBySlug,
  inferCategorySlugsFromSearch,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";
const DIRECTORY_CMS_KEYS = [CMS_GLOBAL_SETTING_KEYS.textOverrides, CMS_GLOBAL_SETTING_KEYS.pageConfigs] as const;

const PUBLIC_LISTING_FIELDS = `
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
  owner_id,
  latitude,
  longitude,
  address,
  website_url,
  facebook_url,
  instagram_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  google_business_url,
  google_rating,
  google_review_count,
  tags,
  category_data,
  view_count,
  published_at,
  created_at,
  updated_at
`;

const PUBLIC_CITY_FIELDS =
  "id, name, slug, short_description, image_url, latitude, longitude, is_featured, is_active, display_order";
const PUBLIC_REGION_FIELDS = "id, name, slug, short_description, image_url, is_featured, is_active, display_order";
const PUBLIC_CATEGORY_FIELDS =
  "id, name, slug, icon, short_description, image_url, is_featured, is_active, display_order";

type SearchParamRecord = Record<string, string | string[] | undefined>;
type CityRow = Tables<"cities">;
type RegionRow = Tables<"regions">;
type CategoryRow = Tables<"categories">;
type ListingRow = Tables<"listings">;

type ListingWithRelations = ListingRow & {
  city?: Tables<"cities"> | null;
  region?: Tables<"regions"> | null;
  category?: Tables<"categories"> | null;
};

interface DirectoryInitialFilters {
  q: string;
  city: string;
  region: string;
  category: string;
  tier: string;
}

interface DirectoryPageProps {
  searchParams?: Promise<SearchParamRecord>;
}

function readSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }

  return (value ?? "").trim();
}

function normalizeDirectoryFilters(searchParams?: SearchParamRecord): DirectoryInitialFilters {
  return {
    q: readSearchParam(searchParams?.q),
    city: readSearchParam(searchParams?.city) || "all",
    region: readSearchParam(searchParams?.region) || "all",
    category: readSearchParam(searchParams?.category) || "all",
    tier: readSearchParam(searchParams?.tier) || "all",
  };
}

function serializeDirectoryFilters(filters: DirectoryInitialFilters) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.city !== "all") params.set("city", filters.city);
  if (filters.region !== "all") params.set("region", filters.region);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.tier !== "all") params.set("tier", filters.tier);

  return params.toString();
}

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function sanitizeSearchTerm(raw: string) {
  return raw.replace(/[,%(){}'"]/g, " ").replace(/\s+/g, " ").trim();
}

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key.trim()] = value;
    }
  });

  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const normalizedPage: CmsPageConfigMap[string] = {};

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: NonNullable<CmsPageConfigMap[string]["blocks"]> = {};

      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isPlainRecord(rawBlock)) return;

        const block: NonNullable<NonNullable<CmsPageConfigMap[string]["blocks"]>[string]> = {};
        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;
        blocks[blockId] = block;
      });

      normalizedPage.blocks = blocks;
    }

    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      normalizedPage.text = text;
    }

    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      normalizedPage.meta = meta;
    }

    out[pageId] = normalizedPage;
  });

  return out;
}

function createDirectoryCmsHelpers(globalSettings: GlobalSetting[]) {
  const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value ?? "";
    return acc;
  }, {});

  const textOverrides = normalizeTextOverrides(
    parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
  );
  const pageConfigs = normalizePageConfigs(parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}));
  const pageConfig = pageConfigs.directory ?? {};
  const blocks = pageConfig.blocks ?? {};
  const pageText = pageConfig.text ?? {};

  const getText = (textKey: string, fallback: string) =>
    pageText[textKey] ?? textOverrides[`directory.${textKey}`] ?? textOverrides[textKey] ?? fallback;

  const getMetaTitle = (fallback: string) => pageConfig.meta?.title ?? getText("meta.title", fallback);
  const getMetaDescription = (fallback: string) =>
    pageConfig.meta?.description ?? getText("meta.description", fallback);
  const isBlockEnabled = (blockId: string, fallback = true) => {
    const configured = blocks[blockId]?.enabled;
    return typeof configured === "boolean" ? configured : fallback;
  };

  return {
    getText,
    getMetaTitle,
    getMetaDescription,
    isBlockEnabled,
  };
}

function resolveSelectedEntityId<T extends { id: string; slug: string }>(rows: T[], value?: string) {
  if (!value || value === "all") return undefined;
  const match = rows.find((row) => row.id === value || row.slug === value);
  return match?.id ?? value;
}

function resolveSearchCategoryIds(search: string | undefined, categories: CategoryRow[]) {
  if (!search?.trim()) return [];

  const term = sanitizeSearchTerm(search);
  if (!term) return [];

  const lower = term.toLowerCase();
  const ids = new Set<string>();

  categories.forEach((category) => {
    const haystack = [category.name, category.slug, category.short_description].filter(Boolean).join(" ").toLowerCase();
    if (haystack.includes(lower)) {
      ids.add(category.id);
    }
  });

  const inferredSlugs = inferCategorySlugsFromSearch(term);
  categories.forEach((category) => {
    if (inferredSlugs.includes(category.slug)) {
      ids.add(category.id);
    }
  });

  return Array.from(ids);
}

function buildDirectoryPath(filters: DirectoryInitialFilters, categoryOnly = false) {
  const params = new URLSearchParams();

  if (!categoryOnly && filters.q) params.set("q", filters.q);
  if (!categoryOnly && filters.city !== "all") params.set("city", filters.city);
  if (!categoryOnly && filters.region !== "all") params.set("region", filters.region);
  if (filters.category !== "all") params.set("category", filters.category);
  if (!categoryOnly && filters.tier !== "all") params.set("tier", filters.tier);

  const query = params.toString();
  return query ? `/directory?${query}` : "/directory";
}

function buildDirectoryViewModel(data: Awaited<ReturnType<typeof loadDirectoryPageData>>) {
  const cms = createDirectoryCmsHelpers(data.globalSettings);
  const mergedCategories = buildMergedCategoryOptions(data.categories);
  const selectedCategoryItem =
    data.initialFilters.category !== "all"
      ? getMergedCategoryBySlug(
          resolveCategoryFilterSlug(data.initialFilters.category, data.categories, mergedCategories),
          mergedCategories,
        )
      : null;
  const selectedRegionItem = data.regions.find(
    (region) => region.id === data.initialFilters.region || region.slug === data.initialFilters.region,
  );
  const selectedCityItem = data.cities.find(
    (city) => city.id === data.initialFilters.city || city.slug === data.initialFilters.city,
  );
  const selectedTierLabel =
    data.initialFilters.tier === "signature"
      ? "Signature"
      : data.initialFilters.tier === "verified"
        ? "Verified"
        : undefined;
  const activeSeoSegments = [
    selectedCategoryItem?.name,
    selectedCityItem?.name,
    selectedRegionItem?.name,
    selectedTierLabel,
    data.initialFilters.q ? `"${data.initialFilters.q}"` : undefined,
  ].filter((segment): segment is string => Boolean(segment));

  const fallbackTitle = "Algarve Luxury Directory: Villas, Dining & Experiences | AlgarveOfficial";
  const seoTitle =
    activeSeoSegments.length > 0
      ? `${activeSeoSegments.join(" · ")} | Algarve Luxury Directory | AlgarveOfficial`
      : fallbackTitle;
  const seoDescription =
    activeSeoSegments.length > 0
      ? `Browse ${activeSeoSegments.join(", ")} in the Algarve, Portugal. Explore curated listings with filters for city, region, category, and tier.`
      : "Browse luxury accommodation, restaurants, things to do, events, and concierge services in the Algarve, Portugal with advanced directory filters.";

  const hasSearchQuery = Boolean(data.initialFilters.q.trim());
  const hasNonCategoryFilters =
    data.initialFilters.region !== "all" ||
    data.initialFilters.city !== "all" ||
    data.initialFilters.tier !== "all";
  const isCategoryLandingPage = data.initialFilters.category !== "all" && !hasSearchQuery && !hasNonCategoryFilters;
  const canonicalPath = isCategoryLandingPage ? buildDirectoryPath(data.initialFilters, true) : "/directory";

  return {
    cms,
    selectedCategoryItem,
    selectedRegionItem,
    selectedCityItem,
    activeSeoSegments,
    seoTitle,
    seoDescription,
    hasSearchQuery,
    hasNonCategoryFilters,
    isCategoryLandingPage,
    canonicalPath,
  };
}

async function fetchCategoryCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const pageSize = 1000;
  let from = 0;
  const counts: Record<string, number> = {};

  while (true) {
    const { data, error } = await supabase
      .from("listings")
      .select("id, category_id")
      .eq("status", "published")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const page = (data ?? []) as Array<Pick<Tables<"listings">, "id" | "category_id">>;
    page.forEach((listing) => {
      counts[listing.category_id] = (counts[listing.category_id] ?? 0) + 1;
    });

    if (page.length < pageSize) break;
    from += pageSize;
  }

  return counts;
}

async function fetchFilteredListings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: DirectoryInitialFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
) {
  const mergedCategories = buildMergedCategoryOptions(categories);
  const normalizedCategory =
    filters.category !== "all" ? resolveCategoryFilterSlug(filters.category, categories, mergedCategories) : null;
  const selectedCategoryItem = normalizedCategory
    ? getMergedCategoryBySlug(normalizedCategory, mergedCategories)
    : null;
  const selectedCategoryIds = selectedCategoryItem?.memberIds ?? [];
  const selectedCityId = resolveSelectedEntityId(cities, filters.city);
  const selectedRegionId = resolveSelectedEntityId(regions, filters.region);
  const matchingCategoryIds = resolveSearchCategoryIds(filters.q, categories);

  let query = supabase
    .from("listings")
    .select(`
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(50);

  if (selectedCategoryIds.length > 0) {
    query = query.in("category_id", selectedCategoryIds);
  }

  if (selectedCityId) {
    query = query.eq("city_id", selectedCityId);
  }

  if (selectedRegionId) {
    query = query.eq("region_id", selectedRegionId);
  }

  if (filters.tier !== "all") {
    query = query.eq("tier", filters.tier);
  }

  if (filters.q.trim()) {
    const term = sanitizeSearchTerm(filters.q);
    const tagTokens = term
      .toLowerCase()
      .split(" ")
      .map((token) => token.replace(/[^a-z0-9_-]/gi, ""))
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

    if (matchingCategoryIds.length > 0) {
      searchClauses.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    }

    query = query.or(searchClauses.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };

  return [...listings].sort((left, right) => (tierOrder[left.tier] ?? 2) - (tierOrder[right.tier] ?? 2));
}

const loadDirectoryPageData = cache(async (serializedFilters: string) => {
  const initialFilters = normalizeDirectoryFilters(Object.fromEntries(new URLSearchParams(serializedFilters).entries()));
  const supabase = await createClient();

  const globalSettingsPromise = supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...DIRECTORY_CMS_KEYS])
    .order("key", { ascending: true });

  const citiesPromise = supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const regionsPromise = supabase
    .from("regions")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const categoriesPromise = supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  const categoryCountsPromise = fetchCategoryCounts(supabase);
  const listingsPromise = (async () => {
    const [citiesResponse, regionsResponse, categoriesResponse] = await Promise.all([
      citiesPromise,
      regionsPromise,
      categoriesPromise,
    ]);

    if (citiesResponse.error) throw citiesResponse.error;
    if (regionsResponse.error) throw regionsResponse.error;
    if (categoriesResponse.error) throw categoriesResponse.error;

    return fetchFilteredListings(
      supabase,
      initialFilters,
      (categoriesResponse.data ?? []) as CategoryRow[],
      (citiesResponse.data ?? []) as CityRow[],
      (regionsResponse.data ?? []) as RegionRow[],
    );
  })();

  const [
    globalSettingsResponse,
    citiesResponse,
    regionsResponse,
    categoriesResponse,
    listings,
    categoryCounts,
  ] = await Promise.all([
    globalSettingsPromise,
    citiesPromise,
    regionsPromise,
    categoriesPromise,
    listingsPromise,
    categoryCountsPromise,
  ]);

  if (globalSettingsResponse.error) throw globalSettingsResponse.error;
  if (citiesResponse.error) throw citiesResponse.error;
  if (regionsResponse.error) throw regionsResponse.error;
  if (categoriesResponse.error) throw categoriesResponse.error;

  return {
    initialFilters,
    globalSettings: (globalSettingsResponse.data ?? []) as GlobalSetting[],
    cities: (citiesResponse.data ?? []) as CityRow[],
    regions: (regionsResponse.data ?? []) as RegionRow[],
    categories: (categoriesResponse.data ?? []) as CategoryRow[],
    listings,
    categoryCounts,
  };
});

export async function generateMetadata({ searchParams }: DirectoryPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = normalizeDirectoryFilters(resolvedSearchParams);
  const data = await loadDirectoryPageData(serializeDirectoryFilters(filters));
  const viewModel = buildDirectoryViewModel(data);

  return buildMetadata({
    title: viewModel.cms.getMetaTitle(viewModel.seoTitle),
    description: viewModel.cms.getMetaDescription(viewModel.seoDescription),
    path: viewModel.canonicalPath,
    noIndex: viewModel.hasSearchQuery || viewModel.hasNonCategoryFilters,
  });
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = normalizeDirectoryFilters(resolvedSearchParams);
  const data = await loadDirectoryPageData(serializeDirectoryFilters(filters));
  const viewModel = buildDirectoryViewModel(data);
  const activeFilterLabels = [
    viewModel.selectedCategoryItem?.name,
    viewModel.selectedCityItem?.name,
    viewModel.selectedRegionItem?.name,
    filters.tier !== "all" ? filters.tier : undefined,
    filters.q ? `"${filters.q}"` : undefined,
  ].filter((label): label is string => Boolean(label));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: viewModel.selectedCategoryItem
      ? `${viewModel.selectedCategoryItem.name} Listings in the Algarve`
      : "Algarve Directory Listings",
    url: `${SITE_URL}${viewModel.canonicalPath}`,
    itemListElement: data.listings.slice(0, 50).map((listing, index) => ({
      image: (() => {
        const listingImage = normalizePublicImageUrl(listing.featured_image_url);
        return listingImage ? absoluteUrl(listingImage) : undefined;
      })(),
      "@type": "ListItem",
      position: index + 1,
      name: listing.name,
      url: `${SITE_URL}/listing/${listing.slug}`,
      description: listing.short_description || listing.description || undefined,
    })),
  };

  // Phase 3 i18n server fetching should add:
  // listing_translations, city_translations, region_translations, and category_translations.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div id="directory-server-shell" className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/60 bg-[var(--colour-ink)] text-white">
          <div className="app-container flex items-center justify-between py-5">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              <span className="text-gradient-gold">Algarve</span>
              <span className="text-white">Official</span>
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              <Link href="/directory" className="hover:text-primary">
                Directory
              </Link>
              <Link href="/destinations" className="hover:text-primary">
                Destinations
              </Link>
              <Link href="/events" className="hover:text-primary">
                Events
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main>
          {viewModel.cms.isBlockEnabled("hero", true) ? (
            <section className="bg-[var(--colour-ink)] pb-16 pt-20 text-white sm:pt-24 lg:pb-20 lg:pt-28">
              <div className="app-container">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  {viewModel.cms.getText("heroLabel", "Directory")}
                </p>
                <h1 className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-tight sm:text-6xl">
                  {viewModel.cms.getText("title", "Algarve Luxury Directory")}
                </h1>
                <p className="mt-6 max-w-3xl text-lg text-white/75">
                  {viewModel.cms.getText(
                    "subtitle",
                    "Discover villas, dining, golf, events and the Algarve's most sought-after experiences in one curated directory.",
                  )}
                </p>
                {activeFilterLabels.length > 0 ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {activeFilterLabels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm text-white/90"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <div className="app-container content-max py-12">
            {viewModel.cms.isBlockEnabled("filters", true) ? (
              <section className="mb-10 rounded-[24px] border border-border/70 bg-card/40 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Search snapshot</p>
                    <h2 className="mt-3 font-serif text-3xl font-medium text-foreground">Filtered for first paint</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      The interactive filters load after hydration. Search engines can already see the current result set and page structure in the server response.
                    </p>
                  </div>
                  <Link
                    href={buildDirectoryPath(filters)}
                    className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    Open filtered view
                  </Link>
                </div>
              </section>
            ) : null}

            {viewModel.cms.isBlockEnabled("results", true) ? (
              <section>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Results</p>
                    <h2 className="mt-3 font-serif text-3xl font-medium text-foreground">
                      {data.listings.length > 0 ? "Visible listings in the public directory" : "No listings matched this search"}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {data.listings.length} result{data.listings.length === 1 ? "" : "s"} in the current server-rendered view.
                    </p>
                  </div>
                  <Link
                    href={filters.q || filters.city !== "all" || filters.region !== "all" || filters.category !== "all" || filters.tier !== "all"
                      ? `/map?${serializeDirectoryFilters(filters)}`
                      : "/map"}
                    className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    View on map
                  </Link>
                </div>

                {data.listings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {data.listings.map((listing) => {
                      const listingImage = normalizePublicImageUrl(listing.featured_image_url);

                      return (
                        <Link
                          key={listing.id}
                          href={`/listing/${listing.slug}`}
                          className="glass-box glass-box-listing-shimmer block overflow-hidden"
                        >
                          <div className="relative aspect-square bg-muted">
                            {listingImage ? (
                              <Image
                                src={listingImage}
                                alt={listing.name}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                              {listing.category?.name || "Directory Listing"}
                            </p>
                            <h3 className="mt-3 font-serif text-2xl font-medium text-foreground">{listing.name}</h3>
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                              {listing.short_description || listing.description || "Curated Algarve listing."}
                            </p>
                            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {listing.city?.name || "Algarve"}
                              {listing.region?.name ? ` · ${listing.region.name}` : ""}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-border/70 bg-card/40 p-10 text-center">
                    <h3 className="font-serif text-2xl font-medium text-foreground">No listings matched these filters</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Try clearing one or more filters once the interactive client loads, or return to the full directory.
                    </p>
                    <Link
                      href="/directory"
                      className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                    >
                      Browse the full directory
                    </Link>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </main>

        <footer className="border-t border-border/60 bg-card/40 py-10">
          <div className="app-container flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>AlgarveOfficial</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about-us" className="hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="hover:text-primary">
                Contact
              </Link>
              <Link href="/privacy-policy" className="hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
      <DirectoryClient
        initialListings={data.listings}
        initialCities={data.cities}
        initialRegions={data.regions}
        initialCategories={data.categories}
        initialCategoryCounts={data.categoryCounts}
        initialFilters={data.initialFilters}
        globalSettings={data.globalSettings}
      />
    </>
  );
}
