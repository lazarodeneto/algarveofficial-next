import { PremiumCard } from "@/components/ui/premium-card";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useCities, useCityListingCounts } from "@/hooks/useReferenceData";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
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
import { publishedListingsQueryKey } from "@/lib/query-keys";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";

export function CitiesSection() {
  const { isDestinationSaved, toggleCity } = useSavedDestinations();
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: cityCounts = {}, isLoading: countsLoading } = useCityListingCounts();
  const { t } = useTranslation();
  const l = useLocalePath();
  const queryClient = useQueryClient();
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { getBlockData } = useCmsPageBuilder("home");
  const blockData = getBlockData("cities");
  const mode = normalizeCityBlockMode(blockData.mode);
  const selection = normalizePlacementSelection(blockData.selection);
  const selectedCityIds = normalizeSelectedCityIds(blockData.selectedCityIds);
  const { validCityIds } = validateSelectedCityIds("cities", selectedCityIds, cities);
  const cityListings = useMemo(
    () =>
      (queryClient.getQueryData<PlacementListing[]>(publishedListingsQueryKey({}, locale)) ?? [])
        .filter((listing) => listing.status === "published"),
    [locale, queryClient],
  );

  const citiesById = new Map(cities.map((city) => [city.id, city]));
  const curatedCities = validCityIds
    .map((cityId) => citiesById.get(cityId))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));
  const citiesWithListings = cities.filter((city) => (cityCounts[city.id] ?? 0) > 0);
  const isLoading = citiesLoading || countsLoading;
  const eligibleCities =
    mode === "curated"
      ? curatedCities.length > 0
        ? curatedCities.filter((city) => (cityCounts[city.id] ?? 0) > 0)
        : citiesWithListings
      : citiesWithListings;

  const placementResults = resolveCityOrderDetailed({
    selection,
    cities: eligibleCities,
    listings: cityListings,
    manualCityIds: validCityIds,
  });
  const citiesToRender = placementResults.map((result) => result.item).slice(0, 8);

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
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
            {t("sections.homepage.cities.label")}
          </span>
          <h2 className="mt-4 text-title font-serif font-medium text-foreground">
            {t("sections.homepage.cities.title")}
          </h2>
          <p className="mt-4 text-body text-muted-foreground max-w-2xl mx-auto">
            {t("sections.homepage.cities.subtitle")}
          </p>
        </div>

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
              <div key={city.id} className="relative h-full">
                <Link
                  href={l(`/visit/${city.slug}`)}
                  className="block h-full"
                  onClick={() =>
                    void trackEvent("block_click", {
                      blockId: "cities",
                      pageId: "home",
                      cityId: city.id,
                      selection,
                    })
                  }
                >
                  <PremiumCard
                    title={city.name}
                    imageUrl={city.image_url ?? undefined}
                    emptyImageMode="black"
                    className="h-full"
                    titleClassName="font-fira text-[1.4625rem] font-bold md:text-[1.625rem]"
                    titleIcon={<MapPinned className="h-[1.2em] w-[1.2em] shrink-0 text-primary" aria-hidden="true" />}
                  />
                </Link>
                <FavoriteButton
                  isFavorite={isDestinationSaved("city", city.id)}
                  onToggle={() => toggleCity(city.id)}
                  size="sm"
                  variant="ghost"
                  className="absolute right-3 top-3 z-20"
                />
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link href={l("/visit")}>
            <Button variant="premium" size="lg">
              {t("sections.homepage.cities.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
