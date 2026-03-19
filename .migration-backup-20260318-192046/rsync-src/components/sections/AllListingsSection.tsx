"use client";
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
  const [hasHydrated, setHasHydrated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isFavorite } = useFavoriteListings();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  // Fetch data from Supabase once and filter locally to avoid extra roundtrips
  const { data: allListings = [], isLoading: listingsLoading } = usePublishedListings();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: cities, isLoading: citiesLoading } = useCities();
  const { data: regions, isLoading: regionsLoading } = useRegions();

  const isLoading = listingsLoading || categoriesLoading || citiesLoading || regionsLoading;
  const showLoadingState = !hasHydrated || isLoading;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const mergedCategories = useMemo(
    () => buildMergedCategoryOptions(categories || []),
    [categories]
  );

  const selectedMergedCategory = useMemo(
    () => getMergedCategoryBySlug(selectedCategory, mergedCategories),
    [selectedCategory, mergedCategories]
  );

  const filteredListings = useMemo(
    () =>
      allListings.filter((listing) => {
        if (
          selectedCategory !== "all" &&
          (!selectedMergedCategory ||
            !listing.category_id ||
            !selectedMergedCategory.memberIds.includes(listing.category_id))
        ) {
          return false;
        }
        if (selectedCity !== "all" && listing.city_id !== selectedCity) return false;
        if (selectedRegion !== "all" && listing.region_id !== selectedRegion) return false;
        return true;
      }),
    [allListings, selectedCategory, selectedMergedCategory, selectedCity, selectedRegion]
  );

  // Sort: curated first, then by tier, then alphabetically
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      if (a.is_curated !== b.is_curated) return a.is_curated ? -1 : 1;
      const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
      const tierA = tierOrder[a.tier ?? "unverified"] ?? 2;
      const tierB = tierOrder[b.tier ?? "unverified"] ?? 2;
      if (tierA !== tierB) return tierA - tierB;
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

  if (showLoadingState) {
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

  return (
    <section className="py-20 bg-background">
      <div className="app-container content-max">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-title font-serif font-medium mb-4">
            {t("sections.listings.title")} <span className="text-gradient-gold">{t("sections.listings.titleHighlight")}</span>
          </h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto readable">
            {t("sections.listings.subtitle", { count: cappedListings.length })}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Select value={selectedCategory} onValueChange={(v) => handleFilterChange('category', v)}>
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

          <Select value={selectedCity} onValueChange={(v) => handleFilterChange('city', v)}>
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

          <Select value={selectedRegion} onValueChange={(v) => handleFilterChange('region', v)}>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 2xl:gap-7">
          {visibleListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              className="h-full"
            >
              <Link
                href={buildLangPath(langPrefix, `/listing/${listing.slug}`)}
                className="group block h-full"
              >
                <article className="glass-box glass-box-listing-shimmer overflow-hidden flex flex-col h-full">
                  {listing.tier === "signature" && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                    />
                  )}

                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <ListingImage
                      src={listing.featured_image_url}
                      category={listing.category?.slug}
                      categoryImageUrl={listing.category?.image_url}
                      listingId={listing.id}
                      alt={listing.name}
                      className="absolute inset-0 w-full h-full object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badges - Top Left */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <ListingTierBadge tier={listing.tier} />
                    </div>

                    {/* Google Reviews - Top Right */}
                    {(listing as any).google_rating && (
                      <GoogleRatingBadge
                        rating={(listing as any).google_rating}
                        reviewCount={(listing as any).google_review_count}
                        variant="overlay"
                        size="sm"
                        className="absolute top-3 right-3"
                      />
                    )}

                    {/* Bottom row - Category badge (left) & Favorite button (right) */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                        {renderCategoryIcon(listing.category?.icon ?? undefined, "h-3 w-3 text-white")}
                        {translateCategoryName(
                          t,
                          listing.category?.slug ?? undefined,
                          listing.category?.name ?? undefined,
                        )}
                      </Badge>

                      <FavoriteButton
                        isFavorite={isFavorite(listing.id)}
                        type="listing"
                        id={listing.id}
                        size="sm"
                        variant="glassmorphism"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-serif font-medium text-[1.3rem] lg:text-[1.72rem] leading-[1.18] mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {listing.name}
                    </p>

                    <p className="text-body-sm text-foreground/80 dark:text-white/85 line-clamp-2 mb-3">
                      {listing.short_description || listing.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.city?.name}</span>
                      {listing.region && (
                        <>
                          <span>•</span>
                          <span>{listing.region.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
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
