import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, ChevronDown, Compass, Filter, Loader2, MapPin, Search, Sparkles, Star, Sun, Tag, X } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCities, useCategories, useRegions } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { supabase } from "@/integrations/supabase/client";
import { RealEstateCard } from "@/components/real-estate/RealEstateCard";
import type { Database } from "@/integrations/supabase/types";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"] & {
  cities: { name: string; slug: string } | null;
  categories: { name: string; slug: string } | null;
};

const Experiences = () => {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("experiences");
  const l = useLocalePath();
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();
  const { data: regions = [] } = useRegions();
  const imageTimestamp = Date.now();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const thingsToDoCategory = useMemo(
    () => categories.find((c) => c.slug === "things-to-do"),
    [categories],
  );

  const hasActiveFilters = selectedRegion !== "all" || selectedCity !== "all" || selectedTier !== "all" || debouncedSearch !== "";

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedTier("all");
  }, []);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["experiences-listings", debouncedSearch, selectedRegion, selectedCity, selectedTier, thingsToDoCategory?.id],
    queryFn: async () => {
      if (!thingsToDoCategory?.id) return [];

      let query = supabase
        .from("listings")
        .select("*, cities ( name, slug ), categories ( name, slug )")
        .eq("category_id", thingsToDoCategory.id)
        .eq("status", "published");

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }
      if (selectedCity !== "all") {
        query = query.eq("city_id", selectedCity);
      }
      if (selectedRegion !== "all") {
        query = query.eq("region_id", selectedRegion);
      }
      if (selectedTier !== "all") {
        query = query.eq("tier", selectedTier);
      }

      query = query.order("tier", { ascending: true }).order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ListingRow[];
    },
    enabled: !!thingsToDoCategory?.id,
    staleTime: 1000 * 60 * 5,
  });

  const experienceStats = [
    { icon: Sparkles, value: "200+", label: t("experiences.stats.curated", "Curated Experiences") },
    { icon: Compass, value: "15+", label: t("experiences.stats.categories", "Activity Categories") },
    { icon: Sun, value: "300+", label: t("experiences.stats.sunDays", "Sun Days per Year") },
  ];

  const experiencePillars = [
    {
      icon: Sun,
      title: t("experiences.pillars.outdoor.title", "Outdoor Adventures"),
      description: t("experiences.pillars.outdoor.description", "Surfing, kayaking, hiking along coastal cliffs, and exploring hidden caves along the Algarve coastline."),
    },
    {
      icon: Sparkles,
      title: t("experiences.pillars.gastronomy.title", "Gastronomy & Wine"),
      description: t("experiences.pillars.gastronomy.description", "Wine tastings, seafood experiences, farm-to-table dining, and traditional Algarvian cooking classes."),
    },
    {
      icon: Compass,
      title: t("experiences.pillars.culture.title", "Culture & Heritage"),
      description: t("experiences.pillars.culture.description", "Historic villages, local markets, artisan workshops, and living traditions across the region."),
    },
    {
      icon: Star,
      title: t("experiences.pillars.wellness.title", "Wellness & Relaxation"),
      description: t("experiences.pillars.wellness.description", "Spa retreats, yoga sessions, thermal baths, and holistic wellness programs in stunning settings."),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" data-cms-page="experiences">
      <SeoHead
        title={getMetaTitle(getText("seo.title", "Experiences in the Algarve"))}
        description={getMetaDescription(getText("seo.description", "Discover curated experiences across the Algarve — from wine tastings and boat tours to golf, wellness, and cultural adventures."))}
        canonicalUrl="https://algarveofficial.com/experiences"
        keywords={getText("seo.keywords", "Algarve experiences, things to do Algarve, Algarve tours, Algarve activities, Algarve adventures")}
      />

      <Header />

      <main className="flex-grow">
        {isBlockEnabled("city-hubs", true) && cities.length > 0 ? (
          <div className="app-container content-max pb-8 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)]">
            <section className="mb-6 space-y-8">
              {isBlockEnabled("featured-city-hub", true) && cities.filter(c => c.is_featured).length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <Link
                    href={l(`/city/${cities.filter(c => c.is_featured)[0].slug}`)}
                    className="group block h-full overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
                  >
                    <div className="relative h-full min-h-[20rem]">
                      <img
                        src={cities.filter(c => c.is_featured)[0].image_url ? `${cities.filter(c => c.is_featured)[0].image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                        alt={cities.filter(c => c.is_featured)[0].name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                          {t("experiences.featuredCityHub", "Featured City Hub")}
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                          {cities.filter(c => c.is_featured)[0].name}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-white/85">
                          {cities.filter(c => c.is_featured)[0].short_description ||
                            t("experiences.featuredCityHubDescription", "Explore curated experiences in {{name}}, Algarve.", { name: cities.filter(c => c.is_featured)[0].name })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {t("experiences.cityIndex", "City Index")}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                      {t("experiences.exploreAlgarveCities", "Explore Algarve Cities")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("experiences.cityIndexDescription", "Browse experiences and activities by city.")}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {cities.slice(0, 6).map((city) => (
                        <Link
                          key={city.id}
                          href={l(`/city/${city.slug}`)}
                          className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <div className="font-medium text-foreground">{city.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        <div className="app-container py-8 relative z-20">
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Card className="relative isolate overflow-hidden border-border bg-background/95 shadow-lg supports-[backdrop-filter]:bg-background/90">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-[var(--glass-radius)]">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{t("directory.advancedFilters", "Advanced Filters")}</span>
                    {hasActiveFilters ? (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {t("directory.active", "Active")}
                      </Badge>
                    ) : null}
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="relative z-10 pt-0 pb-6 px-4 space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder={t("directory.searchPlaceholder", "Search experiences...")}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="pl-12 h-12 text-lg bg-muted/30 border-border focus:bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-body-xs font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t("directory.region", "Region")}
                      </label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t("directory.allRegions", "All Regions")} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg">
                          <SelectItem value="all">{t("directory.allRegions", "All Regions")}</SelectItem>
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
                        {t("directory.city", "City")}
                      </label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-12 bg-muted/30 border-border hover:bg-muted/50 focus:bg-background">
                          <SelectValue placeholder={t("directory.allCities", "All Cities")} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border shadow-lg max-h-[280px]">
                          <SelectItem value="all">{t("directory.allCities", "All Cities")}</SelectItem>
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
                        {t("directory.category", "Category")}
                      </label>
                      <div className="h-12 flex items-center px-4 bg-primary/10 border border-primary/30 rounded-md text-foreground font-medium">
                        {thingsToDoCategory?.name ?? t("categoryNames.things-to-do", "Things to Do")}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters ? (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4 mr-2" />
                        {t("directory.clearAllFilters", "Clear All Filters")}
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="app-container pb-12">
          <div className="flex items-center justify-between mb-6">
            <p className="text-body-sm text-muted-foreground">
              {listingsLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("directory.loading", "Loading...")}
                </span>
              ) : (
                <span>{listings.length} {t("experiences.resultsFound", "experiences found")}</span>
              )}
            </p>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={l(`/listing/${listing.id}`)} className="group block">
                    <article className="glass-box overflow-hidden">
                      <div className="h-48 w-full overflow-hidden">
                        {listing.featured_image_url ? (
                          <img
                            src={`${listing.featured_image_url}?_t=${imageTimestamp}`}
                            alt={listing.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                            <Compass className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {listing.tier === "signature" && <Badge className="bg-primary/20 text-primary text-[10px]">Signature</Badge>}
                          {listing.tier === "verified" && <Badge className="bg-green-500/20 text-green-600 text-[10px]">Verified</Badge>}
                        </div>
                        <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                          {listing.name}
                        </h3>
                        {listing.cities && (
                          <p className="text-sm text-muted-foreground">{listing.cities.name}</p>
                        )}
                        {listing.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Compass className="w-12 h-12 text-primary/30 mb-4 mx-auto" />
              <p className="text-xl font-serif italic text-muted-foreground">{t("experiences.noResults", "No experiences match your search")}</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                  {t("directory.clearAllFilters", "Clear All Filters")}
                </Button>
              )}
            </div>
          )}
        </div>

        {isBlockEnabled("stats", true) && (
          <CmsBlock pageId="experiences" blockId="stats" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
            <div className="grid gap-3 md:grid-cols-3">
              {experienceStats.map((stat) => (
                <article key={stat.label} className="glass-box p-5 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("pillars", true) && (
          <CmsBlock pageId="experiences" blockId="pillars" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
            <div className="mb-8 text-center">
              <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
                {t("experiences.pillars.label", "What We Offer")}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
                {t("experiences.pillars.title", "Experiences for Every Passion")}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {experiencePillars.map((pillar) => (
                <article key={pillar.title} className="glass-box p-6 space-y-3">
                  <pillar.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-xl text-foreground">{pillar.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("cta", true) && (
          <CmsBlock pageId="experiences" blockId="cta" as="section" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-20">
            <div className="glass-box p-8 md:p-10 text-center">
              <h2 className="text-3xl font-serif font-medium mb-3">
                {t("experiences.cta.title", "Ready for your next adventure?")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("experiences.cta.description", "Tell us what excites you and we will craft a bespoke itinerary of curated experiences across the Algarve.")}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={l("/contact")}>
                  <Button variant="gold" size="lg">
                    {t("experiences.cta.primary", "Plan My Experience")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href={l("/directory?category=see-do")}>
                  <Button variant="outline" size="lg">
                    {t("experiences.cta.secondary", "Browse All Listings")}
                  </Button>
                </Link>
              </div>
            </div>
          </CmsBlock>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
