import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useCities } from "@/hooks/useReferenceData";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizeCityBlockMode,
  normalizeSelectedCityIds,
  validateSelectedCityIds,
} from "@/lib/cms/city-block-config";
import {
  normalizePlacementSelection,
  resolveCityOrderDetailed,
  type PlacementListing,
} from "@/lib/cms/placement-engine";
import { trackBlockImpression, trackEvent } from "@/lib/analytics/platformTracking";

export function CitiesSection() {
  const { isDestinationSaved, toggleCity } = useSavedDestinations();
  const { data: cities = [], isLoading } = useCities();
  const { t } = useTranslation();
  const l = useLocalePath();
  const { getBlockData } = useCmsPageBuilder("home");
  const blockData = getBlockData("cities");
  const mode = normalizeCityBlockMode(blockData.mode);
  const selection = normalizePlacementSelection(blockData.selection);
  const selectedCityIds = normalizeSelectedCityIds(blockData.selectedCityIds);
  const { validCityIds } = validateSelectedCityIds("cities", selectedCityIds, cities);
  const { data: cityListings = [] } = useQuery({
    queryKey: ["home-city-placement-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, city_id, tier, status")
        .eq("status", "published");
      if (error) throw error;
      return (data ?? []) as PlacementListing[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const citiesById = new Map(cities.map((city) => [city.id, city]));
  const curatedCities = validCityIds
    .map((cityId) => citiesById.get(cityId))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));
  const eligibleCities =
    mode === "curated"
      ? curatedCities.length > 0
        ? curatedCities
        : cities
      : cities;

  const placementResults = resolveCityOrderDetailed({
    selection,
    cities: eligibleCities,
    listings: cityListings,
    manualCityIds: validCityIds,
  });
  const citiesToRender = placementResults.map((result) => result.item);

  useEffect(() => {
    void trackBlockImpression({
      blockId: "cities",
      pageId: "home",
      selection,
    });
  }, [selection]);

  return (
    <section
      id="cities"
      className="py-24 bg-background lg:py-[40px]"
      data-cms-cities-mode={mode}
      data-cms-cities-selection={selection}
    >
      <div className="app-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
            {t("sections.cities.label")}
          </span>
          <h2 className="mt-4 text-title font-serif font-medium text-foreground">
            {t("sections.cities.title")}
          </h2>
          <p className="mt-4 text-body text-muted-foreground max-w-2xl mx-auto">
            {t("sections.cities.subtitle")}
          </p>
        </motion.div>

        {/* Cities Grid */}
        {isLoading ? (
          <div className="grid-adaptive">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : citiesToRender.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("sections.cities.noFeatured")}</p>
            <p className="text-sm mt-1">{t("sections.cities.adminNote")}</p>
          </div>
        ) : (
          <div className="grid-adaptive">
            {citiesToRender.map((city) => (
              <div key={city.id}>
                <Link
                  href={l(`/visit/${city.slug}`)}
                  className="glass-box flex items-center gap-3 p-4 rounded-xl hover:border-primary/30 cursor-pointer"
                  onClick={() =>
                    void trackEvent("block_click", {
                      blockId: "cities",
                      pageId: "home",
                      cityId: city.id,
                      selection,
                    })
                  }
                >
                  {/* Favorite Heart Icon - Clickable (stops propagation) */}
                  <div onClick={(e) => e.preventDefault()}>
                    <FavoriteButton
                      isFavorite={isDestinationSaved("city", city.id)}
                      onToggle={() => toggleCity(city.id)}
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-body-md break-words text-balance leading-tight">
                      {city.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href={l("/directory")}>
            <Button variant="luxury" size="lg">
              {t("sections.cities.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
