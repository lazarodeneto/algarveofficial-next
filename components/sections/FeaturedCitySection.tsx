import Link from "next/link";
import { MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCities } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  validateSelectedCityIds,
} from "@/lib/cms/city-block-config";
import {
  normalizePlacementSelection,
  resolveFeaturedCityDetailed,
  type PlacementListing,
} from "@/lib/cms/placement-engine";
import { trackBlockImpression, trackEvent } from "@/lib/analytics/platformTracking";
import { publishedListingsQueryKey } from "@/lib/query-keys";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";

const firaSans700Style = {
  fontFamily: "var(--font-fira-sans), 'Fira Sans', sans-serif",
  fontWeight: 700,
} as const;

export function FeaturedCitySection() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const queryClient = useQueryClient();
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { data: cities = [], isLoading } = useCities();
  const { getBlockData } = useCmsPageBuilder("home");
  const blockData = getBlockData("featured-city");
  const featuredCityId = typeof blockData.cityId === "string" ? blockData.cityId.trim() : "";
  const selection = normalizePlacementSelection(blockData.selection);
  const cityListings = useMemo(
    () =>
      (queryClient.getQueryData<PlacementListing[]>(publishedListingsQueryKey({}, locale)) ?? [])
        .filter((listing) => listing.status === "published"),
    [locale, queryClient],
  );

  const { validCityIds } = validateSelectedCityIds(
    "featured-city",
    featuredCityId ? [featuredCityId] : [],
    cities,
  );
  const placementResult = resolveFeaturedCityDetailed({
    selection,
    cities,
    listings: cityListings,
    manualCityId: validCityIds[0] ?? null,
  });
  const selectedCity = placementResult?.item ?? null;

  useEffect(() => {
    if (!selectedCity) return;
    void trackBlockImpression({
      blockId: "featured-city",
      pageId: "home",
      selection,
    });
  }, [selection, selectedCity]);

  if (isLoading || cities.length === 0 || !selectedCity) {
    return null;
  }

  return (
    <section
      id="featured-city"
      className="py-12 lg:py-16"
      data-cms-featured-city-selection={selection}
    >
      <div className="app-container">
        <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm [clip-path:inset(0_round_1.25rem)] [transform:translateZ(0)]">
          <div className="relative min-h-[28rem]">
            {selectedCity.hero_image_url || selectedCity.image_url ? (
              <img
                src={selectedCity.hero_image_url ?? selectedCity.image_url ?? ""}
                alt={selectedCity.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-black" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs not-italic uppercase tracking-[0.24em] text-white/80" style={firaSans700Style}>
                {selection === "tier-driven"
                  ? t("sections.cities.tierDrivenCity")
                  : t("sections.cities.featuredCity")}
              </p>
              <h2 className="mt-2 text-3xl not-italic leading-tight md:text-4xl" style={firaSans700Style}>
                {selectedCity.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/90">
                {selectedCity.short_description || t("sections.cities.subtitle")}
              </p>
              <Link
                href={l(`/visit/${selectedCity.slug}`)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-primary"
                onClick={() =>
                  void trackEvent("block_click", {
                    blockId: "featured-city",
                    pageId: "home",
                    cityId: selectedCity.id,
                    selection,
                  })
                }
              >
                <MapPin className="h-4 w-4" />
                {t("sections.cities.exploreCity")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
