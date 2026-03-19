import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, MapPin, Tag, Building2, Crown, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
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
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { usePublishedListings, type ListingFilters, type ListingWithRelations, type ListingTier } from "@/hooks/useListings";
import { useCities, useRegions, useCategories } from "@/hooks/useReferenceData";
import { Link, useSearchParams } from "react-router-dom";
import { renderCategoryIcon } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import {
  buildMergedCategoryOptions,
  getMergedCategoryBySlug,
  getMergedCategoryIds,
  resolveCategoryFilterSlug,
} from "@/lib/categoryMerges";
import { SeoHead } from "@/components/seo/SeoHead";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
export default function Directory() {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("directory");
  const langPrefix = useLangPrefix();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const {
    isFavorite,
    toggleFavorite
  } = useFavoriteListings();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reference data
  const {
    data: cities = [],
    isLoading: citiesLoading
  } = useCities();
  const {
    data: regions = [],
    isLoading: regionsLoading
  } = useRegions();
  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useCategories();

  // Fetch all listings to count per category (no filters)
  const {
    data: allListings = []
  } = usePublishedListings();

  const mergedCategories = useMemo(() => buildMergedCategoryOptions(categories), [categories]);

  const getMergedCategoryCount = (categoryIds: string[]) => {
    if (categoryIds.length === 0) return 0;
    const idSet = new Set(categoryIds);
    return allListings.filter((listing) => idSet.has(listing.category_id)).length;
  };

  const categoriesWithListings = useMemo(
    () =>
      mergedCategories.filter((category) => getMergedCategoryCount(category.memberIds) > 0),
    [mergedCategories, allListings]
  );

  const selectedCategoryItem = useMemo(
    () => getMergedCategoryBySlug(selectedCategory, mergedCategories),
    [mergedCategories, selectedCategory]
  );

  const selectedCategoryIds = selectedCategoryItem?.memberIds ?? [];

  const listingFilters = useMemo<ListingFilters>(() => {
    return {
      search: debouncedSearch || undefined,
      categoryIds: selectedCategory !== "all" ? selectedCategoryIds : undefined,
      cityId: selectedCity !== "all" ? selectedCity : undefined,
      regionId: selectedRegion !== "all" ? selectedRegion : undefined,
      tier: selectedTier !== "all" ? selectedTier as ListingTier : undefined,
    };
  }, [debouncedSearch, selectedCategory, selectedCategoryIds, selectedCity, selectedRegion, selectedTier]);

  // Fetch listings with filters
  const {
    data: listings = [],
    isLoading: listingsLoading,
    error
  } = usePublishedListings(listingFilters);

  const totalListingsCount = listings.length;

  // Read URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const regionParam = searchParams.get("region");
    const cityParam = searchParams.get("city");
    const qParam = searchParams.get("q");
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

    if (regionParam) setSelectedRegion(regionParam);
    if (cityParam) setSelectedCity(cityParam);
    if (qParam) setSearch(qParam);

    if (shouldReplaceParams) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, categories, mergedCategories, setSearchParams]);
  const clearFilters = () => {
    setSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedTier("all");
  };
  const hasActiveFilters = search || selectedRegion !== "all" || selectedCity !== "all" || selectedCategory !== "all" || selectedTier !== "all";
  const isLoading = listingsLoading || citiesLoading || regionsLoading || categoriesLoading;
  const showGridSkeleton = isLoading && !error && listings.length === 0;

  const selectedRegionItem = useMemo(
    () => regions.find((region) => region.id === selectedRegion || region.slug === selectedRegion),
    [regions, selectedRegion]
  );
  const selectedCityItem = useMemo(
    () => cities.find((city) => city.id === selectedCity || city.slug === selectedCity),
    [cities, selectedCity]
  );

  const selectedTierLabel = selectedTier === "signature"
    ? t("directory.tierSignature")
    : selectedTier === "verified"
      ? t("directory.tierVerified")
      : undefined;

  const activeSeoSegments = [
    selectedCategoryItem ? translateCategoryName(t, selectedCategoryItem.slug, selectedCategoryItem.name) : undefined,
    selectedCityItem?.name,
    selectedRegionItem?.name,
    selectedTierLabel,
    search.trim() ? `"${search.trim()}"` : undefined,
  ].filter((segment): segment is string => Boolean(segment));

  const seoTitle = activeSeoSegments.length > 0
    ? `${activeSeoSegments.join(" · ")} · Premium Directory in the Algarve`
    : "Premium Directory in the Algarve";

  const seoDescription = activeSeoSegments.length > 0
    ? `Explore ${activeSeoSegments.join(", ")} in AlgarveOfficial's curated premium directory with advanced filtering by region, city, category, and tier.`
    : "Explore curated Algarve experiences in accommodation, dining, golf, and lifestyle services with advanced filters by city, region, and category.";

  const mapHref = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedRegion !== "all") params.set("region", selectedRegion);
    if (selectedCity !== "all") params.set("city", selectedCity);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedTier !== "all") params.set("tier", selectedTier);
    const query = params.toString();
    return buildLangPath(langPrefix, query ? `/map?${query}` : "/map");
  }, [langPrefix, search, selectedRegion, selectedCity, selectedCategory, selectedTier]);

  return <div className="min-h-screen bg-background" data-cms-page="directory">
    <SeoHead
      title={getMetaTitle(seoTitle)}
      description={getMetaDescription(seoDescription)}
      canonicalUrl="https://algarveofficial.com/directory"
      keywords={getText("seo.keywords", "Algarve directory, premium experiences Algarve, Algarve accommodation, golf Algarve, fine dining Algarve")}
    />
    <Header />

    <main>
      {/* Hero Section */}
      {isBlockEnabled("hero", true) && <CmsBlock pageId="directory" blockId="hero" as="section" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
        <div className="relative app-container text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-6"
          >
            {t('directory.heroLabel')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-hero font-serif font-medium text-foreground"
          >
            {t('directory.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto readable"
          >
            {t('directory.subtitle')}
          </motion.p>
        </div>
      </CmsBlock>}

      <div className="app-container content-max pb-16">

        {/* Advanced Filters */}
        {isBlockEnabled("filters", true) && <CmsBlock pageId="directory" blockId="filters" className="mb-8">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Card className="border-border">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-[var(--glass-radius)]">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{t('directory.advancedFilters')}</span>
                    {hasActiveFilters && <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {t('directory.active')}
                    </Badge>}
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-6 px-4 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder={t('directory.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="pl-12 h-12 text-lg bg-muted/30 border-border focus:bg-background" />
                  </div>

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Region Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t('directory.region')}
                      </label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t('directory.allRegions')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg">
                          <SelectItem value="all">{t('directory.allRegions')}</SelectItem>
                          {[...regions].sort((a, b) => a.name.localeCompare(b.name)).map(region => <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        {t('directory.city')}
                      </label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t('directory.allCities')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                          <SelectItem value="all">{t('directory.allCities')}</SelectItem>
                          {[...cities].sort((a, b) => a.name.localeCompare(b.name)).map(city => <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {t('directory.category')}
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t('directory.allCategories')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                          <SelectItem value="all">{t('directory.allCategories')}</SelectItem>
                          {[...categoriesWithListings].sort((a, b) => a.name.localeCompare(b.name)).map(category => <SelectItem key={category.id} value={category.slug}>
                            {translateCategoryName(t, category.slug, category.name)}
                          </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tier Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        {t('directory.tier')}
                      </label>
                      <Select value={selectedTier} onValueChange={setSelectedTier}>
                        <SelectTrigger className="bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t('directory.allTiers')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg">
                          <SelectItem value="all">{t('directory.allTiers')}</SelectItem>
                          <SelectItem value="signature">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-primary" />
                              {t('directory.tierSignature')}
                            </div>
                          </SelectItem>
                          <SelectItem value="verified">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                              {t('directory.tierVerified')}
                            </div>
                          </SelectItem>

                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4 mr-2" />
                      {t('directory.clearAllFilters')}
                    </Button>
                  </div>}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </CmsBlock>}

        {isBlockEnabled("results", true) && <CmsBlock pageId="directory" blockId="results">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('directory.loading')}
              </span> : <>
                {t('directory.showingResults', { count: totalListingsCount })}
              </>}
            </p>
            <Link to={mapHref}>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </Link>
          </div>

          {/* Error State */}
          {error && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="text-center py-16">
            <p className="text-destructive mb-4">{t('directory.errorMessage')}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('directory.retry')}
            </Button>
          </motion.div>}

          {/* Loading State */}
          {showGridSkeleton && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-live="polite" aria-label={t('directory.loading')}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} variant="listing" />)}
          </div>}

          {/* Empty State */}
          {!showGridSkeleton && !isLoading && !error && listings.length === 0 && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">{t('directory.noListingsTitle')}</h3>
            <p className="text-muted-foreground mb-6">{t('directory.noListingsSubtitle')}</p>
            <Button variant="outline" onClick={clearFilters}>
              {t('directory.clearAllFilters')}
            </Button>
          </motion.div>}

          {/* Listings Grid */}
          {!showGridSkeleton && !isLoading && !error && listings.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => <motion.div key={listing.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: Math.min(index * 0.05, 0.5)
            }}>
              <Link to={buildLangPath(langPrefix, `/listing/${listing.slug}`)} className="group block h-full">
                <article className="glass-box glass-box-listing-shimmer overflow-hidden flex flex-col h-full">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
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
                  {listing.google_rating && (
                    <GoogleRatingBadge
                      rating={listing.google_rating}
                      reviewCount={listing.google_review_count}
                      variant="overlay"
                      size="sm"
                      className="absolute top-3 right-3"
                    />
                  )}

                  {/* Bottom row - Category badge (left) & Favorite button (right) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" onClick={e => e.preventDefault()}>
                    <Badge variant="secondary" className="text-xs bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                      {renderCategoryIcon(listing.category?.icon, "h-3 w-3")}
                      {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                    </Badge>

                    <FavoriteButton isFavorite={isFavorite(listing.id)} onToggle={() => toggleFavorite(listing.id)} size="sm" variant="glassmorphism" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-serif font-medium text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {listing.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {listing.short_description || listing.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.city?.name}</span>
                    {listing.region && <>
                      <span>•</span>
                      <span>{listing.region.name}</span>
                    </>}
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>)}
        </div>}
        </CmsBlock>}
      </div>
    </main>

    <Footer />
  </div>;
}
