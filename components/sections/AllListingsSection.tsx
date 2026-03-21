import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useTranslation } from "react-i18next";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublishedListings } from "@/hooks/useListings";
import { useCategories, useCities, useRegions } from "@/hooks/useReferenceData";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildMergedCategoryOptions, getMergedCategoryBySlug } from "@/lib/categoryMerges";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { useHydrated } from "@/hooks/useHydrated";
import {
  getTierCardClasses,
  getTierImageZoom,
  getTierImageOverlay,
  getTierTitleClasses,
  getTierSpacing,
  isPremiumTier,
} from "@/lib/tier-design";

const ITEMS_PER_PAGE = 12;
const MAX_HOME_LISTINGS = 24;

// Animation variants for listing cards
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: (index % ITEMS_PER_PAGE) * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  })
};

export function AllListingsSection() {
  const mounted = useHydrated();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  // Fetch data from Supabase once and filter locally to avoid extra roundtrips
  const { data: allListings = [], isLoading: listingsLoading, error: listingsError } = usePublishedListings();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useCities();
  const { data: regions, isLoading: regionsLoading, error: regionsError } = useRegions();

  const isLoading = !mounted || listingsLoading || categoriesLoading || citiesLoading || regionsLoading;
  const hasError = Boolean(listingsError || categoriesError || citiesError || regionsError);

  const mergedCategories = useMemo(
    () => buildMergedCategoryOptions(categories || []),
    [categories]
  );

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
    [selectedCategory, mergedCategories]
  );

  const categorySelectValue = selectedCategory === "all"
    ? "all"
    : (selectedMergedCategory?.slug ?? "all");
  const citySelectValue = selectedCity === "all" ? "all" : resolvedCityId;
  const regionSelectValue = selectedRegion === "all" ? "all" : resolvedRegionId;

  const filteredListings = useMemo(
    () =>
      allListings.filter((listing) => {
        if (
          selectedCategory !== "all" &&
          (!selectedMergedCategory || !selectedMergedCategory.memberIds.includes(listing.category_id))
        ) {
          return false;
        }
        if (resolvedCityId !== "all" && listing.city_id !== resolvedCityId) return false;
        if (resolvedRegionId !== "all" && listing.region_id !== resolvedRegionId) return false;
        return true;
      }),
    [allListings, selectedCategory, selectedMergedCategory, resolvedCityId, resolvedRegionId]
  );

  // Sort: curated first, then by tier, then alphabetically
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      if (a.is_curated !== b.is_curated) return a.is_curated ? -1 : 1;
      const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      return a.name.localeCompare(b.name);
    });
  }, [filteredListings]);

  const cappedListings = useMemo(
    () => sortedListings.slice(0, MAX_HOME_LISTINGS),
    [sortedListings]
  );

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
    if (!mounted) return undefined;

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
  }, [hasMore, isLoadingMore, loadMore, mounted]);

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="app-container content-max">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-72 mx-auto mb-4" />
            <Skeleton className="h-5 w-[28rem] max-w-full mx-auto" />
          </div>

          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>

          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 2xl:gap-7"
            aria-live="polite"
            aria-label={t("directory.loading")}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} variant="listing" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="py-20 bg-background">
        <div className="app-container content-max text-center">
          <h2 className="text-title font-serif font-medium mb-3">
            {t("sections.listings.title")} <span className="text-gradient-gold">{t("sections.listings.titleHighlight")}</span>
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto readable mb-6">
            We couldn&apos;t load listings right now. Please refresh and try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("directory.retry", "Retry")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#F8F6F2] to-white dark:from-[#1a1a1f] dark:to-background">
      <div className="app-container content-max px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-wide mb-5 text-foreground">
            {t("sections.listings.title")} <span className="text-gradient-gold italic">{t("sections.listings.titleHighlight")}</span>
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("sections.listings.subtitle", { count: cappedListings.length })}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Select value={categorySelectValue} onValueChange={(v) => handleFilterChange('category', v)}>
            <SelectTrigger className="h-12 w-[180px] bg-background border-border hover:border-primary/50 transition-colors">
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

          <Select value={citySelectValue} onValueChange={(v) => handleFilterChange('city', v)}>
            <SelectTrigger className="h-12 w-[180px] bg-background border-border hover:border-primary/50 transition-colors">
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
            <SelectTrigger className="h-12 w-[180px] bg-background border-border hover:border-primary/50 transition-colors">
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
        <p className="text-body-sm text-muted-foreground text-center mb-8">
          {t("sections.listings.showing", { visible: visibleListings.length, total: cappedListings.length })}
        </p>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {visibleListings.map((listing, index) => {
            const tierCardClass = getTierCardClasses(listing.tier);
            const tierImageZoom = getTierImageZoom(listing.tier);
            const tierTitleClass = getTierTitleClasses(listing.tier);
            const tierSpacing = getTierSpacing(listing.tier);
            const isPremium = isPremiumTier(listing.tier);
            
            return (
            <motion.div
              key={listing.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              className="h-full group"
            >
              <Link
                href={buildLangPath(langPrefix, `/listing/${listing.slug}`)}
                className="block h-full"
              >
                <article className={cn(
                  "relative overflow-hidden flex flex-col h-full",
                  tierCardClass,
                  isPremium && "ring-1 ring-inset ring-[#C7A35A]/20"
                )}>
                  {/* Image */}
                  <div className={cn(
                    "relative bg-muted overflow-hidden",
                    isPremium ? "aspect-[5/4]" : "aspect-[4/3]"
                  )}>
                    <ListingImage
                      src={listing.featured_image_url}
                      category={listing.category?.slug}
                      categoryImageUrl={listing.category?.image_url}
                      listingId={listing.id}
                      alt={listing.name}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out",
                        tierImageZoom
                      )}
                    />
                    
                    {/* Overlay gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent transition-opacity duration-300",
                      listing.tier === "unverified" ? "opacity-0" : "opacity-0 group-hover:opacity-100",
                      listing.tier === "verified" && "opacity-40 group-hover:opacity-70",
                      isPremium && "opacity-60 group-hover:opacity-85"
                    )} />

                    {/* Premium tier accent line */}
                    {isPremium && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C7A35A]/60 to-transparent" />
                    )}

                    {/* Badges - Top Left */}
                    <div className={cn(
                      "absolute top-4 left-4 flex flex-wrap gap-2",
                      isPremium && "left-5 top-5"
                    )}>
                      <ListingTierBadge tier={listing.tier} />
                    </div>

                    {/* Google Reviews - Top Right */}
                    {listing.google_rating && (
                      <GoogleRatingBadge
                        rating={listing.google_rating}
                        reviewCount={listing.google_review_count}
                        variant="overlay"
                        size="sm"
                        className={cn(
                          "absolute top-4 right-4",
                          isPremium && "top-5 right-5"
                        )}
                      />
                    )}

                    {/* Bottom row - Category badge (left) & Favorite button (right) */}
                    <div className={cn(
                      "absolute bottom-4 left-4 right-4 flex items-center justify-between",
                      isPremium && "bottom-5 left-5 right-5"
                    )}>
                      <Badge variant="secondary" className={cn(
                        "text-xs bg-black/70 backdrop-blur-sm text-white/95 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-0",
                        isPremium && "bg-black/80 text-[#C7A35A]"
                      )}>
                        {renderCategoryIcon(listing.category?.icon ?? undefined, cn(
                          "h-3.5 w-3.5",
                          isPremium ? "text-[#C7A35A]" : "text-white/90"
                        ))}
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

                  {/* Content */}
                  <div className={cn("flex-1 flex flex-col bg-card", tierSpacing.padding)}>
                    <h3 className={cn(
                      tierTitleClass,
                      "text-foreground mb-2",
                      isPremium && "text-xl lg:text-2xl"
                    )}>
                      {listing.name}
                    </h3>

                    <p className={cn(
                      "text-muted-foreground leading-relaxed line-clamp-2",
                      tierSpacing.gap === "gap-5" ? "mb-5" : "mb-4",
                      isPremium && "text-sm"
                    )}>
                      {listing.short_description || listing.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground/80">
                      <MapPin className={cn(
                        "h-3.5 w-3.5",
                        isPremium ? "text-[#C7A35A]/70" : "text-muted-foreground/60"
                      )} />
                      <span>{listing.city?.name}</span>
                      {listing.region && (
                        <>
                          <span className="text-border">•</span>
                          <span>{listing.region.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
          })}
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
