import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/ListingCard";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublishedListings } from "@/hooks/useListings";
import { useCategories, useCities, useRegions } from "@/hooks/useReferenceData";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildMergedCategoryOptions, getMergedCategoryBySlug } from "@/lib/categoryMerges";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import {
  normalizeListingFilterId,
  normalizeListingMaxItems,
  normalizeSelectedListingIds,
  validateSelectedListingIds,
} from "@/lib/cms/listing-block-config";
import {
  normalizePlacementSelection,
  resolveListingOrder,
} from "@/lib/cms/placement-engine";
import { trackBlockImpression, trackListingClick } from "@/lib/analytics/platformTracking";
import { cmsText, type HomeSectionCopy } from "@/lib/cms/home-section-copy";

const ITEMS_PER_PAGE = 12;
const MAX_HOME_LISTINGS = 24;
const LOADING_SKELETON_COUNT = ITEMS_PER_PAGE;

interface AllListingsSectionProps {
  forcedCategorySlug?: string;
  copy?: HomeSectionCopy;
}

export function AllListingsSection({ forcedCategorySlug, copy }: AllListingsSectionProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(forcedCategorySlug ?? "all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { t } = useTranslation();
  const l = useLocalePath();
  const { getBlockData } = useCmsPageBuilder("home");
  const listingBlockData = getBlockData("all-listings");
  const defaultTitleText = t("sections.listings.titleHighlight");
  const [defaultTitleFirstWord, ...defaultTitleRest] = defaultTitleText.split(" ");
  const defaultTitle = (
    <>
      <span className="text-foreground italic">{defaultTitleFirstWord}</span>
      {defaultTitleRest.length > 0 ? (
        <>
          {" "}
          <span className="text-gradient-gold italic">{defaultTitleRest.join(" ")}</span>
        </>
      ) : null}
    </>
  );

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useCities();
  const { data: regions, isLoading: regionsLoading, error: regionsError } = useRegions();

  const placementSelection = normalizePlacementSelection(listingBlockData.selection);
  const configuredCityId = normalizeListingFilterId(listingBlockData.cityId);
  const configuredCategoryId = normalizeListingFilterId(listingBlockData.categoryId);
  const configuredMaxItems = normalizeListingMaxItems(listingBlockData.maxItems, MAX_HOME_LISTINGS);
  const configuredListingIds = normalizeSelectedListingIds(listingBlockData.selectedListingIds);

  const mergedCategories = useMemo(
    () => buildMergedCategoryOptions(categories || []),
    [categories]
  );

  const forcedCategoryListingFilter = useMemo(() => {
    if (!forcedCategorySlug) return {};
    const forcedCategory = getMergedCategoryBySlug(forcedCategorySlug, mergedCategories);
    if (forcedCategory?.memberIds.length) {
      return { categoryIds: forcedCategory.memberIds };
    }

    // Avoid the expensive "all published listings" query while category metadata is still loading.
    return { categoryIds: ["__pending-forced-category__"] };
  }, [forcedCategorySlug, mergedCategories]);

  // Fetch data from Supabase once and filter locally. Forced category pages request only
  // the matching category ids so pages such as /golf do not download the full directory.
  const { data: allListings = [], isLoading: listingsLoading, error: listingsError } = usePublishedListings(forcedCategoryListingFilter);

  const isLoading = listingsLoading || categoriesLoading || citiesLoading || regionsLoading;
  const hasError = Boolean(listingsError || categoriesError || citiesError || regionsError);
  const { validListingIds } = validateSelectedListingIds(configuredListingIds, allListings);

  const resolvedCityId = useMemo(() => {
    if (selectedCity === "all") return "all";
    const match = (cities || []).find((city) => city.id === selectedCity || city.slug === selectedCity);
    return match?.id ?? "all";
  }, [selectedCity, cities]);

  const resolvedRegionId = useMemo(() => {
    if (selectedRegion === "all") return "all";
    const match = (regions || []).find((region) => region.id === selectedRegion || region.slug === selectedRegion);
    return match?.id ?? "all";
  }, [selectedRegion, regions]);

  const selectedMergedCategory = useMemo(
    () => getMergedCategoryBySlug(forcedCategorySlug ?? selectedCategory, mergedCategories),
    [forcedCategorySlug, selectedCategory, mergedCategories]
  );

  const effectiveCategory = forcedCategorySlug ?? selectedCategory;
  const categorySelectValue = effectiveCategory === "all"
    ? "all"
    : (selectedMergedCategory?.slug ?? "all");
  const citySelectValue = selectedCity === "all" ? "all" : resolvedCityId;
  const regionSelectValue = selectedRegion === "all" ? "all" : resolvedRegionId;

  const placedListings = useMemo(
    () =>
      resolveListingOrder({
        selection: placementSelection,
        listings: allListings,
        manualListingIds: validListingIds,
        cityId: configuredCityId ?? undefined,
        categoryId: configuredCategoryId ?? undefined,
        maxItems: configuredMaxItems,
      }),
    [
      allListings,
      placementSelection,
      validListingIds,
      configuredCityId,
      configuredCategoryId,
      configuredMaxItems,
    ],
  );

  const filteredListings = useMemo(
    () =>
      placedListings.filter((listing) => {
        if (
          effectiveCategory !== "all" &&
          (!selectedMergedCategory || !selectedMergedCategory.memberIds.includes(listing.category_id))
        ) {
          return false;
        }
        if (resolvedCityId !== "all" && listing.city_id !== resolvedCityId) return false;
        if (resolvedRegionId !== "all" && listing.region_id !== resolvedRegionId) return false;
        return true;
      }),
    [placedListings, effectiveCategory, selectedMergedCategory, resolvedCityId, resolvedRegionId]
  );

  const cappedListings = filteredListings;

  useEffect(() => {
    void trackBlockImpression({
      blockId: "all-listings",
      pageId: "home",
      selection: placementSelection,
    });
  }, [placementSelection]);

  // Get visible listings
  const visibleListings = cappedListings.slice(0, visibleCount);
  const hasMore = visibleCount < cappedListings.length;

  // Reset visible count when filters change
  const handleFilterChange = (type: 'category' | 'city' | 'region', value: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    if (type === 'category') setSelectedCategory(value);
    if (type === 'city') setSelectedCity(value);
    if (type === 'region') setSelectedRegion(value);
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, cappedListings.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, cappedListings.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoading) {
    return (
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="app-container content-max">
          <div className="mb-10 text-center sm:mb-12">
            <Skeleton className="h-10 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-[28rem] max-w-full mx-auto" />
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Skeleton className="h-10 w-full sm:w-[180px]" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>

          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 2xl:gap-7"
            aria-live="polite"
            aria-label={t("directory.loading")}
          >
            {Array.from({ length: LOADING_SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} variant="listing" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="app-container content-max text-center">
          <h2 className="text-title font-serif font-medium mb-3">
            {defaultTitle}
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto readable mb-6">
            We couldn&apos;t load listings right now. Please refresh and try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("directory.retry")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="all-premium-listings" className="scroll-mt-24 bg-gradient-to-b from-[#F8F6F2] to-white py-12 sm:py-16 lg:py-28 dark:from-[#1a1a1f] dark:to-background">
      <div className="app-container content-max px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-16">
          <h2 className="mb-4 font-serif text-2xl font-light tracking-wide text-foreground sm:mb-5 sm:text-4xl lg:text-5xl">
            {copy?.title?.trim()
              ? cmsText(copy.title, t("sections.listings.title"))
              : defaultTitle}
          </h2>
          <p className="mx-auto max-w-2xl text-body text-muted-foreground leading-relaxed sm:text-body-lg">
            {cmsText(copy?.subtitle ?? copy?.description, t("sections.listings.subtitle", { count: cappedListings.length }))}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col items-stretch justify-center gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          {!forcedCategorySlug && (
            <Select value={categorySelectValue} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger className="h-12 w-full bg-background border-border transition-colors hover:border-primary/50 sm:w-[180px]">
                <SelectValue placeholder={t("sections.listings.allCategories")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">{t("sections.listings.allCategories")}</SelectItem>
                {mergedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {translateCategoryName(t, cat.slug, cat.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={citySelectValue} onValueChange={(v) => handleFilterChange('city', v)}>
            <SelectTrigger className="h-12 w-full bg-background border-border transition-colors hover:border-primary/50 sm:w-[180px]">
              <SelectValue placeholder={t("sections.listings.allCities")} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">{t("sections.listings.allCities")}</SelectItem>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionSelectValue} onValueChange={(v) => handleFilterChange('region', v)}>
            <SelectTrigger className="h-12 w-full bg-background border-border transition-colors hover:border-primary/50 sm:w-[180px]">
              <SelectValue placeholder={t("sections.listings.allRegions")} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">{t("sections.listings.allRegions")}</SelectItem>
              {regions?.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedCategory !== "all" || selectedCity !== "all" || selectedRegion !== "all") && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedCity("all");
                setSelectedRegion("all");
                setVisibleCount(ITEMS_PER_PAGE);
              }}
            >
              {t("sections.listings.clearFilters")}
            </Button>
          )}
        </div>

        {/* Results count */}
        <p className="mb-6 text-center text-body-sm text-muted-foreground sm:mb-8">
          {t("sections.listings.showing", { visible: visibleListings.length, total: cappedListings.length })}
        </p>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-3">
          {visibleListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={l(`/listing/${listing.slug}`)}
              index={index}
              isFavorite={isFavorite(listing.id)}
              onToggleFavorite={() => toggleFavorite(listing.id)}
              onCardClick={() =>
                void trackListingClick({
                  listingId: listing.id,
                  cityId: listing.city_id,
                  categoryId: listing.category_id,
                  tier: listing.tier,
                  position: index + 1,
                  blockId: "all-listings",
                  pageId: "home",
                  selection: placementSelection,
                })
              }
            />
          ))}
        </div>

        {/* Infinite Scroll Loader */}
        {hasMore && (
          <div ref={loaderRef} className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-body-sm">{t("sections.listings.loadingMore")}</span>
            </div>
          </div>
        )}

        {/* All loaded message */}
        {!hasMore && cappedListings.length > ITEMS_PER_PAGE && (
          <p className="mt-12 text-center text-body-sm text-muted-foreground">
            {t("sections.listings.allLoaded", { count: cappedListings.length })}
          </p>
        )}

        {/* Empty state */}
        {cappedListings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{t("sections.listings.noResults")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedCity("all");
                setSelectedRegion("all");
                setVisibleCount(ITEMS_PER_PAGE);
              }}
            >
              {t("sections.listings.clearAll")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
