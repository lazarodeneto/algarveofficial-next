import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, Filter, Loader2, MapPinned, Search, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type MapListingPoint } from "@/components/map/ListingsLeafletMap";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";

import dynamic from "next/dynamic";
const ListingsLeafletMap = dynamic(() => import("@/components/map/ListingsLeafletMap"), { 
  ssr: false,
  loading: () => <div className="h-[calc(100vh-13rem)] min-h-[560px] w-full bg-muted animate-pulse rounded-lg" />
});
import { usePublishedListings, type ListingFilters, type ListingTier } from "@/hooks/useListings";
import { useCategories, useCities, useRegions } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { translateCategoryName } from "@/lib/translateCategory";
import {
  buildMergedCategoryOptions,
  getMergedCategoryBySlug,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

const DEFAULT_CENTER: [number, number] = [37.08, -8.15];
const DEFAULT_ZOOM = 9.5;
const MAX_BOUNDS: [[number, number], [number, number]] = [[36.7, -9.2], [37.5, -7.2]];

function isWithinAlgarveBounds(latitude: number, longitude: number): boolean {
  return latitude >= 36.7 && latitude <= 37.5 && longitude >= -9.2 && longitude <= -7.2;
}

export default function MapExplorer() {
  const { t } = useTranslation();
  const l = useLocalePath();
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
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

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
    }),
    [debouncedSearch, selectedCategory, selectedCategoryIds, selectedCity, selectedRegion, selectedTier]
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
            href: l(`/listing/${listing.slug}`),
          } satisfies MapListingPoint;
        })
        .filter((point): point is MapListingPoint => point !== null),
    [l, listings, t]
  );

  useEffect(() => {
    if (!selectedListingId) return;
    if (!mapPoints.some((point) => point.id === selectedListingId)) {
      setSelectedListingId(null);
    }
  }, [mapPoints, selectedListingId]);

  const clearFilters = () => {
    setSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedTier("all");
    setSelectedListingId(null);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedCategory !== "all" ||
    selectedTier !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-16" data-cms-page="map">
        <div className="app-container content-max">
          {isBlockEnabled("hero", true) ? (
            <CmsBlock pageId="map" blockId="hero" as="section" className="pb-6 -mx-4 md:-mx-6 lg:mx-0">
              <LiveStyleHero
                badge={getText("hero.badge", "Map Explorer")}
                title={getText("hero.title", t("map.title"))}
                subtitle={getText("hero.subtitle", t("map.subtitle"))}
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

          <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
            <aside className="relative flex flex-col space-y-4">
              <Card className="relative z-20 order-1 border-border bg-background lg:sticky lg:top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    {t("directory.advancedFilters")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("directory.searchPlaceholder")}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("directory.region")}</label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("directory.city")}</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger>
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("directory.category")}</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("directory.allCategories")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px]">
                        <SelectItem value="all">{t("directory.allCategories")}</SelectItem>
                        {mergedCategories
                          .map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {translateCategoryName(t, category.slug, category.name)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("directory.tier")}</label>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("directory.allTiers")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("directory.allTiers")}</SelectItem>
                        <SelectItem value="signature">{t("directory.tierSignature")}</SelectItem>
                        <SelectItem value="verified">{t("directory.tierVerified")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm text-foreground font-medium">
                      {t("map.mappableListings", { count: mapPoints.length })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("map.totalResults", { count: listings.length })}
                    </p>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" className="w-full" onClick={clearFilters}>
                      {t("directory.clearAllFilters")}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="relative z-10 order-2 border-border bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-primary" />
                    {t("map.visibleOnMap")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[360px] overflow-auto pr-2 space-y-2">
                  {isLoading && (
                    <>
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </>
                  )}

                  {!isLoading && mapPoints.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">{t("map.noMappedListings")}</p>
                  )}

                  {!isLoading &&
                    mapPoints.slice(0, 30).map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSelectedListingId(point.id)}
                        className={`w-full text-left rounded-lg border p-2 transition-colors ${
                          selectedListingId === point.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-1">{point.name}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="line-clamp-1">{point.cityName}</span>
                        </div>
                        {point.categoryName && (
                          <Badge variant="outline" className="mt-2 text-[10px]">
                            <Tag className="h-3 w-3 mr-1" />
                            {point.categoryName}
                          </Badge>
                        )}
                      </button>
                    ))}
                </CardContent>
              </Card>
            </aside>

            <section>
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
                  autoFit
                  scrollWheelZoom
                  activeListingId={selectedListingId}
                  focusListingId={selectedListingId}
                  onListingSelect={setSelectedListingId}
                  mapClassName="h-[calc(100vh-13rem)] min-h-[560px]"
                  emptyMessage={t("map.emptyCoordinates")}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
