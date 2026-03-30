import { useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BedDouble, Building2, Loader2, MapPin, MapPinned, Sparkles, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapListingPoint } from "@/components/map/ListingsLeafletMap";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useSignatureListings } from "@/hooks/useListings";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { translateCategoryName } from "@/lib/translateCategory";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import ListingImage from "@/components/ListingImage";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import {
  DISCOVERY_FILTERS,
  mapListingToDiscoveryCategory,
  type DiscoveryCategory,
} from "@/lib/discoveryCategory";

const PREVIEW_LIMIT = 6;

const ListingsLeafletMap = dynamic(
  () => import("@/components/map/ListingsLeafletMap"),
  { ssr: false }
);

const FILTER_ICONS: Record<DiscoveryCategory, ComponentType<{ className?: string }>> = {
  hotels: BedDouble,
  restaurants: UtensilsCrossed,
  experiences: Sparkles,
  "real-estate": Building2,
};

export function SignatureMapSection() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const [activeDiscoveryFilters, setActiveDiscoveryFilters] = useState<DiscoveryCategory[]>(() =>
    DISCOVERY_FILTERS.map((filter) => filter.key)
  );
  const { data: signatureListings = [], isLoading: listingsLoading } = useSignatureListings();
  const activeFilterSet = useMemo(() => new Set(activeDiscoveryFilters), [activeDiscoveryFilters]);
  const areAllFiltersDisabled = activeDiscoveryFilters.length === 0;

  const discoveryListings = useMemo(
    () =>
      signatureListings.map((listing) => ({
        listing,
        discoveryCategories: mapListingToDiscoveryCategory(listing),
      })),
    [signatureListings]
  );

  const filteredDiscoveryListings = useMemo(() => {
    if (areAllFiltersDisabled) return [];
    return discoveryListings.filter((entry) =>
      entry.discoveryCategories.some((category) => activeFilterSet.has(category))
    );
  }, [activeFilterSet, areAllFiltersDisabled, discoveryListings]);

  const previewListings = useMemo(
    () => filteredDiscoveryListings.slice(0, PREVIEW_LIMIT),
    [filteredDiscoveryListings]
  );

  const mapPoints = useMemo<MapListingPoint[]>(
    () =>
      filteredDiscoveryListings
        .map<MapListingPoint | null>(({ listing }) => {
          const latitude = Number(listing.latitude ?? listing.city?.latitude ?? NaN);
          const longitude = Number(listing.longitude ?? listing.city?.longitude ?? NaN);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

          return {
            id: listing.id,
            name: listing.name,
            slug: listing.slug,
            latitude,
            longitude,
            categorySlug: listing.category?.slug,
            categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
            categoryImageUrl: listing.category?.image_url,
            cityName: listing.city?.name || "Algarve",
            tier: listing.tier,
            featuredImageUrl: listing.featured_image_url,
            href: l(`/listing/${listing.slug}`),
          } satisfies MapListingPoint;
        })
        .filter((point): point is MapListingPoint => point !== null)
        .slice(0, 240),
    [filteredDiscoveryListings, t]
  );

  const mapEmptyMessage = useMemo(() => {
    if (areAllFiltersDisabled) {
      return t("sections.vip.discovery.selectAtLeastOne", "Select at least one category to explore the map.");
    }
    if (filteredDiscoveryListings.length === 0) {
      return t("sections.vip.discovery.noMatches", "No places match the selected filters yet.");
    }
    return t("sections.vip.discovery.noCoordinates", "Matching places with map coordinates will appear here.");
  }, [areAllFiltersDisabled, filteredDiscoveryListings.length, t]);

  const toggleDiscoveryFilter = (category: DiscoveryCategory) => {
    setActiveDiscoveryFilters((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return DISCOVERY_FILTERS.map((item) => item.key).filter(
        (item) => item === category || current.includes(item)
      );
    });
  };

  return (
    <section className="py-20 border-t border-border/60">
      <div className="app-container space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <ListingTierBadge tier="signature" size="sm" className="mb-3" />
            <h2 className="text-title font-serif font-medium text-foreground">
              {t("sections.vip.title")} <span className="text-gradient-gold">Map</span>
            </h2>
            <p className="text-body text-muted-foreground mt-2 max-w-2xl readable">
              {t("sections.vip.subtitle")} across the Algarve, all in one interactive view.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-body-xs">
              <MapPinned className="h-3.5 w-3.5 mr-1.5" />
              {t("sections.vip.discovery.mapped", "{{count}} mapped", { count: mapPoints.length })} · {t("sections.vip.discovery.matching", "{{count}} matching", { count: filteredDiscoveryListings.length })}
            </Badge>
            <Link href={l("/map")}>
              <Button variant="outline">{t("common.openFullMap", "Open Full Map")}</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/40 p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-body-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
            {t("sections.vip.discovery.filterLabel", "Explore by category")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DISCOVERY_FILTERS.map((filter) => {
              const isActive = activeFilterSet.has(filter.key);
              const Icon = FILTER_ICONS[filter.key];
              const filterLabel = t(`sections.vip.discovery.filters.${filter.key}`, filter.label);

              return (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleDiscoveryFilter(filter.key)}
                  className={[
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "border-primary/70 bg-gradient-to-r from-[hsla(43,74%,49%,0.22)] to-[hsla(43,80%,35%,0.18)] text-foreground shadow-[0_6px_18px_hsla(43,74%,49%,0.18)]"
                      : "border-border/80 bg-background/70 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className={isActive ? "h-4 w-4 text-primary" : "h-4 w-4"} />
                  <span>{filterLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {listingsLoading ? (
          <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
            <div className="h-[460px] flex items-center justify-center">
              <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("sections.vip.discovery.loadingMap", "Loading map...")}
              </span>
            </div>
          </div>
        ) : (
          <ListingsLeafletMap
            points={mapPoints}
            enableClustering
            showPopups
            autoFit
            scrollWheelZoom={false}
            mapClassName="h-[460px]"
            emptyMessage={mapEmptyMessage}
          />
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg md:text-xl font-serif font-medium text-foreground">
              {t("sections.vip.discovery.previewTitle", "Discovery Highlights")}
            </h3>
            <Badge variant="outline" className="text-xs md:text-sm">
              {Math.min(previewListings.length, PREVIEW_LIMIT)} / {filteredDiscoveryListings.length}
            </Badge>
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
                <div key={index} className="glass-box overflow-hidden">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : areAllFiltersDisabled ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-body-sm text-muted-foreground">
              {t("sections.vip.discovery.selectAtLeastOne", "Select at least one category to explore the map.")}
            </div>
          ) : filteredDiscoveryListings.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-5 text-body-sm text-muted-foreground">
              {t("sections.vip.discovery.noMatches", "No places match the selected filters yet.")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewListings.map(({ listing }) => (
                <Link
                  key={listing.id}
                  href={l(`/listing/${listing.slug}`)}
                  className="group block h-full"
                >
                  <article className="glass-box glass-box-listing-shimmer overflow-hidden flex h-full flex-col">
                    {listing.tier === "signature" && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                      />
                    )}

                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <ListingImage
                        src={listing.featured_image_url}
                        category={listing.category?.slug}
                        categoryImageUrl={listing.category?.image_url}
                        listingId={listing.id}
                        alt={listing.name}
                        className="absolute inset-0 h-full w-full object-cover scale-[1.08] transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <ListingTierBadge tier={listing.tier} />
                      </div>

                      {listing.google_rating && (
                        <GoogleRatingBadge
                          rating={listing.google_rating}
                          reviewCount={listing.google_review_count}
                          variant="overlay"
                          size="sm"
                          className="absolute top-3 right-3"
                        />
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                          {renderCategoryIcon(listing.category?.icon ?? undefined, "h-3 w-3 text-white")}
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
                      <p className="font-serif font-medium text-base lg:text-[1.32rem] mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {listing.name}
                      </p>

                      <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
                        {listing.short_description || listing.description}
                      </p>

                      <div className="mt-auto flex items-center gap-2 text-body-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.city?.name || "Algarve"}</span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SignatureMapSection;
