import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ListingCard } from "@/components/ListingCard";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useLocalePath } from "@/hooks/useLocalePath";
import { usePublishedListings, type ListingWithRelations } from "@/hooks/useListings";
import { useCategories, useCities, useRegions } from "@/hooks/useReferenceData";
import { trackBlockImpression, trackListingClick } from "@/lib/analytics/platformTracking";
import { buildMergedCategoryOptions, getMergedCategoryBySlug } from "@/lib/categoryMerges";
import {
  normalizeListingFilterId,
  normalizeListingMaxItems,
  normalizeSelectedListingIds,
  validateSelectedListingIds,
} from "@/lib/cms/listing-block-config";
import { normalizePlacementSelection, resolveListingOrder } from "@/lib/cms/placement-engine";
import { cmsText, type HomeSectionCopy } from "@/lib/cms/home-section-copy";
import { isApprovedGolfCourse } from "@/lib/golf/allowed-courses";
import { HOMEPAGE_PREMIUM_LIMIT } from "@/lib/listings/homepage-listing-pool";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";
import { homepageListingSplitQueryKey } from "@/lib/query-keys";

const ITEMS_PER_PAGE = 12;
const DEFAULT_FORCED_CATEGORY_LISTINGS = 24;
const LOADING_SKELETON_COUNT = ITEMS_PER_PAGE;

interface AllListingsSectionProps {
  forcedCategorySlug?: string;
  copy?: HomeSectionCopy;
}

export function AllListingsSection({ forcedCategorySlug, copy }: AllListingsSectionProps = {}) {
  if (!forcedCategorySlug) {
    return <HomepagePremiumListingsSection copy={copy} />;
  }

  return <FilteredListingsSection forcedCategorySlug={forcedCategorySlug} copy={copy} />;
}

function PremiumTitle({ text }: { text: string }) {
  const [firstWord, ...rest] = text.split(" ");

  return (
    <>
      <span className="text-foreground italic">{firstWord}</span>
      {rest.length > 0 ? (
        <>
          {" "}
          <span className="text-gradient-gold italic">{rest.join(" ")}</span>
        </>
      ) : null}
    </>
  );
}

function HomepagePremiumListingsSection({ copy }: { copy?: HomeSectionCopy }) {
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { t } = useTranslation();
  const l = useLocalePath();
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { getBlockData } = useCmsPageBuilder("home");
  const placementSelection = normalizePlacementSelection(getBlockData("all-listings").selection);
  const { data: homepagePremiumListings = [], isLoading } = useQuery<ListingWithRelations[]>({
    queryKey: homepageListingSplitQueryKey("premium", locale),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });

  const visibleListings = homepagePremiumListings.slice(0, HOMEPAGE_PREMIUM_LIMIT);

  useEffect(() => {
    void trackBlockImpression({
      blockId: "all-listings",
      pageId: "home",
      selection: placementSelection,
    });
  }, [placementSelection]);

  if (isLoading) {
    return (
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="app-container content-max">
          <div className="mb-10 text-center sm:mb-12">
            <Skeleton className="mx-auto mb-4 h-10 w-72" />
            <Skeleton className="mx-auto h-5 w-[28rem] max-w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 2xl:gap-7">
            {Array.from({ length: HOMEPAGE_PREMIUM_LIMIT }).map((_, index) => (
              <SkeletonCard key={index} variant="listing" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="all-premium-listings"
      className="scroll-mt-24 bg-gradient-to-b from-[#F8F6F2] to-white py-12 sm:py-16 lg:py-24 dark:from-[#1a1a1f] dark:to-background"
    >
      <div className="app-container content-max px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("listing.badge.verified")}
          </p>
          <h2 className="mb-4 font-serif text-2xl font-light tracking-wide text-foreground sm:mb-5 sm:text-4xl lg:text-5xl">
            {copy?.title?.trim()
              ? cmsText(copy.title, t("sections.listings.title"))
              : <PremiumTitle text={t("sections.listings.titleHighlight")} />}
          </h2>
          <p className="mx-auto max-w-2xl text-body leading-relaxed text-muted-foreground sm:text-body-lg">
            {cmsText(copy?.subtitle ?? copy?.description, t("sections.listings.subtitle", { count: visibleListings.length }))}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-primary">
              {t("listing.badge.signature")}
            </span>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-emerald-700">
              {t("listing.badge.verified")}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1">
              {t("sections.homepage.hero.proof.curated")}
            </span>
          </div>
        </div>

        <nav
          aria-label={t("sections.homepage.smartSearch.intentLabel")}
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {[
            { key: "stay", href: "/visit/albufeira/accommodation" },
            { key: "eatDrink", href: "/visit/lagos/restaurants" },
            { key: "golf", href: "/golf" },
            { key: "realEstate", href: "/real-estate" },
            { key: "events", href: "/events" },
            { key: "directory", href: "/directory", label: t("sections.homepage.smartSearch.cta") },
          ].map((item) => (
            <Link
              key={item.key}
              href={l(item.href)}
              className="rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.label ?? t(`sections.homepage.smartSearch.intents.${item.key}`)}
            </Link>
          ))}
        </nav>

        <p className="mb-6 text-center text-body-sm text-muted-foreground sm:mb-8">
          {t("sections.listings.showing", { visible: visibleListings.length, total: visibleListings.length })}
        </p>

        {visibleListings.length > 0 ? (
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
        ) : (
          <div className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">{t("sections.listings.noResults")}</p>
            <Button variant="outline" asChild>
              <Link href={l("/directory")}>{t("sections.homepage.smartSearch.cta")}</Link>
            </Button>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button variant="gold" size="lg" asChild>
            <Link href={l("/directory")} className="gap-2">
              {t("sections.homepage.smartSearch.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FilteredListingsSection({
  forcedCategorySlug,
  copy,
}: {
  forcedCategorySlug: string;
  copy?: HomeSectionCopy;
}) {
  const initialVisibleCount = ITEMS_PER_PAGE;
  const [selectedCategory, setSelectedCategory] = useState<string>(forcedCategorySlug);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { t } = useTranslation();
  const l = useLocalePath();
  const { getBlockData } = useCmsPageBuilder("home");
  const listingBlockData = getBlockData("all-listings");
  const defaultTitleText = t("sections.listings.titleHighlight");

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useCities();
  const { data: regions, isLoading: regionsLoading, error: regionsError } = useRegions();

  const placementSelection = normalizePlacementSelection(listingBlockData.selection);
  const configuredCityId = normalizeListingFilterId(listingBlockData.cityId);
  const configuredCategoryId = normalizeListingFilterId(listingBlockData.categoryId);
  const configuredMaxItems = normalizeListingMaxItems(
    listingBlockData.maxItems,
    DEFAULT_FORCED_CATEGORY_LISTINGS,
  );
  const configuredListingIds = normalizeSelectedListingIds(listingBlockData.selectedListingIds);

  const mergedCategories = useMemo(
    () => buildMergedCategoryOptions(categories || []),
    [categories],
  );

  const forcedCategoryListingFilter = useMemo(() => {
    const forcedCategory = getMergedCategoryBySlug(forcedCategorySlug, mergedCategories);
    if (forcedCategory?.memberIds.length) {
      return { categoryIds: forcedCategory.memberIds };
    }

    return { categoryIds: ["__pending-forced-category__"] };
  }, [forcedCategorySlug, mergedCategories]);

  const {
    data: allListings = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = usePublishedListings(forcedCategoryListingFilter, { enabled: true });

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
    () => getMergedCategoryBySlug(selectedCategory, mergedCategories),
    [selectedCategory, mergedCategories],
  );

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
          selectedCategory !== "all" &&
          (!selectedMergedCategory || !selectedMergedCategory.memberIds.includes(listing.category_id))
        ) {
          return false;
        }
        if (resolvedCityId !== "all" && listing.city_id !== resolvedCityId) return false;
        if (resolvedRegionId !== "all" && listing.region_id !== resolvedRegionId) return false;
        if (
          forcedCategorySlug === "golf" &&
          !isApprovedGolfCourse({ slug: listing.slug, name: listing.name })
        ) {
          return false;
        }
        return true;
      }),
    [
      placedListings,
      selectedCategory,
      selectedMergedCategory,
      resolvedCityId,
      resolvedRegionId,
      forcedCategorySlug,
    ],
  );

  const cappedListings = filteredListings.slice(0, configuredMaxItems);
  const cappedListingsLength = cappedListings.length;
  const visibleListings = cappedListings.slice(0, visibleCount);
  const hasMore = visibleCount < cappedListingsLength;
  const hasActiveFilters = selectedCity !== "all" || selectedRegion !== "all";

  const handleFilterChange = (type: "city" | "region", value: string) => {
    setVisibleCount(initialVisibleCount);
    if (type === "city") setSelectedCity(value);
    if (type === "region") setSelectedRegion(value);
  };

  const clearFilters = () => {
    setSelectedCategory(forcedCategorySlug);
    setSelectedCity("all");
    setSelectedRegion("all");
    setVisibleCount(initialVisibleCount);
  };

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, cappedListingsLength));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, cappedListingsLength]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
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
            <Skeleton className="mx-auto mb-4 h-10 w-72" />
            <Skeleton className="mx-auto h-5 w-[28rem] max-w-full" />
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Skeleton className="h-10 w-full sm:w-[180px]" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>

          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 2xl:gap-7"
            aria-live="polite"
            aria-label={t("directory.loading")}
          >
            {Array.from({ length: LOADING_SKELETON_COUNT }).map((_, index) => (
              <SkeletonCard key={index} variant="listing" />
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
          <h2 className="mb-3 font-serif text-title font-medium">
            <PremiumTitle text={defaultTitleText} />
          </h2>
          <p className="readable mx-auto mb-6 max-w-2xl text-body text-muted-foreground">
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
    <section
      id="all-premium-listings"
      className="scroll-mt-24 bg-gradient-to-b from-[#F8F6F2] to-white py-12 sm:py-16 lg:py-28 dark:from-[#1a1a1f] dark:to-background"
    >
      <div className="app-container content-max px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <h2 className="mb-4 font-serif text-2xl font-light tracking-wide text-foreground sm:mb-5 sm:text-4xl lg:text-5xl">
            {copy?.title?.trim()
              ? cmsText(copy.title, t("sections.listings.title"))
              : <PremiumTitle text={defaultTitleText} />}
          </h2>
          <p className="mx-auto max-w-2xl text-body leading-relaxed text-muted-foreground sm:text-body-lg">
            {cmsText(copy?.subtitle ?? copy?.description, t("sections.listings.subtitle", { count: cappedListings.length }))}
          </p>
        </div>

        <div className="mb-6 flex flex-col items-stretch justify-center gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Select value={selectedCity === "all" ? "all" : resolvedCityId} onValueChange={(value) => handleFilterChange("city", value)}>
            <SelectTrigger className="h-12 w-full border-border bg-background transition-colors hover:border-primary/50 sm:w-[180px]">
              <SelectValue placeholder={t("sections.listings.allCities")} />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all">{t("sections.listings.allCities")}</SelectItem>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRegion === "all" ? "all" : resolvedRegionId} onValueChange={(value) => handleFilterChange("region", value)}>
            <SelectTrigger className="h-12 w-full border-border bg-background transition-colors hover:border-primary/50 sm:w-[180px]">
              <SelectValue placeholder={t("sections.listings.allRegions")} />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="all">{t("sections.listings.allRegions")}</SelectItem>
              {regions?.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" className="w-full sm:w-auto" onClick={clearFilters}>
              {t("sections.listings.clearFilters")}
            </Button>
          )}
        </div>

        <p className="mb-6 text-center text-body-sm text-muted-foreground sm:mb-8">
          {t("sections.listings.showing", { visible: visibleListings.length, total: cappedListings.length })}
        </p>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-3">
          {visibleListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={l(`/listing/${listing.slug}`)}
              index={index}
              isFavorite={isFavorite(listing.id)}
              onToggleFavorite={() => toggleFavorite(listing.id)}
            />
          ))}
        </div>

        {hasMore && (
          <div ref={loaderRef} className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-body-sm">{t("sections.listings.loadingMore")}</span>
            </div>
          </div>
        )}

        {!hasMore && cappedListings.length > initialVisibleCount && (
          <p className="mt-12 text-center text-body-sm text-muted-foreground">
            {t("sections.listings.allLoaded", { count: cappedListings.length })}
          </p>
        )}

        {cappedListings.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">{t("sections.listings.noResults")}</p>
            <Button variant="outline" onClick={clearFilters}>
              {t("sections.listings.clearAll")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
