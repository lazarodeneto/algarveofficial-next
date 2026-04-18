import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Compass,
  Crown,
  Filter,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  X,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCities,
  useCategories,
  useRegions,
  useCityRegionMappings,
} from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import {
  STANDARD_PUBLIC_CONTENT_TOP_CLASS,
  STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
  STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";
import { CityHubsSection } from "@/components/shared/CityHubsSection";
import {
  buildMergedCategoryOptions,
  getMergedMemberSlugs,
  getMergedCategoryBySlug,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { translateCategoryName } from "@/lib/translateCategory";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildMunicipalityCityIndex } from "@/lib/cities/municipalityIndex";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";
import type { ListingWithRelations } from "@/hooks/useListings";

type ListingRow = ListingWithRelations;

type ExperienceCategoryScope = "experiences" | "beaches";

const arraysAreEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

interface ExperiencesProps {
  defaultCategorySlug?: ExperienceCategoryScope;
  pagePath?: "/experiences" | "/beaches";
}

const Experiences = ({
  defaultCategorySlug = "experiences",
  pagePath = "/experiences",
}: ExperiencesProps) => {
  const { t } = useTranslation();
  const {
    getMetaDescription,
    getMetaTitle,
    getText,
    isBlockEnabled,
    getBlockData,
  } = useCmsPageBuilder("experiences");
  const l = useLocalePath();
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();
  const { data: regions = [] } = useRegions();
  const { data: cityRegionMappings = [] } = useCityRegionMappings();
  const imageTimestamp = Date.now();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategorySlug);
  const [selectedTier, setSelectedTier] = useState<Database["public"]["Tables"]["listings"]["Row"]["tier"] | "all">("all");
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const scopedMemberSlugs = useMemo(
    () => getMergedMemberSlugs(defaultCategorySlug),
    [defaultCategorySlug],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const mergedCategories = useMemo(
    () => buildMergedCategoryOptions(categories),
    [categories],
  );
  const scopedCategories = useMemo(() => {
    const scopedSlugSet = new Set(scopedMemberSlugs);
    return mergedCategories.filter((category) =>
      category.memberSlugs.some((slug) => scopedSlugSet.has(slug)),
    );
  }, [mergedCategories, scopedMemberSlugs]);

  // Extract URL parameters and convert slugs to IDs
  useEffect(() => {
    if (typeof window === "undefined" || cities.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const cityParams = params.getAll("city");
    const categoryParam = params.get("category");
    const resolvedCategory = categoryParam
      ? resolveCategoryFilterSlug(categoryParam, categories, mergedCategories)
      : defaultCategorySlug;
    const nextCategory =
      resolvedCategory === "all" ||
      scopedCategories.some((category) => category.slug === resolvedCategory)
        ? resolvedCategory
        : defaultCategorySlug;

    setSelectedCategory((previousCategory) =>
      previousCategory === nextCategory ? previousCategory : nextCategory,
    );

    if (cityParams.length > 0) {
      // Convert city slugs to city IDs
      const cityIdMap = new Map(cities.map((city) => [city.slug, city.id]));
      const cityIds = cityParams
        .map((slug) => cityIdMap.get(slug))
        .filter((id): id is string => id !== undefined);

      if (cityIds.length > 0) {
        setSelectedCities((previousCities) =>
          arraysAreEqual(previousCities, cityIds) ? previousCities : cityIds,
        );
        setSelectedCity((previousCity) =>
          previousCity === "all" ? previousCity : "all",
        );
        setShouldScrollToResults(true);
        return;
      }
    }

    const regionParam = params.get("region");
    const nextRegion = regionParam ?? "all";

    setSelectedRegion((previousRegion) =>
      previousRegion === nextRegion ? previousRegion : nextRegion,
    );
    setSelectedCities((previousCities) =>
      previousCities.length === 0 ? previousCities : [],
    );
  }, [categories, cities, defaultCategorySlug, mergedCategories, scopedCategories]);

  const categoryMissingFromOptions = useMemo(
    () =>
      selectedCategory !== "all" &&
      !scopedCategories.some((category) => category.slug === selectedCategory),
    [scopedCategories, selectedCategory],
  );


  const scopedCategoryIds = useMemo(() => {
    return getMergedCategoryBySlug(defaultCategorySlug, mergedCategories)?.memberIds ?? [];
  }, [defaultCategorySlug, mergedCategories]);
  const selectedCategoryIds = useMemo(() => {
    if (selectedCategory === "all") {
      return Array.from(
        new Set(scopedCategories.flatMap((category) => category.memberIds)),
      );
    }
    return (
      getMergedCategoryBySlug(selectedCategory, scopedCategories)?.memberIds ??
      getMergedCategoryBySlug(defaultCategorySlug, scopedCategories)?.memberIds ??
      []
    );
  }, [defaultCategorySlug, scopedCategories, selectedCategory]);

  const hasActiveFilters =
    selectedCategory !== defaultCategorySlug ||
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedCities.length > 0 ||
    selectedTier !== "all" ||
    debouncedSearch !== "";

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedCities([]);
    setSelectedCategory(defaultCategorySlug);
    setSelectedTier("all");
  }, [defaultCategorySlug]);

  // City listing counts scoped to selected top-level category.
  const { data: cityListingCounts = {} } = useQuery<Record<string, number>>({
    queryKey: [`${defaultCategorySlug}-city-counts`, [...scopedCategoryIds].sort().join(",")],
    queryFn: async () => {
      let effectiveCategoryIds = scopedCategoryIds;

      if (effectiveCategoryIds.length === 0) {
        const { data: fallbackCategories, error: fallbackError } = await supabase
          .from("categories")
          .select("id")
          .eq("is_active", true)
          .in("slug", scopedMemberSlugs);

        if (fallbackError) throw fallbackError;
        effectiveCategoryIds = (fallbackCategories ?? []).map((category) => category.id);
      }

      if (effectiveCategoryIds.length === 0) return {};

      const { data, error } = await supabase
        .from("listings")
        .select("city_id")
        .in("category_id", effectiveCategoryIds)
        .eq("status", "published");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.city_id) {
          counts[row.city_id] = (counts[row.city_id] ?? 0) + 1;
        }
      }
      return counts;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  // Municipalities by listing count (aggregated from city-level listings).
  const municipalityCities = useMemo(
    () =>
      buildMunicipalityCityIndex({
        cities,
        cityListingCounts,
        cityRegionMappings,
        regions,
      }),
    [cities, cityListingCounts, cityRegionMappings, regions],
  );

  const topCities = useMemo(() => municipalityCities.slice(0, 8), [municipalityCities]);
  const heroEnabled = isBlockEnabled("hero", true);

  // Featured city from CMS data or first top city
  const featuredCityHubData = getBlockData("featured-city-hub");
  const highlightedCityId =
    typeof featuredCityHubData.cityId === "string"
      ? featuredCityHubData.cityId
      : null;
  let highlightedCity = highlightedCityId
    ? municipalityCities.find(
        (city) =>
          city.id === highlightedCityId ||
          city.municipalityCityIds?.includes(highlightedCityId),
      ) ?? topCities[0] ?? municipalityCities[0]
    : topCities[0] ?? municipalityCities[0];
  
  // Fallback: if not found in municipalityCities, try in the full cities list
  if (!highlightedCity && highlightedCityId && cities.length > 0) {
    const fallbackCity = cities.find(city => city.id === highlightedCityId);
    if (fallbackCity) {
      highlightedCity = {
        id: fallbackCity.id,
        slug: fallbackCity.slug,
        name: fallbackCity.name,
        short_description: fallbackCity.short_description,
        image_url: fallbackCity.image_url,
        hero_image_url: fallbackCity.hero_image_url,
        totalCount: 0,
        municipalityCityIds: [],
      };
    } else {
      highlightedCity = topCities[0] ?? municipalityCities[0];
    }
  }

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading, error: listingsError } = useQuery({
    queryKey: [
      "experiences-listings",
      defaultCategorySlug,
      debouncedSearch,
      selectedRegion,
      selectedCity,
      [...selectedCities].sort().join(","),
      selectedCategory,
      [...selectedCategoryIds].sort().join(","),
      selectedTier,
      locale,
    ],
    queryFn: async () => {
      let effectiveCategoryIds: string[] = selectedCategoryIds;

      if (selectedCategory === defaultCategorySlug && effectiveCategoryIds.length === 0) {
        const { data: fallbackCategories, error: fallbackError } = await supabase
          .from("categories")
          .select("id")
          .eq("is_active", true)
          .in("slug", scopedMemberSlugs);

        if (fallbackError) throw fallbackError;
        effectiveCategoryIds = (fallbackCategories ?? []).map((category) => category.id);
      }

      let query = supabase
        .from("listings")
        .select("*, city:cities ( id, name, slug ), region:regions ( id, name, slug ), category:categories ( id, name, slug, icon )")
        .eq("status", "published");

      if (effectiveCategoryIds.length > 0) {
        query = query.in("category_id", effectiveCategoryIds);
      }

      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`,
        );
      }
      // Handle multi-city filtering for municipalities
      if (selectedCities.length > 0) {
        query = query.in("city_id", selectedCities);
      }
      // Fallback to single city selection
      else if (selectedCity !== "all") {
        query = query.eq("city_id", selectedCity);
      }
      if (selectedRegion !== "all") {
        query = query.eq("region_id", selectedRegion);
      }
      if (selectedTier !== "all") {
        query = query.eq("tier", selectedTier);
      }
      query = query
        .order("tier", { ascending: true })
        .order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as ListingRow[];
      if (locale === "en" || rows.length === 0) {
        return rows;
      }

      try {
        const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] =
          await Promise.all([
            fetchListingTranslations(locale, rows.map((listing) => listing.id)),
            fetchCityTranslations(
              locale,
              rows.map((listing) => listing.city?.id ?? listing.city_id).filter(Boolean) as string[],
            ),
            fetchRegionTranslations(
              locale,
              rows.map((listing) => listing.region?.id ?? listing.region_id).filter(Boolean) as string[],
            ),
            fetchCategoryTranslations(
              locale,
              rows.map((listing) => listing.category?.id ?? listing.category_id).filter(Boolean) as string[],
            ),
          ]);

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

        return rows.map((listing) => {
          const listingTranslation = listingTranslationMap.get(listing.id);
          const cityTranslation = (listing.city?.id ?? listing.city_id)
            ? cityTranslationMap.get(listing.city?.id ?? listing.city_id ?? "")
            : undefined;
          const regionTranslation = (listing.region?.id ?? listing.region_id)
            ? regionTranslationMap.get(listing.region?.id ?? listing.region_id ?? "")
            : undefined;
          const categoryTranslation = (listing.category?.id ?? listing.category_id)
            ? categoryTranslationMap.get(listing.category?.id ?? listing.category_id ?? "")
            : undefined;

          return {
            ...listing,
            name: listingTranslation?.title?.trim() || listing.name,
            short_description:
              listingTranslation?.short_description?.trim() || listing.short_description,
            description: listingTranslation?.description?.trim() || listing.description,
            city: listing.city
              ? {
                  ...listing.city,
                  name: cityTranslation?.name?.trim() || listing.city.name,
                }
              : listing.city,
            region: listing.region
              ? {
                  ...listing.region,
                  name: regionTranslation?.name?.trim() || listing.region.name,
                }
              : listing.region,
            category: listing.category
              ? {
                  ...listing.category,
                  name: categoryTranslation?.name?.trim() || listing.category.name,
                }
              : listing.category,
          };
        });
      } catch (translationError) {
        console.warn("Failed to localize experience listings; falling back to English.", translationError);
        return rows;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  // Scroll to results when listings have loaded
  useEffect(() => {
    if (shouldScrollToResults && !listingsLoading && typeof window !== "undefined") {
      const target = document.getElementById("showing-listings");
      if (target) {
        // Account for header height to position text right below it
        const headerHeight = 80; // Approximate header height
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        setShouldScrollToResults(false);
      }
    }
  }, [shouldScrollToResults, listingsLoading]);

  const experienceStats = [
    {
      icon: Sparkles,
      value: "200+",
      label: t("experiences.stats.curated"),
    },
    {
      icon: Compass,
      value: "15+",
      label: t("experiences.stats.categories"),
    },
    {
      icon: Sun,
      value: "300+",
      label: t("experiences.stats.sunDays"),
    },
  ];

  const experiencePillars = [
    {
      icon: Sun,
      title: t("experiences.pillars.outdoor.title"),
      description: t(
        "experiences.pillars.outdoor.description",
      ),
    },
    {
      icon: Sparkles,
      title: t(
        "experiences.pillars.gastronomy.title",
      ),
      description: t(
        "experiences.pillars.gastronomy.description",
      ),
    },
    {
      icon: Compass,
      title: t("experiences.pillars.culture.title"),
      description: t(
        "experiences.pillars.culture.description",
      ),
    },
    {
      icon: Star,
      title: t(
        "experiences.pillars.wellness.title",
      ),
      description: t(
        "experiences.pillars.wellness.description",
      ),
    },
  ];

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-cms-page="experiences"
    >

      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main className="flex-grow">
        {heroEnabled && (
          <CmsBlock
            pageId="experiences"
            blockId="hero"
            className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}
          >
            <LiveStyleHero
              className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
              badge={t("experiences.hero.badge")}
              title={t(
                "experiences.hero.title",
              )}
              subtitle={t(
                "experiences.hero.subtitle",
              )}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
                  alt={t("experiences.hero.alt")}
                  fallback={
                    <PageHeroImage
                      page="directory"
                      alt={t(
                        "experiences.hero.alt",
                      )}
                    />
                  }
                />
              }
              ctas={
                <>
                  <Link href={l("/stay?category=things-to-do")}>
                    <Button variant="gold" size="lg">
                      {t(
                        "experiences.hero.ctaPrimary",
                      )}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={l("/contact")}>
                    <Button variant="heroOutline" size="lg">
                      {t(
                        "experiences.hero.ctaSecondary",
                      )}
                    </Button>
                  </Link>
                </>
              }
            />
          </CmsBlock>
        )}

        <div className={`app-container content-max pb-16 ${heroEnabled ? STANDARD_PUBLIC_CONTENT_TOP_CLASS : ""}`}>
          {topCities.length > 0 && isBlockEnabled("city-hubs", true) ? (
            <CityHubsSection
              highlightedCity={highlightedCity}
              topCities={topCities}
              cityListingCounts={cityListingCounts}
              preferCityListingCounts
              cityPathBuilder={(city) => {
                const params = new URLSearchParams();
                // Create a map from city IDs to slugs
                const citySlugMap = new Map(cities.map(c => [c.id, c.slug]));

                // For municipalities with multiple cities, append all city slugs
                if (city.municipalityCityIds && city.municipalityCityIds.length > 0) {
                  city.municipalityCityIds.forEach((cityId) => {
                    const slug = citySlugMap.get(cityId);
                    if (slug) params.append("city", slug);
                  });
                } else {
                  // Single city fallback - use the city's own slug
                  params.append("city", city.slug);
                }
                return `${pagePath}?${params.toString()}#showing-listings`;
              }}
              imageTimestamp={imageTimestamp}
              basePath="visit"
              translationPrefix="experiences"
            />
          ) : null}

          {isBlockEnabled("filters", true) ? (
            <CmsBlock
              pageId="experiences"
              blockId="filters"
              className="relative z-30 isolate mb-8"
            >
              <Collapsible
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
              >
                <Card className="relative isolate overflow-hidden border-border bg-background/95 shadow-lg supports-[backdrop-filter]:bg-background/90">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-[var(--glass-radius)]">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">
                          {t(
                            "directory.advancedFilters",
                          )}
                        </span>
                        {hasActiveFilters ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/20 text-primary"
                          >
                            {t("directory.active")}
                          </Badge>
                        ) : null}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          filtersOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="relative z-10 pt-0 pb-6 px-4 space-y-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t(
                            "directory.searchPlaceholder",
                          )}
                          value={search}
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }
                          className="pl-12 h-12 text-lg bg-muted/30 border-border focus:bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {t("directory.region")}
                          </label>
                          <Select
                            value={selectedRegion}
                            onValueChange={setSelectedRegion}
                          >
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue
                                placeholder={t(
                                  "directory.allRegions",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg">
                              <SelectItem value="all">
                                {t(
                                  "directory.allRegions",
                                )}
                              </SelectItem>
                              {[...regions]
                                .sort((a, b) =>
                                  a.name.localeCompare(b.name),
                                )
                                .map((region) => (
                                  <SelectItem
                                    key={region.id}
                                    value={region.id}
                                  >
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
                          <Select
                            value={selectedCity}
                            onValueChange={setSelectedCity}
                          >
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue
                                placeholder={t(
                                  "directory.allCities",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                              <SelectItem value="all">
                                {t("directory.allCities")}
                              </SelectItem>
                              {[...cities]
                                .sort((a, b) =>
                                  a.name.localeCompare(b.name),
                                )
                                .map((city) => (
                                  <SelectItem
                                    key={city.id}
                                    value={city.id}
                                  >
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
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue
                                placeholder={t(
                                  "directory.allCategories",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                              {categoryMissingFromOptions ? (
                                <SelectItem value={selectedCategory}>
                                  {translateCategoryName(
                                    t,
                                    selectedCategory,
                                    selectedCategory,
                                  )}
                                </SelectItem>
                              ) : null}
                              <SelectItem value="all">
                                {t("directory.allCategories")}
                              </SelectItem>
                              {[...scopedCategories]
                                .sort((a, b) =>
                                  a.name.localeCompare(b.name),
                                )
                                .map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.slug}
                                  >
                                    {translateCategoryName(
                                      t,
                                      category.slug,
                                      category.name,
                                    )}
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
                          <Select
                            value={selectedTier}
                            onValueChange={(value) =>
                              setSelectedTier(
                                value as Database["public"]["Tables"]["listings"]["Row"]["tier"] | "all",
                              )
                            }
                          >
                            <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                              <SelectValue
                                placeholder={t(
                                  "directory.allTiers",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border shadow-lg">
                              <SelectItem value="all">
                                {t("directory.allTiers")}
                              </SelectItem>
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
                            {t(
                              "directory.clearAllFilters",
                            )}
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </CmsBlock>
          ) : null}

          {isBlockEnabled("results", true) ? (
            <CmsBlock
              pageId="experiences"
              blockId="results"
              className="relative z-0 isolate scroll-mt-28 sm:scroll-mt-32"
            >
                <div id="showing-listings" className="flex items-center justify-between mb-6">
                <p className="text-body-sm text-muted-foreground">
                  {listingsLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("directory.loading")}
                    </span>
                  ) : (
                    t("directory.showingResults", {
                      count: listings.length,
                    })
                  )}
                </p>
              </div>

              {listingsError ? (
                <div className="mb-6 rounded-md border border-destructive/35 bg-destructive/10 px-4 py-3 text-body-sm text-destructive">
                  {t(
                    "directory.loadError",
                  )}
                </div>
              ) : null}

              {listingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : null}

              {!listingsLoading && listings.length === 0 ? (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    {t(
                      "directory.noListingsTitle",
                    )}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "directory.noListingsSubtitle",
                    )}
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    {t(
                      "directory.clearAllFilters",
                    )}
                  </Button>
                </m.div>
              ) : null}

              {!listingsLoading && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      href={l(`/listing/${listing.slug}`)}
                      index={index}
                    />
                  ))}
                </div>
              ) : null}
            </CmsBlock>
          ) : null}

        {isBlockEnabled("stats", true) && (
          <CmsBlock
            pageId="experiences"
            blockId="stats"
            as="section"
            className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {experienceStats.map((stat) => (
                <article
                  key={stat.label}
                  className="glass-box p-5 flex items-center gap-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("pillars", true) && (
          <CmsBlock
            pageId="experiences"
            blockId="pillars"
            as="section"
            className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14"
          >
            <div className="mb-8 text-center">
              <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
                {t("experiences.pillars.label")}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
                {t(
                  "experiences.pillars.title",
                )}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {experiencePillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="glass-box p-6 space-y-3"
                >
                  <pillar.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-xl text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("cta", true) && (
          <CmsBlock
            pageId="experiences"
            blockId="cta"
            as="section"
            className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-20"
          >
            <div className="glass-box p-8 md:p-10 text-center">
              <h2 className="text-3xl font-serif font-medium mb-3">
                {t(
                  "experiences.cta.title",
                )}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t(
                  "experiences.cta.description",
                )}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={l("/contact")}>
                  <Button variant="gold" size="lg">
                    {t(
                      "experiences.cta.primary",
                    )}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href={l("/stay?category=things-to-do")}>
                  <Button variant="outline" size="lg">
                    {t(
                      "experiences.cta.secondary",
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </CmsBlock>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
