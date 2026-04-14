"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";

export interface CityHubItem {
  id: string;
  name: string;
  slug: string;
  hero_image_url: string | null;
  image_url: string | null;
  short_description: string | null;
  totalCount?: number;
  municipalityRegionId?: string | null;
  municipalityCityIds?: string[];
}

type CityHubTranslationPrefix = "directory" | "experiences";

const CITY_HUB_TRANSLATION_KEYS: Record<
  CityHubTranslationPrefix,
  {
    featuredCityHub: string;
    featuredCityHubDescription: string;
    cityIndex: string;
    exploreAlgarveCities: string;
    cityIndexDescription: string;
    listingsCount: string;
  }
> = {
  directory: {
    featuredCityHub: "directory.featuredCityHub",
    featuredCityHubDescription: "directory.featuredCityHubDescription",
    cityIndex: "directory.cityIndex",
    exploreAlgarveCities: "directory.exploreAlgarveCities",
    cityIndexDescription: "directory.cityIndexDescription",
    listingsCount: "directory.listingsCount",
  },
  experiences: {
    featuredCityHub: "experiences.featuredCityHub",
    featuredCityHubDescription: "experiences.featuredCityHubDescription",
    cityIndex: "experiences.cityIndex",
    exploreAlgarveCities: "experiences.exploreAlgarveCities",
    cityIndexDescription: "experiences.cityIndexDescription",
    listingsCount: "experiences.listingsCount",
  },
};

interface CityHubsSectionProps {
  highlightedCity: CityHubItem | undefined;
  topCities: CityHubItem[];
  cityListingCounts: Record<string, number>;
  preferCityListingCounts?: boolean;
  cityPathBuilder?: (city: CityHubItem) => string;
  imageTimestamp: number;
  basePath: string;
  translationPrefix: CityHubTranslationPrefix;
}

export function CityHubsSection({
  highlightedCity,
  topCities,
  cityListingCounts,
  preferCityListingCounts = false,
  cityPathBuilder,
  imageTimestamp,
  basePath,
  translationPrefix,
}: CityHubsSectionProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, "");
  const cityHubBasePath =
    normalizedBasePath === "city" || normalizedBasePath === "stay"
      ? "visit"
      : normalizedBasePath || "visit";
  const translationKeys = CITY_HUB_TRANSLATION_KEYS[translationPrefix];

  const getCityCount = (city: CityHubItem) => {
    // For municipalities, always use the aggregated totalCount
    if (city.municipalityCityIds && city.municipalityCityIds.length > 0) {
      return city.totalCount ?? 0;
    }

    if (preferCityListingCounts) {
      return cityListingCounts[city.id] ?? city.totalCount ?? 0;
    }
    return city.totalCount ?? cityListingCounts[city.id] ?? 0;
  };
  const getCityHref = (city: CityHubItem) =>
    l(cityPathBuilder?.(city) ?? `/${cityHubBasePath}/${city.slug}`);

  const featured = highlightedCity ?? topCities[0];
  if (!featured) return null;

  return (
    <section className="mb-[calc(4rem+10px)] sm:mb-[calc(5rem+10px)] space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Link
          href={getCityHref(featured)}
          className="group block h-full overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
        >
          <div className="relative h-full min-h-[28rem]">
            {featured.hero_image_url || featured.image_url ? (
              <img
                src={`${
                  featured.hero_image_url ?? featured.image_url
                }?_t=${imageTimestamp}`}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                {t(translationKeys.featuredCityHub)}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                {featured.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/85">
                {featured.short_description ||
                  t(translationKeys.featuredCityHubDescription, {
                    count: getCityCount(featured),
                    name: featured.name,
                  })}
              </p>
            </div>
          </div>
        </Link>

        <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {t(translationKeys.cityIndex)}
          </p>
          <h2 className="mt-3 font-serif text-2xl text-foreground">
            {t(translationKeys.exploreAlgarveCities)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t(translationKeys.cityIndexDescription)}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {topCities.map((city) => (
              <Link
                key={city.id}
                href={getCityHref(city)}
                className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="font-medium text-foreground">
                  {city.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(translationKeys.listingsCount, { count: getCityCount(city) })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
