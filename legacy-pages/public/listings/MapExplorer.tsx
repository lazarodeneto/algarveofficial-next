import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, Filter, Loader2, MapPinned, Search, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type MapListingPoint, type MapViewportBounds } from "@/components/map/ListingsLeafletMap";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";

import dynamic from "next/dynamic";
const ListingsLeafletMap = dynamic(() => import("@/components/map/ListingsLeafletMap"), { 
  ssr: false,
  loading: () => <div className="h-[calc(100vh-13rem)] min-h-[560px] w-full bg-muted animate-pulse rounded-lg" />
});
import { usePublishedListings, type ListingBounds, type ListingFilters, type ListingTier } from "@/hooks/useListings";
import { useCategories, useCities, useRegions } from "@/hooks/useReferenceData";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { translateCategoryName } from "@/lib/translateCategory";
import {
  buildMergedCategoryOptions,
  getMergedCategoryBySlug,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { MapSyncProvider, useMapSync } from "@/lib/map/MapSyncContext";

const DEFAULT_CENTER: [number, number] = [37.08, -8.15];
const DEFAULT_ZOOM = 9.5;
const MAX_BOUNDS: [[number, number], [number, number]] = [[36.7, -9.2], [37.5, -7.2]];

function isWithinAlgarveBounds(latitude: number, longitude: number): boolean {
  return latitude >= 36.7 && latitude <= 37.5 && longitude >= -9.2 && longitude <= -7.2;
}

function parseBounds(searchParams: { get: (name: string) => string | null }): ListingBounds | undefined {
  const north = Number(searchParams.get("north"));
  const south = Number(searchParams.get("south"));
  const east = Number(searchParams.get("east"));
  const west = Number(searchParams.get("west"));

  if (
    !Number.isFinite(north) ||
    !Number.isFinite(south) ||
    !Number.isFinite(east) ||
    !Number.isFinite(west) ||
    north <= south ||
    east <= west
  ) {
    return undefined;
  }

  return { north, south, east, west };
}

function roundBound(value: number): string {
  return value.toFixed(5);
}

function boundsChanged(a?: ListingBounds | null, b?: ListingBounds | null): boolean {
  if (!a || !b) return Boolean(a || b);

  const latSpan = Math.max(0.01, Math.abs(a.north - a.south));
  const lngSpan = Math.max(0.01, Math.abs(a.east - a.west));
  const latThreshold = latSpan * 0.18;
  const lngThreshold = lngSpan * 0.18;

  return (
    Math.abs(a.north - b.north) > latThreshold ||
    Math.abs(a.south - b.south) > latThreshold ||
    Math.abs(a.east - b.east) > lngThreshold ||
    Math.abs(a.west - b.west) > lngThreshold
  );
}

export default function MapExplorer() {
  return (
    <MapSyncProvider>
      <MapExplorerContent />
    </MapSyncProvider>
  );
}

function MapExplorerContent() {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const { activeId, setActiveId } = useMapSync();
  const { getText, isBlockEnabled } = useCmsPageBuilder("map");
  const router = useRouter();
  const pathname = usePathname() || "/map";
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [currentBounds, setCurrentBounds] = useState<ListingBounds | null>(null);
  const [pendingBounds, setPendingBounds] = useState<ListingBounds | null>(null);
  const baselineBoundsRef = useRef<ListingBounds | null>(null);

  const appliedBounds = useMemo(() => parseBounds(searchParams), [searchParams]);

  const setSearchParams = useCallback(
    (nextParams: URLSearchParams, options?: { replace?: boolean }) => {
      const query = nextParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (options?.replace) {
        router.replace(href);
        return;
      }
      router.push(href);
    },
    [pathname, router]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 280);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: cities = [],
    isLoading: citiesLoading,
  } = useCities();
  const {
    data: regions = [],
    isLoading: regionsLoading,
  } = useRegions();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories();

  const mergedCategories = useMemo(() => buildMergedCategoryOptions(categories), [categories]);

  const selectedCategoryItem = useMemo(
    () => getMergedCategoryBySlug(selectedCategory, mergedCategories),
    [mergedCategories, selectedCategory]
  );
  const selectedCategoryIds = selectedCategoryItem?.memberIds ?? [];

  useEffect(() => {
    const qParam = searchParams.get("q");
    const regionParam = searchParams.get("region");
    const cityParam = searchParams.get("city");
    const categoryParam = searchParams.get("category");
    const tierParam = searchParams.get("tier");
    const nextParams = new URLSearchParams(searchParams);
    let shouldReplaceParams = false;
    const canResolveCategory = mergedCategories.length > 0;

    if (qParam !== null) setSearch(qParam);
    if (regionParam) setSelectedRegion(regionParam);
    if (cityParam) setSelectedCity(cityParam);
    if (tierParam === "signature" || tierParam === "verified" || tierParam === "all") {
      setSelectedTier(tierParam);
    }

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

    if (shouldReplaceParams) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [categories, mergedCategories, searchParams, setSearchParams]);

  const listingFilters = useMemo<ListingFilters>(
    () => ({
      search: debouncedSearch || undefined,
      categoryIds: selectedCategory !== "all" ? selectedCategoryIds : undefined,
      cityId: selectedCity !== "all" ? selectedCity : undefined,
      regionId: selectedRegion !== "all" ? selectedRegion : undefined,
      tier: selectedTier !== "all" ? (selectedTier as ListingTier) : undefined,
      bounds: appliedBounds,
    }),
    [appliedBounds, debouncedSearch, selectedCategory, selectedCategoryIds, selectedCity, selectedRegion, selectedTier]
  );

  const {
    data: listings = [],
    isLoading: listingsLoading,
    error,
  } = usePublishedListings(listingFilters);

  const isLoading = listingsLoading || citiesLoading || regionsLoading || categoriesLoading;

  const mapPoints = useMemo<MapListingPoint[]>(
    () =>
      listings
        .map<MapListingPoint | null>((listing) => {
          const latitude = Number(listing.latitude ?? listing.city?.latitude ?? NaN);
          const longitude = Number(listing.longitude ?? listing.city?.longitude ?? NaN);
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
          if (!isWithinAlgarveBounds(latitude, longitude)) return null;

          return {
            id: listing.id,
            name: listing.name,
            latitude,
            longitude,
            slug: listing.slug,
            categorySlug: listing.category?.slug,
            categoryName: translateCategoryName(t, listing.category?.slug, listing.category?.name),
            categoryImageUrl: listing.category?.image_url,
            cityName: listing.city?.name || "Algarve",
            tier: listing.tier,
            featuredImageUrl: listing.featured_image_url,
            priceFrom: listing.price_from,
            priceCurrency: listing.price_currency,
            href: l(`/listing/${listing.slug}`),
          } satisfies MapListingPoint;
        })
        .filter((point): point is MapListingPoint => point !== null),
    [l, listings, t]
  );

  useEffect(() => {
    if (!activeId) return;
    if (!mapPoints.some((point) => point.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, mapPoints, setActiveId]);

  const clearFilters = () => {
    setSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedTier("all");
    setPendingBounds(null);
    setActiveId(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("north");
    nextParams.delete("south");
    nextParams.delete("east");
    nextParams.delete("west");
    setSearchParams(nextParams);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedCategory !== "all" ||
    selectedTier !== "all" ||
    Boolean(appliedBounds);

  useEffect(() => {
    if (appliedBounds) {
      baselineBoundsRef.current = appliedBounds;
      setPendingBounds(null);
      return;
    }

    baselineBoundsRef.current = null;
    setPendingBounds(null);
  }, [appliedBounds]);

  const handleBoundsChange = useCallback(
    (bounds: MapViewportBounds) => {
      const nextBounds: ListingBounds = bounds;
      setCurrentBounds(nextBounds);

      const baseline = appliedBounds ?? baselineBoundsRef.current;
      if (!baseline) {
        baselineBoundsRef.current = nextBounds;
        return;
      }

      setPendingBounds(boundsChanged(nextBounds, baseline) ? nextBounds : null);
    },
    [appliedBounds]
  );

  const searchPendingArea = useCallback(() => {
    if (!pendingBounds) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("north", roundBound(pendingBounds.north));
    nextParams.set("south", roundBound(pendingBounds.south));
    nextParams.set("east", roundBound(pendingBounds.east));
    nextParams.set("west", roundBound(pendingBounds.west));
    setSearchParams(nextParams);
    baselineBoundsRef.current = pendingBounds;
    setPendingBounds(null);
    setActiveId(null);
  }, [pendingBounds, searchParams, setActiveId, setSearchParams]);
  const localizedHeroTitle = t("map.title");
  const localizedHeroSubtitle = t("map.subtitle");
  const heroTitle = locale === "en" ? getText("hero.title", localizedHeroTitle) : localizedHeroTitle;
  const heroSubtitle =
    locale === "en" ? getText("hero.subtitle", localizedHeroSubtitle) : localizedHeroSubtitle;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-16" data-cms-page="map">
        <div className="app-container content-max">
          {isBlockEnabled("hero", true) ? (
            <CmsBlock pageId="map" blockId="hero" as="section" className="pb-6 -mx-4 md:-mx-6 lg:mx-0">
              <LiveStyleHero
                badge={getText("hero.badge", "Map Explorer")}
                title={heroTitle}
                subtitle={heroSubtitle}
                media={
                  <HeroBackgroundMedia
                    mediaType={getText("hero.mediaType", "image")}
                    imageUrl={getText("hero.imageUrl", "")}
                    videoUrl={getText("hero.videoUrl", "")}
                    youtubeUrl={getText("hero.youtubeUrl", "")}
                    posterUrl={getText("hero.posterUrl", "")}
                    alt={t("map.title")}
                    fallback={<PageHeroImage page="map" alt={t("map.title")} />}
                  />
                }
                ctas={
                  <Link href={l("/stay")}>
                    <Button variant="gold" size="lg">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t("nav.directory")}
                    </Button>
                  </Link>
                }
              />
            </CmsBlock>
          ) : null}

          <section className="sticky top-16 z-30 -mx-4 border-y border-border/70 bg-background/95 px-4 py-3 shadow-sm backdrop-blur md:-mx-6 md:px-6 lg:top-20 lg:mx-0 lg:rounded-2xl lg:border lg:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex min-w-0 items-center gap-2 pr-1 text-sm font-semibold text-foreground sm:shrink-0">
                <Filter className="h-4 w-4 text-primary" />
                <span className="truncate">{t("directory.advancedFilters")}</span>
              </div>

              <div className="relative min-w-0 flex-1 sm:min-w-[240px] lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("directory.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 pl-10"
                />
              </div>

              <div className="min-w-0 flex-1 sm:min-w-[150px] sm:flex-none">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("directory.allRegions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("directory.allRegions")}</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 flex-1 sm:min-w-[140px] sm:flex-none">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("directory.allCities")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("directory.allCities")}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 flex-1 sm:min-w-[170px] sm:flex-none">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("directory.allCategories")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    <SelectItem value="all">{t("directory.allCategories")}</SelectItem>
                    {mergedCategories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {translateCategoryName(t, category.slug, category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 flex-1 sm:min-w-[130px] sm:flex-none">
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("directory.allTiers")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("directory.allTiers")}</SelectItem>
                    <SelectItem value="signature">{t("directory.tierSignature")}</SelectItem>
                    <SelectItem value="verified">{t("directory.tierVerified")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:shrink-0">
                <MapPinned className="h-3.5 w-3.5 text-primary" />
                <span className="whitespace-nowrap">{mapPoints.length} mapped</span>
                <span className="text-muted-foreground/50">/</span>
                <span className="whitespace-nowrap">{listings.length} results</span>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="w-full sm:w-auto sm:shrink-0" onClick={clearFilters}>
                  {t("directory.clearAllFilters")}
                </Button>
              )}
            </div>
          </section>

          <div className="mt-5 lg:grid lg:grid-cols-[45fr,55fr] lg:gap-5">
            <section className="lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-foreground">
                    {t("map.visibleOnMap")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("map.totalResults", { count: listings.length })}
                  </p>
                </div>
                <Button type="button" variant="outline" className="lg:hidden">
                  <MapPinned className="mr-2 h-4 w-4" />
                  Show map
                </Button>
              </div>

              <div className="space-y-3">
                {isLoading && (
                  <>
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </>
                )}

                {!isLoading && listings.length === 0 && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-6">
                    <p className="text-sm text-muted-foreground">{t("map.noMappedListings")}</p>
                  </div>
                )}

                {!isLoading &&
                  listings.map((listing) => {
                    const categoryName = translateCategoryName(t, listing.category?.slug, listing.category?.name);
                    const isSelected = activeId === listing.id;

                    return (
                      <Link
                        key={listing.id}
                        id={`listing-${listing.id}`}
                        href={l(`/listing/${listing.slug}`)}
                        onMouseEnter={() => setActiveId(listing.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onFocus={() => setActiveId(listing.id)}
                        onClick={(event) => {
                          if (window.innerWidth < 1024) return;
                          event.preventDefault();
                          setActiveId(listing.id);
                        }}
                        className={`group flex gap-3 rounded-2xl border bg-card p-3 transition duration-200 ${
                          isSelected
                            ? "scale-[1.01] border-primary/80 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/35 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-40">
                          <ListingImage
                            src={listing.featured_image_url}
                            category={listing.category?.slug}
                            categoryImageUrl={listing.category?.image_url}
                            listingId={listing.id}
                            alt={listing.name}
                            fill
                            sizes="(max-width: 1024px) 35vw, 18vw"
                            className="h-full w-full transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                              {listing.name}
                            </h3>
                            {listing.tier ? <ListingTierBadge tier={listing.tier} size="sm" /> : null}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {listing.city?.name || listing.region?.name || "Algarve"}
                            </span>
                            {categoryName ? (
                              <Badge variant="outline" className="text-[10px]">
                                <Tag className="mr-1 h-3 w-3" />
                                {categoryName}
                              </Badge>
                            ) : null}
                          </div>

                          {(listing.short_description || listing.description) ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {listing.short_description || listing.description}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>

            <section className="hidden lg:block">
              <div className="sticky top-36">
                {error ? (
                  <Card className="border-destructive/40">
                    <CardContent className="py-10">
                      <p className="text-destructive">{t("directory.errorMessage")}</p>
                    </CardContent>
                  </Card>
                ) : isLoading ? (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="h-[calc(100vh-13rem)] min-h-[560px] rounded-lg bg-muted/30 flex items-center justify-center">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t("directory.loading")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative">
                    {pendingBounds ? (
                      <div className="pointer-events-none absolute left-1/2 top-4 z-[700] -translate-x-1/2">
                        <Button
                          type="button"
                          className="pointer-events-auto rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background shadow-xl hover:bg-foreground/90"
                          onClick={searchPendingArea}
                        >
                          Search this area
                        </Button>
                      </div>
                    ) : null}

                    <ListingsLeafletMap
                      points={mapPoints}
                      defaultCenter={DEFAULT_CENTER}
                      defaultZoom={DEFAULT_ZOOM}
                      maxBounds={MAX_BOUNDS}
                      maxBoundsViscosity={1}
                      minZoom={8}
                      enforceBoundsOnPoints
                      enableClustering
                      showPopups={false}
                      autoFit={!appliedBounds}
                      scrollWheelZoom
                      activeListingId={activeId}
                      focusListingId={activeId}
                      onListingSelect={setActiveId}
                      onBoundsChange={handleBoundsChange}
                      mapClassName="h-[calc(100vh-13rem)] min-h-[560px]"
                      emptyMessage={t("map.emptyCoordinates")}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
