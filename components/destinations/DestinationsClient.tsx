"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Loader2, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { getRegionImageSet } from "@/lib/regionImages";

import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";

export type RegionRow = Tables<"regions">;
export type CityRow = Tables<"cities">;

export interface DestinationsClientProps {
  initialRegions: RegionRow[];
}

const DESTINATIONS_REGION_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url,
  is_active, is_featured, is_visible_destinations, display_order, created_at
`;

const DESTINATIONS_CITY_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url,
  latitude, longitude, is_active, is_featured, display_order, created_at
`;

async function fetchRegions() {
  const { data, error } = await supabase
    .from("regions")
    .select(DESTINATIONS_REGION_FIELDS)
    .eq("is_visible_destinations", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RegionRow[];
}

async function fetchCities() {
  const { data, error } = await supabase
    .from("cities")
    .select(DESTINATIONS_CITY_FIELDS)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CityRow[];
}

function DestinationsClientInner({ initialRegions }: DestinationsClientProps) {
  const { t } = useTranslation();
  const imageTimestamp = Date.now();
  const cms = useCmsPageBuilder("destinations");

  const { data: regions = initialRegions, isLoading: regionsLoading } = useQuery({
    queryKey: ["regions", { destinationsOnly: true, activeOnly: false }],
    queryFn: fetchRegions,
    initialData: initialRegions,
    staleTime: 1000 * 60 * 10,
  });

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", { activeOnly: true }],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 10,
  });

  const featuredRegions = regions.filter((region) => region.is_featured);
  const otherRegions = regions.filter((region) => !region.is_featured);
  const featuredCities = cities.filter((city) => city.is_featured);

  const featuredCityHubData = cms.getBlockData("featured-city-hub");
  const highlightedCityId = typeof featuredCityHubData.cityId === "string" ? featuredCityHubData.cityId : null;
  const highlightedCity = highlightedCityId ? cities.find((c) => c.id === highlightedCityId) ?? featuredCities[0] : featuredCities[0];

  const isLoading = regionsLoading || citiesLoading;

  if (isLoading && !regions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="destinations">
      <Header />
      <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />

       <CmsBlock pageId="destinations" blockId="featured-city-hub" as="section" className="pt-[4.5rem] sm:pt-[5rem] pb-8">
        {highlightedCity && highlightedCity.hero_image_url && (
          <div className="app-container content-max">
            <LocaleLink
              href={`/destinations/${highlightedCity.slug}`}
              className="group relative block overflow-hidden rounded-[32px] aspect-[16/9] lg:aspect-[2.4/1]"
            >
              <Image
                src={`${highlightedCity.hero_image_url || highlightedCity.image_url}?_t=${imageTimestamp}`}
                alt={highlightedCity.name}
                fill
                unoptimized
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10 text-white">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  {t("sections.cities.featuredCityHub", "Featured City Hub")}
                </p>
                <h2 className="font-serif text-3xl lg:text-5xl leading-tight">
                  {highlightedCity.name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm lg:text-base text-white/85">
                  {highlightedCity.short_description || highlightedCity.description}
                </p>
              </div>
            </LocaleLink>
          </div>
        )}
      </CmsBlock>

       <CmsBlock pageId="destinations" blockId="city-index" as="section" className="pt-8 lg:pt-16 pb-16 lg:pb-24 bg-card">
        <div className="app-container content-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-title font-serif font-medium text-foreground">
              {cms.getText("city-index.title", t("sections.cities.allCities", "All Cities"))}
            </h2>
            <p className="mt-2 text-body text-muted-foreground">
              {cms.getText("city-index.subtitle", t("sections.cities.allCitiesSubtitle", "Explore every city across the Algarve"))}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <LocaleLink
                  href={`/destinations/${city.slug}`}
                  className="group block p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {city.name}
                    </h3>
                  </div>
                  {city.short_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{city.short_description}</p>
                  )}
                </LocaleLink>
              </motion.div>
            ))}
          </div>
        </div>
      </CmsBlock>

      <CmsBlock pageId="destinations" blockId="all-city-hubs" as="section" className="py-16 lg:py-24">
        <div className="app-container content-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-title font-serif font-medium text-foreground">
              {cms.getText("all-city-hubs.title", t("sections.cities.activeHubs", "Active City Hubs"))}
            </h2>
            <p className="mt-2 text-body text-muted-foreground">
              {cms.getText("all-city-hubs.subtitle", t("sections.cities.activeHubsSubtitle", "Dive into each vibrant city hub"))}
            </p>
          </motion.div>
          <div className="flex-grid-centered">
            {cities.filter((c) => c.is_featured).map((city, index) => {
              return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <LocaleLink
                    href={`/destinations/${city.slug}`}
                    className="glass-box group relative overflow-hidden rounded-xl aspect-[4/5] luxury-card cursor-pointer block"
                  >
                    <div className="absolute inset-0">
                      {city.hero_image_url || city.image_url ? (
                        <Image
                          src={`${(city.hero_image_url || city.image_url)}?_t=${imageTimestamp}`}
                          alt={city.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <span className="text-xs font-medium text-primary tracking-wider uppercase mb-2">
                        {t("sections.cities.cityHub", "City Hub")}
                      </span>
                      <h3 className="text-2xl lg:text-3xl font-serif font-medium text-white mb-2">{city.name}</h3>
                      <p className="text-sm lg:text-base text-white/80 mb-4">
                        {city.short_description || city.description}
                      </p>
                      <div className="flex items-center justify-end">
                        <span className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                          {t("sections.cities.exploreCity", "Explore City")}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </LocaleLink>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CmsBlock>

      <CmsBlock pageId="destinations" blockId="featured-regions" as="section" className="py-16 lg:py-24">
        <div className="app-container content-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-title font-serif font-medium text-foreground">{t("sections.regions.featured")}</h2>
            <p className="mt-2 text-body text-muted-foreground">{t("sections.regions.featuredSubtitle")}</p>
          </motion.div>
          <div className="flex-grid-centered">
            {featuredRegions.map((region, index) => {
              const image = getRegionImageSet(region.slug, { includeAliases: true });
              return (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <LocaleLink
                    href={`/destinations/${region.slug}`}
                    className="glass-box group relative overflow-hidden rounded-xl aspect-[4/5] luxury-card cursor-pointer block"
                  >
                    <div className="absolute inset-0">
                      {image ? (
                        <Image
                          src={typeof image.image800 === "string" ? image.image800 : image.image800.src}
                          alt={region.name}
                          fill
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : region.image_url || region.hero_image_url ? (
                        <Image
                          src={region.hero_image_url ? `${region.hero_image_url}?_t=${imageTimestamp}` : region.image_url ? `${region.image_url}?_t=${imageTimestamp}` : ""}
                          alt={region.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <span className="text-xs font-medium text-primary tracking-wider uppercase mb-2">
                        {t("sections.regions.algarveRegion")}
                      </span>
                      <h3 className="text-2xl lg:text-3xl font-serif font-medium text-white mb-2">{region.name}</h3>
                      <p className="text-sm lg:text-base text-white/80 mb-4">
                        {region.short_description || region.description}
                      </p>
                      <div className="flex items-center justify-end">
                        <span className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                          {t("sections.regions.explore")}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </LocaleLink>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CmsBlock>

      {otherRegions.length > 0 && (
        <CmsBlock pageId="destinations" blockId="other-regions" as="section" className="py-16 lg:py-24 bg-card">
          <div className="app-container content-max">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-title font-serif font-medium text-foreground">{t("sections.regions.more")}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t("sections.regions.moreSubtitle")}</p>
            </motion.div>
            <div className="flex-grid-centered">
              {otherRegions.map((region, index) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <LocaleLink
                    href={`/destinations/${region.slug}`}
                    className="group block p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-serif font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {region.short_description || region.description}
                    </p>
                  </LocaleLink>
                </motion.div>
              ))}
            </div>
          </div>
        </CmsBlock>
      )}

      <CmsBlock pageId="destinations" blockId="cta" as="section" className="py-20 lg:py-28 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-serif font-medium text-foreground mb-6">
              {t("sections.regions.cantDecide")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("sections.regions.cantDecideSubtitle")}
            </p>
            <Button asChild variant="gold" size="lg">
              <LocaleLink href="/#categories">
                {t("sections.regions.browseByCategory")} <ArrowRight className="w-4 h-4" />
              </LocaleLink>
            </Button>
          </motion.div>
        </div>
      </CmsBlock>

      <Footer />
    </div>
  );
}

export function DestinationsClient(props: DestinationsClientProps) {
  return <DestinationsClientInner {...props} />;
}

export default DestinationsClient;
