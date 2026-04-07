import Link from "next/link";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { useCities } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { supabase } from "@/integrations/supabase/client";
import {
  validateSelectedCityIds,
} from "@/lib/cms/city-block-config";
import {
  normalizePlacementSelection,
  resolveFeaturedCity,
  type PlacementListing,
} from "@/lib/cms/placement-engine";

export function FeaturedCitySection() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { data: cities = [], isLoading } = useCities();
  const { getBlockData } = useCmsPageBuilder("home");
  const blockData = getBlockData("featured-city");
  const featuredCityId = typeof blockData.cityId === "string" ? blockData.cityId.trim() : "";
  const selection = normalizePlacementSelection(blockData.selection);
  const { data: cityListings = [] } = useQuery({
    queryKey: ["home-featured-city-placement-listings"],
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

  if (isLoading || cities.length === 0) {
    return null;
  }

  const { validCityIds } = validateSelectedCityIds(
    "featured-city",
    featuredCityId ? [featuredCityId] : [],
    cities,
  );
  const selectedCity = resolveFeaturedCity({
    selection,
    cities,
    listings: cityListings,
    manualCityId: validCityIds[0] ?? null,
  });

  if (!selectedCity) {
    return null;
  }

  return (
    <section
      id="featured-city"
      className="py-12 lg:py-16"
      data-cms-featured-city-selection={selection}
    >
      <div className="app-container">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
          <div className="relative min-h-[18rem]">
            {selectedCity.hero_image_url || selectedCity.image_url ? (
              <img
                src={selectedCity.hero_image_url || selectedCity.image_url || ""}
                alt={selectedCity.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                {selection === "tier-driven"
                  ? t("sections.cities.tierDrivenCity", "Tier Driven City")
                  : t("sections.cities.featuredCity", "Featured City")}
              </p>
              <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
                {selectedCity.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/90">
                {selectedCity.short_description || t("sections.cities.subtitle")}
              </p>
              <Link
                href={l(`/visit/${selectedCity.slug}`)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                {t("sections.cities.exploreCity", "Explore City")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
