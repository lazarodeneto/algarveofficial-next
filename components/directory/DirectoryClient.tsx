"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  Search,
  Filter,
  X,
  MapPin,
  Tag,
  Building2,
  Crown,
  ShieldCheck,
  ChevronDown,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import {
  CMS_GLOBAL_SETTING_KEYS,
  normalizeCmsPageConfigs,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import {
  buildMergedCategoryOptions,
  getMergedCategoryBySlug,
  inferCategorySlugsFromSearch,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { translateCategoryName } from "@/lib/translateCategory";
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useCityRegionMappings, type CityRow, type RegionRow, type CategoryRow } from "@/hooks/useReferenceData";
import type { ListingFilters, ListingWithRelations, ListingTier } from "@/hooks/useListings";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { CityHubsSection } from "@/components/shared/CityHubsSection";
import type { CityHubItem } from "@/components/shared/CityHubsSection";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import type { VisitCityIndexItem } from "@/lib/directory-data";
import { buildMunicipalityCityIndex } from "@/lib/cities/municipalityIndex";

const EMPTY_CATEGORY_IDS: string[] = [];
const DIRECTORY_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
] as const;
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

export interface DirectoryInitialFilters {
  q: string;
  city: string;
  region: string;
  category: string;
  tier: string;
}

export interface DirectoryClientProps {
  locale?: string;
  initialListings: ListingWithRelations[];
  initialCities: CityRow[];
  initialRegions: RegionRow[];
  initialCategories: CategoryRow[];
  initialCategoryCounts: Record<string, number>;
  visitCityIndex?: VisitCityIndexItem[];
  featuredVisitCity?: VisitCityIndexItem | null;
  initialFilters: DirectoryInitialFilters;
  globalSettings: GlobalSetting[];
  cmsPageId?: string;
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

function sanitizeSearchTerm(raw: string) {
  return raw.replace(/[,%(){}'"]/g, " ").replace(/\s+/g, " ").trim();
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
    const haystack = [category.name, category.slug, category.short_description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

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

interface ListingsFilterQuery {
  in: (column: string, values: readonly string[]) => this;
  eq: (column: string, value: unknown) => this;
  or: (filters: string) => this;
}

function applyListingFilters(
  query: ListingsFilterQuery,
  filters: ListingFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
): ListingsFilterQuery {
  const mergedCategories = buildMergedCategoryOptions(categories);

  // Handle multiple category filtering or single category
  let selectedCategoryIds: string[] = [];
  if (Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
    selectedCategoryIds = filters.categoryIds;
  } else if (filters.categoryId && filters.categoryId !== "all") {
    const normalizedCategory = resolveCategoryFilterSlug(filters.categoryId, categories, mergedCategories);
    const selectedCategoryItem = normalizedCategory
      ? getMergedCategoryBySlug(normalizedCategory, mergedCategories)
      : null;
    selectedCategoryIds = selectedCategoryItem?.memberIds ?? [];
  }

  if (selectedCategoryIds.length > 0) {
    query = query.in("category_id", selectedCategoryIds);
  }

  // Handle multiple city filtering (from municipalities) or single city
  if (Array.isArray(filters.cityIds) && filters.cityIds.length > 0) {
    query = query.in("city_id", filters.cityIds);
  } else {
    const selectedCityId = resolveSelectedEntityId(cities, filters.cityId);
    if (selectedCityId) {
      query = query.eq("city_id", selectedCityId);
    }
  }

  const selectedRegionId = resolveSelectedEntityId(regions, filters.regionId);
  if (selectedRegionId) {
    query = query.eq("region_id", selectedRegionId);
  }

  if (filters.tier && filters.tier !== ("all" as ListingTier)) {
    query = query.eq("tier", filters.tier);
  }

  if (filters.search?.trim()) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      const tagTokens = term
        .toLowerCase()
        .split(" ")
        .map((token) => token.replace(/[^a-z0-9_-]/gi, ""))
        .filter(Boolean)
        .slice(0, 5);

      const matchingCategoryIds = resolveSearchCategoryIds(term, categories);
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
  }

  return query;
}

async function fetchCities(locale: string) {
  const { data, error } = await supabase
    .from("cities")
    .select(DIRECTORY_CITY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);
  const cities = (data ?? []) as CityRow[];
  if (contentLocale === "en" || cities.length === 0) return cities;

  const translations = await fetchCityTranslations(contentLocale, cities.map((city) => city.id));
  const translationMap = new Map(translations.map((translation) => [translation.city_id, translation]));

  return cities.map((city) => {
    const translation = translationMap.get(city.id);
    if (!translation) return city;

    return {
      ...city,
      name: translation.name?.trim() || city.name,
      short_description: translation.short_description?.trim() || city.short_description,
      description: translation.description?.trim() || city.description,
    };
  });
}

async function fetchRegions(locale: string) {
  const { data, error } = await supabase
    .from("regions")
    .select(DIRECTORY_REGION_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);
  const regions = (data ?? []) as RegionRow[];
  if (contentLocale === "en" || regions.length === 0) return regions;

  const translations = await fetchRegionTranslations(contentLocale, regions.map((region) => region.id));
  const translationMap = new Map(translations.map((translation) => [translation.region_id, translation]));

  return regions.map((region) => {
    const translation = translationMap.get(region.id);
    if (!translation) return region;

    return {
      ...region,
      name: translation.name?.trim() || region.name,
      short_description: translation.short_description?.trim() || region.short_description,
      description: translation.description?.trim() || region.description,
    };
  });
}

async function fetchCategories(locale: string) {
  const { data, error } = await supabase
    .from("categories")
    .select(DIRECTORY_CATEGORY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);
  const categories = (data ?? []) as CategoryRow[];
  if (contentLocale === "en" || categories.length === 0) return categories;

  const translations = await fetchCategoryTranslations(contentLocale, categories.map((category) => category.id));
  const translationMap = new Map(translations.map((translation) => [translation.category_id, translation]));

  return categories.map((category) => {
    const translation = translationMap.get(category.id);
    if (!translation) return category;

    return {
      ...category,
      name: translation.name?.trim() || category.name,
      short_description: translation.short_description?.trim() || category.short_description,
      description: translation.description?.trim() || category.description,
    };
  });
}

async function fetchCategoryCounts() {
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

async function fetchListings(
  filters: ListingFilters,
  categories: CategoryRow[],
  cities: CityRow[],
  regions: RegionRow[],
  locale: string,
) {
  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);
  const publicListingFields = `
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
  const publicCityFields = "id, name, slug, short_description, image_url, latitude, longitude";
  const publicRegionFields = "id, name, slug, short_description, image_url";
  const publicCategoryFields = "id, name, slug, icon, short_description, image_url";

  const normalizedFilters: ListingFilters = {
    search: filters.search?.trim() || undefined,
    categoryId: filters.categoryId && filters.categoryId !== "all" ? filters.categoryId : undefined,
    categoryIds: Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
    cityId: filters.cityId && filters.cityId !== "all" ? filters.cityId : undefined,
    cityIds: Array.isArray(filters.cityIds) && filters.cityIds.length > 0 ? filters.cityIds : undefined,
    regionId: filters.regionId && filters.regionId !== "all" ? filters.regionId : undefined,
    tier: filters.tier && filters.tier !== ("all" as ListingTier) ? filters.tier : undefined,
  };

  const pageSize = 1000;
  let from = 0;
  const allListings: ListingWithRelations[] = [];

  while (true) {
    let query = supabase
      .from("listings")
      .select(`
        ${publicListingFields},
        city:cities(${publicCityFields}),
        region:regions(${publicRegionFields}),
        category:categories(${publicCategoryFields})
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    const filteredQuery = applyListingFilters(
      query as unknown as ListingsFilterQuery,
      normalizedFilters,
      categories,
      cities,
      regions,
    );
    query = filteredQuery as unknown as typeof query;

    const { data, error } = await query;
    if (error) throw error;

    const page = (data ?? []) as unknown as ListingWithRelations[];
    allListings.push(...page);

    if (page.length < pageSize) break;
    from += pageSize;
  }

  const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
  const sortedListings = allListings.sort((a, b) => (tierOrder[a.tier] ?? 2) - (tierOrder[b.tier] ?? 2));

  if (contentLocale === "en" || sortedListings.length === 0) {
    return sortedListings;
  }

  const listingIds = sortedListings.map((listing) => listing.id);
  const cityIds = sortedListings.map((listing) => listing.city?.id).filter(Boolean) as string[];
  const regionIds = sortedListings.map((listing) => listing.region?.id).filter(Boolean) as string[];
  const categoryIds = sortedListings.map((listing) => listing.category?.id).filter(Boolean) as string[];

  const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
    fetchListingTranslations(contentLocale, listingIds),
    fetchCityTranslations(contentLocale, cityIds),
    fetchRegionTranslations(contentLocale, regionIds),
    fetchCategoryTranslations(contentLocale, categoryIds),
  ]);

  const listingTranslationMap = new Map(listingTranslations.map((translation) => [translation.listing_id, translation]));
  const cityTranslationMap = new Map(cityTranslations.map((translation) => [translation.city_id, translation]));
  const regionTranslationMap = new Map(regionTranslations.map((translation) => [translation.region_id, translation]));
  const categoryTranslationMap = new Map(categoryTranslations.map((translation) => [translation.category_id, translation]));

  return sortedListings.map((listing) => {
    const listingTranslation = listingTranslationMap.get(listing.id);
    const cityTranslation = listing.city?.id ? cityTranslationMap.get(listing.city.id) : undefined;
    const regionTranslation = listing.region?.id ? regionTranslationMap.get(listing.region.id) : undefined;
    const categoryTranslation = listing.category?.id ? categoryTranslationMap.get(listing.category.id) : undefined;

    return {
      ...listing,
      name: listingTranslation?.title?.trim() || listing.name,
      short_description: listingTranslation?.short_description?.trim() || listing.short_description,
      description: listingTranslation?.description?.trim() || listing.description,
      city: listing.city
        ? {
            ...listing.city,
            name: cityTranslation?.name?.trim() || listing.city.name,
            short_description: cityTranslation?.short_description?.trim() || listing.city.short_description,
            description: cityTranslation?.description?.trim() || listing.city.description,
          }
        : listing.city,
      region: listing.region
        ? {
            ...listing.region,
            name: regionTranslation?.name?.trim() || listing.region.name,
            short_description: regionTranslation?.short_description?.trim() || listing.region.short_description,
            description: regionTranslation?.description?.trim() || listing.region.description,
          }
        : listing.region,
      category: listing.category
        ? {
            ...listing.category,
            name: categoryTranslation?.name?.trim() || listing.category.name,
            short_description:
              categoryTranslation?.short_description?.trim() || listing.category.short_description,
          }
        : listing.category,
    };
  });
}

function useDirectoryCmsHelpers(globalSettings: GlobalSetting[], cmsPageId: string = "directory") {
  return useMemo(() => {
    const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});

    const textOverrides = normalizeTextOverrides(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    );
    const pageConfigs = normalizeCmsPageConfigs(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const pageConfig = pageConfigs[cmsPageId] ?? {};
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true) => {
      const configured = blocks[blockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getBlockClassName = (blockId: string) => {
      const className = blocks[blockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const style = blocks[blockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
    };

    const getText = (textKey: string, fallback: string) =>
      pageText[textKey] ?? textOverrides[`${cmsPageId}.${textKey}`] ?? textOverrides[textKey] ?? fallback;

    const getMetaTitle = (fallback: string) => pageConfig.meta?.title ?? getText("meta.title", fallback);
    const getMetaDescription = (fallback: string) =>
      pageConfig.meta?.description ?? getText("meta.description", fallback);

    const getBlockData = (blockId: string): Record<string, unknown> => {
      const data = blocks[blockId]?.data;
      if (!data || typeof data !== "object") return {};
      return data as Record<string, unknown>;
    };

    return {
      getText,
      getMetaTitle,
      getMetaDescription,
      isBlockEnabled,
      getBlockClassName,
      getBlockStyle,
      getBlockData,
    };
  }, [cmsPageId, globalSettings]);
}

function DirectoryCmsBlock({
  blockId,
  children,
  className,
  style,
  as: Component = "div",
  defaultEnabled = true,
  cms,
}: {
  blockId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  defaultEnabled?: boolean;
  cms: ReturnType<typeof useDirectoryCmsHelpers>;
}) {
  if (!cms.isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page="directory"
      data-cms-block={blockId}
      className={[className, cms.getBlockClassName(blockId)].filter(Boolean).join(" ")}
      style={{ ...style, ...cms.getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}

function DirectoryClientInner(props: DirectoryClientProps) {
  const { t, i18n } = useTranslation();
  const cmsPageId = props.cmsPageId ?? "directory";
  const router = useRouter();
  const pathname = usePathname() ?? "/directory";
  const nextSearchParams = useNextSearchParams();
  const searchParamsString = nextSearchParams?.toString() ?? "";
  const imageTimestamp = Date.now();
  const searchParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString],
  );
  const setSearchParams = useCallback((nextParams: URLSearchParams, options?: { replace?: boolean }) => {
    const query = nextParams.toString();
    const baseHref = query ? `${pathname}?${query}` : pathname;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const href = `${baseHref}${hash}`;

    if (options?.replace) {
      router.replace(href, { scroll: false });
      return;
    }

    router.push(href, { scroll: false });
  }, [pathname, router]);
  const l = useLocalePath();
  const resultsAnchorId = "showing-listings";
  const ensureResultsHash = useCallback(() => {
    if (typeof window === "undefined") return;

    const nextHash = `#${resultsAnchorId}`;
    if (window.location.hash === nextHash) return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}${nextHash}`,
    );
  }, [resultsAnchorId]);
  const scrollToResults = useCallback(() => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const target = document.getElementById(resultsAnchorId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [resultsAnchorId]);
  const [search, setSearch] = useState(props.initialFilters.q);
  const [debouncedSearch, setDebouncedSearch] = useState(props.initialFilters.q);
  const [selectedRegion, setSelectedRegion] = useState<string>(props.initialFilters.region);
  const [selectedCity, setSelectedCity] = useState<string>(props.initialFilters.city);
  const [selectedCategory, setSelectedCategory] = useState<string>(props.initialFilters.category);
  const [selectedTier, setSelectedTier] = useState<string>(props.initialFilters.tier);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const locale = normalizePublicContentLocale(props.locale || i18n.language);
  const initialCmsSettings = useMemo(
    () => props.globalSettings.filter((setting) => DIRECTORY_CMS_KEYS.includes(setting.key as (typeof DIRECTORY_CMS_KEYS)[number])),
    [props.globalSettings],
  );

  const { data: globalSettings = initialCmsSettings } = useQuery({
    queryKey: ["global-settings", [...DIRECTORY_CMS_KEYS].sort()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("key, value, category")
        .in("key", [...DIRECTORY_CMS_KEYS])
        .order("key", { ascending: true });

      if (error) throw error;
      return (data ?? []) as GlobalSetting[];
    },
    initialData: initialCmsSettings,
    staleTime: 1000 * 60 * 5,
  });
  const activeCms = useDirectoryCmsHelpers(globalSettings, cmsPageId);

  const { data: cities = props.initialCities, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", locale],
    queryFn: () => fetchCities(locale),
    initialData: props.initialCities,
    staleTime: 1000 * 60 * 10,
  });

  const { data: regions = props.initialRegions, isLoading: regionsLoading } = useQuery({
    queryKey: ["regions", locale],
    queryFn: () => fetchRegions(locale),
    initialData: props.initialRegions,
    staleTime: 1000 * 60 * 10,
  });

  const { data: categories = props.initialCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", locale],
    queryFn: () => fetchCategories(locale),
    initialData: props.initialCategories,
    staleTime: 1000 * 60 * 10,
  });

  const { data: categoryCounts = props.initialCategoryCounts } = useQuery({
    queryKey: ["directory", "category-counts"],
    queryFn: fetchCategoryCounts,
    initialData: props.initialCategoryCounts,
    staleTime: 1000 * 60 * 10,
  });

  const mergedCategories = useMemo(() => buildMergedCategoryOptions(categories), [categories]);
  const { data: cityRegionMappings = [] } = useCityRegionMappings();
  const selectedCategoryItem = useMemo(
    () => getMergedCategoryBySlug(selectedCategory, mergedCategories),
    [mergedCategories, selectedCategory],
  );
  const accommodationCategoryIds = useMemo(
    () => getMergedCategoryBySlug("accommodation", mergedCategories)?.memberIds ?? EMPTY_CATEGORY_IDS,
    [mergedCategories],
  );
  const experiencesCategoryIds = useMemo(
    () => getMergedCategoryBySlug("experiences", mergedCategories)?.memberIds ?? EMPTY_CATEGORY_IDS,
    [mergedCategories],
  );
  const selectedCategoryIds = useMemo(
    () => selectedCategoryItem?.memberIds ?? EMPTY_CATEGORY_IDS,
    [selectedCategoryItem],
  );

  const isStayPage = cmsPageId === "stay" || pathname.includes("/stay");
  const isExperiencesPage = cmsPageId === "experiences" || pathname.includes("/experiences");
  const isVisitPage = cmsPageId === "visit" || pathname.includes("/visit");
  const resolveFilterEntityId = useCallback(
    <T extends { id: string; slug: string }>(value: string, entities: T[]) => {
      if (!value || value === "all") return "all";
      const match = entities.find((entity) => entity.id === value || entity.slug === value);
      return match?.id ?? "all";
    },
    [],
  );

  // Extract and resolve all city parameters for multi-city filtering (e.g., municipalities)
  const selectedCityIds = useMemo(() => {
    const cityParams = searchParams.getAll("city");
    if (cityParams.length === 0) return EMPTY_CATEGORY_IDS;

    const resolvedIds = cityParams
      .map((param) => resolveFilterEntityId(param, cities))
      .filter((id): id is string => id !== "all" && id !== "")
      .filter((id, index, arr) => arr.indexOf(id) === index); // Deduplicate

    return resolvedIds;
  }, [searchParams, cities, resolveFilterEntityId]);

  const categoriesWithListings = useMemo(
    () =>
      mergedCategories.filter((category) =>
        category.memberIds.some((categoryId) => (categoryCounts[categoryId] ?? 0) > 0),
      ),
    [categoryCounts, mergedCategories],
  );

  const listingFilters = useMemo<ListingFilters>(
    () => ({
      search: debouncedSearch || undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      categoryIds: selectedCategory !== "all" ? selectedCategoryIds : undefined,
      cityId: selectedCity !== "all" ? selectedCity : undefined,
      cityIds: selectedCityIds.length > 0 ? selectedCityIds : undefined,
      regionId: selectedRegion !== "all" ? selectedRegion : undefined,
      tier: selectedTier !== "all" ? (selectedTier as ListingTier) : undefined,
    }),
    [debouncedSearch, selectedCategory, selectedCategoryIds, selectedCity, selectedCityIds, selectedRegion, selectedTier],
  );

  const initialFilterMatch =
    (props.initialFilters.q || "") === (debouncedSearch || "") &&
    props.initialFilters.city === selectedCity &&
    props.initialFilters.region === selectedRegion &&
    props.initialFilters.category === selectedCategory &&
    props.initialFilters.tier === selectedTier;

  const { data: listings = props.initialListings, isLoading: listingsLoading, isPlaceholderData, error } = useQuery({
    queryKey: ["listings", "published", listingFilters, locale],
    queryFn: () => fetchListings(listingFilters, categories, cities, regions, locale),
    initialData: initialFilterMatch ? props.initialListings : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: categories.length > 0 && cities.length > 0 && regions.length > 0,
  });

  const { data: stayCityListingCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["stay-city-counts", [...accommodationCategoryIds].sort().join(",")],
    queryFn: async () => {
      if (accommodationCategoryIds.length === 0) return {};

      const { data, error: cityCountError } = await supabase
        .from("listings")
        .select("city_id")
        .in("category_id", accommodationCategoryIds)
        .eq("status", "published");

      if (cityCountError) throw cityCountError;

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (!row.city_id) continue;
        counts[row.city_id] = (counts[row.city_id] ?? 0) + 1;
      }

      return counts;
    },
    enabled: isStayPage && accommodationCategoryIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: experiencesCityListingCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["experiences-city-counts", [...experiencesCategoryIds].sort().join(",")],
    queryFn: async () => {
      if (experiencesCategoryIds.length === 0) return {};

      const { data, error: cityCountError } = await supabase
        .from("listings")
        .select("city_id")
        .in("category_id", experiencesCategoryIds)
        .eq("status", "published");

      if (cityCountError) throw cityCountError;

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (!row.city_id) continue;
        counts[row.city_id] = (counts[row.city_id] ?? 0) + 1;
      }

      return counts;
    },
    enabled: isExperiencesPage && experiencesCategoryIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const stayCityIndex = useMemo(
    () =>
      buildMunicipalityCityIndex({
        cities,
        cityListingCounts: stayCityListingCounts,
        cityRegionMappings,
        regions,
      }).slice(0, 8),
    [cities, cityRegionMappings, regions, stayCityListingCounts],
  );

  const experiencesCityIndex = useMemo(
    () =>
      buildMunicipalityCityIndex({
        cities,
        cityListingCounts: experiencesCityListingCounts,
        cityRegionMappings,
        regions,
      }).slice(0, 8),
    [cities, cityRegionMappings, regions, experiencesCityListingCounts],
  );

  const cityHubsTopCities = useMemo(() => {
    if (isStayPage) return stayCityIndex as VisitCityIndexItem[];
    if (isExperiencesPage) return experiencesCityIndex as VisitCityIndexItem[];
    return props.visitCityIndex?.slice(0, 8) ?? [];
  }, [isStayPage, isExperiencesPage, props.visitCityIndex, stayCityIndex, experiencesCityIndex]);

  const cityHubsHighlightedCity = useMemo(() => {
    const cmsBlockData = activeCms.getBlockData("featured-city-hub");
    const cmsCityId = cmsBlockData && typeof cmsBlockData.cityId === "string" ? cmsBlockData.cityId : null;
    const targetIndex = isStayPage ? stayCityIndex : isExperiencesPage ? experiencesCityIndex : null;

    // First try to find in category-specific city index (municipality index)
    if (cmsCityId && targetIndex) {
      let found = targetIndex.find(
        (city) =>
          city.id === cmsCityId ||
          city.municipalityCityIds?.includes(cmsCityId),
      );

      // If not found, try in the full visitCityIndex from props
      if (!found && props.visitCityIndex) {
        found = props.visitCityIndex.find(
          (city) =>
            city.id === cmsCityId ||
            city.municipalityCityIds?.includes(cmsCityId),
        );
      }

      // If still not found, try matching in the cities data
      if (!found && cities.length > 0) {
        const directMatch = cities.find(city => city.id === cmsCityId);
        if (directMatch) {
          found = {
            id: directMatch.id,
            slug: directMatch.slug,
            name: directMatch.name,
            short_description: directMatch.short_description,
            image_url: directMatch.image_url,
            hero_image_url: directMatch.hero_image_url,
            totalCount: 0,
            municipalityRegionId: undefined,
            municipalityCityIds: [],
          };
        }
      }

      if (found) return found;
    }

    if (isStayPage || isExperiencesPage) {
      const configured = props.featuredVisitCity;
      const defaultIndex = isStayPage ? stayCityIndex : experiencesCityIndex;
      if (!configured) return defaultIndex[0] ?? undefined;

      return (
        defaultIndex.find(
          (city) =>
            city.id === configured.id ||
            city.municipalityCityIds?.includes(configured.id),
        ) ??
        defaultIndex[0] ??
        undefined
      );
    }
    return props.featuredVisitCity ?? undefined;
  }, [isStayPage, isExperiencesPage, props.featuredVisitCity, stayCityIndex, experiencesCityIndex, activeCms, props.visitCityIndex, cities]);
  const stayCityPathBuilder = useCallback((city: CityHubItem) => {
    const params = new URLSearchParams({
      category: "accommodation",
    });

    // For municipalities with multiple cities, append all constituent city slugs
    if (city.municipalityCityIds && city.municipalityCityIds.length > 0) {
      city.municipalityCityIds.forEach((cityId) => {
        const cityObj = cities.find((c) => c.id === cityId);
        if (cityObj) {
          params.append("city", cityObj.slug);
        }
      });
    } else {
      // Single city fallback
      params.set("city", city.slug);
    }

    return `/stay?${params.toString()}#${resultsAnchorId}`;
  }, [resultsAnchorId, cities]);

  const experiencesCityPathBuilder = useCallback((city: CityHubItem) => {
    const params = new URLSearchParams({
      category: "experiences",
    });

    // For municipalities with multiple cities, append all constituent city slugs
    if (city.municipalityCityIds && city.municipalityCityIds.length > 0) {
      city.municipalityCityIds.forEach((cityId) => {
        const cityObj = cities.find((c) => c.id === cityId);
        if (cityObj) {
          params.append("city", cityObj.slug);
        }
      });
    } else {
      // Single city fallback
      params.set("city", city.slug);
    }

    return `/experiences?${params.toString()}#${resultsAnchorId}`;
  }, [resultsAnchorId, cities]);

  const showCityHubs =
    activeCms.isBlockEnabled("city-hubs", true) &&
    ((isStayPage && cityHubsTopCities.length > 0) ||
      (isExperiencesPage && cityHubsTopCities.length > 0) ||
      (isVisitPage && (props.visitCityIndex?.length ?? 0) > 0));

  const showInitialData = isPlaceholderData && props.initialListings.length > 0;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const regionParam = searchParams.get("region");
    const cityParam = searchParams.get("city");
    const qParam = searchParams.get("q");
    const tierParam = searchParams.get("tier");
    const nextParams = new URLSearchParams(searchParams);
    let shouldReplaceParams = false;
    const canResolveCategory = mergedCategories.length > 0;

    if (categoryParam) {
      const resolvedSlug = canResolveCategory
        ? resolveCategoryFilterSlug(categoryParam, categories, mergedCategories)
        : categoryParam;
      setSelectedCategory(resolvedSlug);

      if (canResolveCategory) {
        if (resolvedSlug === "all") {
          nextParams.delete("category");
          shouldReplaceParams = true;
        } else if (categoryParam !== resolvedSlug) {
          nextParams.set("category", resolvedSlug);
          shouldReplaceParams = true;
        }
      }
    } else {
      setSelectedCategory("all");
    }

    if (regionParam) {
      const normalizedRegion = resolveFilterEntityId(regionParam, regions);
      setSelectedRegion(normalizedRegion);
      if (normalizedRegion === "all") {
        nextParams.delete("region");
        shouldReplaceParams = true;
      } else if (regionParam !== normalizedRegion) {
        nextParams.set("region", normalizedRegion);
        shouldReplaceParams = true;
      }
    } else {
      setSelectedRegion("all");
    }

    // Check for multiple city parameters (from municipality filtering) first
    const cityParams = searchParams.getAll("city");
    if (cityParams.length > 1) {
      // Multiple cities selected - set selectedCity to "all" to indicate multiple filter
      // Leave URL as-is (don't normalize) since it has intentional multi-city parameters
      setSelectedCity("all");
    } else if (cityParam) {
      // Single city parameter
      const normalizedCity = resolveFilterEntityId(cityParam, cities);
      setSelectedCity(normalizedCity);
      if (normalizedCity === "all") {
        nextParams.delete("city");
        shouldReplaceParams = true;
      } else if (cityParam !== normalizedCity) {
        nextParams.set("city", normalizedCity);
        shouldReplaceParams = true;
      }
    } else if (cityParams.length === 1) {
      // Single city in array form
      const normalizedCity = resolveFilterEntityId(cityParams[0], cities);
      setSelectedCity(normalizedCity);
      if (normalizedCity !== "all") {
        // Normalize to single-value parameter for consistency
        nextParams.delete("city");
        nextParams.set("city", normalizedCity);
        shouldReplaceParams = true;
      } else {
        nextParams.delete("city");
        shouldReplaceParams = true;
      }
    } else {
      setSelectedCity("all");
    }

    const normalizedTier =
      tierParam === "signature" || tierParam === "verified" || tierParam === "all" || !tierParam
        ? tierParam || "all"
        : "all";
    setSelectedTier(normalizedTier);
    if (normalizedTier === "all") {
      if (tierParam) {
        nextParams.delete("tier");
        shouldReplaceParams = true;
      }
    } else if (tierParam !== normalizedTier) {
      nextParams.set("tier", normalizedTier);
      shouldReplaceParams = true;
    }

    setSearch(qParam || "");

    if (shouldReplaceParams) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, categories, mergedCategories, regions, cities, resolveFilterEntityId, setSearchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    const trimmedSearch = debouncedSearch.trim();

    if (trimmedSearch) nextParams.set("q", trimmedSearch);
    if (selectedRegion !== "all") nextParams.set("region", selectedRegion);

    // Handle multiple city filtering (from municipalities) or single city
    if (selectedCityIds.length > 1) {
      // Multiple cities: append each one
      selectedCityIds.forEach(cityId => {
        const city = cities.find(c => c.id === cityId);
        if (city) {
          nextParams.append("city", city.slug);
        }
      });
    } else if (selectedCity !== "all") {
      // Single city
      nextParams.set("city", selectedCity);
    }

    if (selectedCategory !== "all") nextParams.set("category", selectedCategory);
    if (selectedTier !== "all") nextParams.set("tier", selectedTier);

    const nextQuery = nextParams.toString();
    if (nextQuery !== searchParamsString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearch,
    selectedRegion,
    selectedCity,
    selectedCityIds,
    selectedCategory,
    selectedTier,
    searchParamsString,
    setSearchParams,
    cities,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedTier("all");
    setSearchParams(new URLSearchParams(), { replace: true });
  };
  const handleCityChange = useCallback((value: string) => {
    if (value === selectedCity) return;
    ensureResultsHash();
    setSelectedCity(value);
    scrollToResults();
  }, [ensureResultsHash, scrollToResults, selectedCity]);

  const hasActiveFilters =
    Boolean(search) ||
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedCategory !== "all" ||
    selectedTier !== "all";
  const isLoading = listingsLoading || citiesLoading || regionsLoading || categoriesLoading;
  const showGridSkeleton = isLoading && !error && listings.length === 0 && !isPlaceholderData;
  const totalListingsCount = listings.length;

  const mapHref = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedRegion !== "all") params.set("region", selectedRegion);
    if (selectedCity !== "all") params.set("city", selectedCity);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedTier !== "all") params.set("tier", selectedTier);
    const query = params.toString();
    return l(query ? `/map?${query}` : "/map");
  }, [l, search, selectedRegion, selectedCity, selectedCategory, selectedTier]);

  return (
    <div className="min-h-screen bg-background" data-cms-page="directory">
      <Header />
      <main>
        <LazyMotion features={domAnimation}>
        {/* Hero: enabled with matching top padding, disabled with minimal placeholder */}
        {!activeCms.isBlockEnabled("hero", true) ? (
        <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />
      ) : (
        <DirectoryCmsBlock
          blockId="hero"
          as="section"
          cms={activeCms}
          className="px-0 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4"
        >
          <LiveStyleHero
            className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
            badge={t("directory.heroLabel")}
            title={t("directory.title")}
            subtitle={t("directory.subtitle")}
            media={
              <HeroBackgroundMedia
                mediaType={activeCms.getText("hero.mediaType", "image")}
                imageUrl={activeCms.getText("hero.imageUrl", "")}
                videoUrl={activeCms.getText("hero.videoUrl", "")}
                youtubeUrl={activeCms.getText("hero.youtubeUrl", "")}
                posterUrl={activeCms.getText("hero.posterUrl", "")}
                alt={t("directory.hero.alt", "Premium Algarve directory coastline view")}
                fallback={<PageHeroImage page="directory" alt={t("directory.hero.alt", "Premium Algarve directory coastline view")} />}
              />
            }
            ctas={
              <>
                <Link href={l("/contact")}>
                  <Button variant="gold" size="lg">
                    {t("directory.hero.ctaPrimary", "Plan with Concierge")}
                  </Button>
                </Link>
                <Link href={l("/live")}>
                  <Button variant="heroOutline" size="lg">
                    {t("directory.hero.ctaSecondary", "Explore Live in Algarve")}
                  </Button>
                </Link>
              </>
            }
          />
        </DirectoryCmsBlock>
      )}

        <div className="app-container content-max pb-16 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)]">
          {showCityHubs ? (
            <CityHubsSection
              highlightedCity={cityHubsHighlightedCity}
              topCities={cityHubsTopCities}
              cityListingCounts={isStayPage ? stayCityListingCounts : isExperiencesPage ? experiencesCityListingCounts : {}}
              preferCityListingCounts={isStayPage || isExperiencesPage}
              cityPathBuilder={isStayPage ? stayCityPathBuilder : isExperiencesPage ? experiencesCityPathBuilder : undefined}
              imageTimestamp={imageTimestamp}
              basePath="visit"
              translationPrefix="directory"
            />
          ) : null}

          {activeCms.isBlockEnabled("filters", true) ? (
            <DirectoryCmsBlock
              blockId="filters"
              cms={activeCms}
              as={m.div}
              className="relative z-30 isolate mb-8"
              style={undefined}
            >
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <Card className="relative isolate overflow-hidden border-border bg-background/95 shadow-lg supports-[backdrop-filter]:bg-background/90">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-[var(--glass-radius)]">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{t("directory.advancedFilters")}</span>
                        {hasActiveFilters ? (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {t("directory.active")}
                          </Badge>
                        ) : null}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="relative z-10 pt-0 pb-6 px-4 space-y-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t("directory.searchPlaceholder")}
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          className="pl-12 h-12 text-lg bg-muted/30 border-border focus:bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {t("directory.region")}
                          </label>
                          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue placeholder={t("directory.allRegions")} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg">
                              <SelectItem value="all">{t("directory.allRegions")}</SelectItem>
                              {[...regions].sort((a, b) => a.name.localeCompare(b.name)).map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            {t("directory.city")}
                          </label>
                          <Select value={selectedCity} onValueChange={handleCityChange}>
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue placeholder={t("directory.allCities")} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                              <SelectItem value="all">{t("directory.allCities")}</SelectItem>
                              {[...cities].sort((a, b) => a.name.localeCompare(b.name)).map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {t("directory.category")}
                          </label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue placeholder={t("directory.allCategories")} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                              <SelectItem value="all">{t("directory.allCategories")}</SelectItem>
                              {[...categoriesWithListings]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.slug}>
                                    {translateCategoryName(t, category.slug, category.name)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" />
                            {t("directory.tier")}
                          </label>
                          <Select value={selectedTier} onValueChange={setSelectedTier}>
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue placeholder={t("directory.allTiers")} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg">
                              <SelectItem value="all">{t("directory.allTiers")}</SelectItem>
                              <SelectItem value="signature">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-4 w-4 text-primary" />
                                  {t("directory.tierSignature")}
                                </div>
                              </SelectItem>
                              <SelectItem value="verified">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-4 w-4 text-green-500" />
                                  {t("directory.tierVerified")}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {hasActiveFilters ? (
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4 mr-2" />
                            {t("directory.clearAllFilters")}
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </DirectoryCmsBlock>
          ) : null}

          {activeCms.isBlockEnabled("results", true) ? (
            <DirectoryCmsBlock
              blockId="results"
              cms={activeCms}
              className="relative z-0 isolate scroll-mt-28 sm:scroll-mt-32"
              style={undefined}
              as="section"
            >
              <div id={resultsAnchorId} />
              <div className="flex items-center justify-between mb-6">
                <p className="text-body-sm text-muted-foreground">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("directory.loading")}
                    </span>
                  ) : (
                    t("directory.showingResults", { count: totalListingsCount })
                  )}
                </p>
                <Link href={mapHref}>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t("directory.mapView", "Map View")}
                  </Button>
                </Link>
              </div>

              {error ? (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-destructive mb-4">{t("directory.errorMessage")}</p>
                  <Button variant="outline" onClick={() => router.refresh()}>
                    {t("directory.retry")}
                  </Button>
                </m.div>
              ) : null}

              {showGridSkeleton ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                  aria-live="polite"
                  aria-label={t("directory.loading")}
                >
                  {[...Array(8)].map((_, index) => (
                    <SkeletonCard key={index} variant="listing" />
                  ))}
                </div>
              ) : null}

              {!showGridSkeleton && !error && listings.length === 0 ? (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">{t("directory.noListingsTitle")}</h3>
                  <p className="text-muted-foreground mb-6">{t("directory.noListingsSubtitle")}</p>
                  <Button variant="outline" onClick={clearFilters}>
                    {t("directory.clearAllFilters")}
                  </Button>
                </m.div>
              ) : null}

              {!showGridSkeleton && !error && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <m.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }}
                      className="h-full"
                    >
                      <Link href={l(`/listing/${listing.slug}`)} className="group block h-full">
                        <article className="relative z-0 isolate glass-box glass-box-listing-shimmer overflow-hidden flex flex-col h-full">
                          {listing.tier === "signature" ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                            />
                          ) : null}

                          <div className="relative z-0 aspect-square bg-muted overflow-hidden">
                            <ListingImage
                              src={listing.featured_image_url}
                              category={listing.category?.slug}
                              categoryImageUrl={listing.category?.image_url}
                              listingId={listing.id}
                              alt={listing.name}
                              isRepresentative={!listing.featured_image_url}
                              className="absolute inset-0 w-full h-full object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-110"
                            />

                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                              <ListingTierBadge tier={listing.tier} />
                            </div>

                            {listing.google_rating ? (
                              <GoogleRatingBadge
                                rating={listing.google_rating}
                                reviewCount={listing.google_review_count}
                                variant="overlay"
                                size="sm"
                                className="absolute top-3 right-3"
                              />
                            ) : null}

                            <div
                              className="absolute bottom-3 left-3 right-3 flex items-center justify-between"
                              onClick={(event) => event.preventDefault()}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
                              >
                                  {renderCategoryIcon(listing.category?.icon ?? undefined, "h-3 w-3")}
                                {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                              </Badge>

                              <FavoriteButton
                                isFavorite={isFavorite(listing.id)}
                                onToggle={() => toggleFavorite(listing.id)}
                                size="sm"
                                variant="glassmorphism"
                              />
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-serif font-medium text-base lg:text-[1.32rem] mb-1 group-hover:text-primary transition-colors line-clamp-1">
                              {listing.name}
                            </h3>

                            <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
                              {listing.short_description || listing.description}
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.city?.name}</span>
                              {listing.region ? (
                                <>
                                  <span>•</span>
                                  <span>{listing.region.name}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      </Link>
                    </m.div>
                  ))}
                </div>
              ) : null}
            </DirectoryCmsBlock>
          ) : null}
        </div>
        </LazyMotion>
      </main>

      <Footer />
    </div>
  );
}

export function DirectoryClient(props: DirectoryClientProps) {
  return <DirectoryClientInner {...props} />;
}

export default DirectoryClient;
