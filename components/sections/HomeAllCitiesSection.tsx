"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useCities, useCityListingCounts } from "@/hooks/useReferenceData";
import { useTranslation } from "react-i18next";
import { cmsText, isSafeHomeCtaHref, type HomeSectionCopy } from "@/lib/cms/home-section-copy";

const FEATURED_LIMIT = 4;

function FeaturedCityCard({
  href,
  name,
  image,
  listingCountLabel,
  exploreLabel,
}: {
  href: string;
  name: string;
  image?: string | null;
  listingCountLabel: string;
  exploreLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative isolate block h-full min-h-[180px] sm:min-h-[200px] overflow-hidden rounded-md bg-black shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={72}
          className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden="true" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white text-shadow-card sm:p-5">
        <h3 className="font-card-title text-xl font-bold not-italic leading-tight tracking-[-0.01em] sm:text-2xl">
          {name}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">
          {listingCountLabel}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white/85">
          {exploreLabel} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function CompactCityCard({
  href,
  name,
  shortDescription,
  listingCountLabel,
}: {
  href: string;
  name: string;
  shortDescription?: string | null;
  listingCountLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-sm border border-black/5 bg-white p-4 shadow-soft-surface transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 ease-out group-hover:bg-primary/15">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-card-title text-lg font-bold not-italic leading-tight tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
            {listingCountLabel}
          </p>
          {shortDescription ? (
            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
              {shortDescription}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function HomeAllCitiesSection({ copy }: { copy?: HomeSectionCopy } = {}) {
  const l = useLocalePath();
  const { i18n, t } = useTranslation();
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: cityCounts = {}, isLoading: countsLoading } = useCityListingCounts();

  const citiesWithListings = cities.filter((city) => (cityCounts[city.id] ?? 0) > 0);
  const isLoading = citiesLoading || countsLoading;

  // Sort by listing count descending, then by display_order, then by name
  const sortedCities = [...citiesWithListings].sort((a, b) => {
    const countDiff = (cityCounts[b.id] ?? 0) - (cityCounts[a.id] ?? 0);
    if (countDiff !== 0) return countDiff;
    if (a.display_order !== b.display_order) return (a.display_order ?? 0) - (b.display_order ?? 0);
    return a.name.localeCompare(b.name);
  });

  const featuredCities = sortedCities.slice(0, FEATURED_LIMIT);
  const compactCities = sortedCities.slice(FEATURED_LIMIT);
  const ctaHref = isSafeHomeCtaHref(copy?.ctaHref) && copy?.ctaHref?.trim()
    ? copy.ctaHref.trim()
    : "/destinations";

  if (!isLoading && citiesWithListings.length === 0) {
    return null;
  }

  return (
    <section id="home-all-cities" className="bg-card py-16 sm:py-20 lg:py-24">
      <div className="app-container content-max">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {cmsText(copy?.eyebrow, t("sections.homepage.cities.label"))}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-normal text-foreground sm:text-4xl">
            {cmsText(copy?.title, t("sections.homepage.cities.browseTitle"))}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            {cmsText(copy?.subtitle ?? copy?.description, t("sections.homepage.cities.allSubtitle"))}
          </p>
        </div>

        {isLoading ? (
          <>
            {/* Featured skeleton */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
                <Skeleton key={`featured-${index}`} className="h-[200px] rounded-md" />
              ))}
            </div>
            {/* Compact skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={`compact-${index}`} className="h-[100px] rounded-sm" />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Featured row */}
            {featuredCities.length > 0 && (
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {featuredCities.map((city) => (
                  <FeaturedCityCard
                    key={city.id}
                    href={l(`/destinations/${city.slug}`)}
                    name={city.name}
                    image={city.image_url}
                    listingCountLabel={t("sections.homepage.common.listingCount", { count: cityCounts[city.id] ?? 0 })}
                    exploreLabel={t("sections.homepage.common.explore")}
                  />
                ))}
              </div>
            )}

            {/* Compact grid */}
            {compactCities.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {compactCities.map((city) => (
                  (() => {
                    const descriptionKey = `sections.homepage.cityDescriptions.${city.slug}`;
                    const shortDescription = i18n.exists(descriptionKey)
                      ? t(descriptionKey)
                      : city.short_description;

                    return (
                      <CompactCityCard
                        key={city.id}
                        href={l(`/destinations/${city.slug}`)}
                        name={city.name}
                        shortDescription={shortDescription}
                        listingCountLabel={t("sections.homepage.common.listingCount", { count: cityCounts[city.id] ?? 0 })}
                      />
                    );
                  })()
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-10 flex justify-center sm:mt-12">
          <Button variant="premium" size="lg" asChild>
            <Link href={l(ctaHref)}>
              {cmsText(copy?.ctaLabel, t("sections.homepage.cities.viewAll"))}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
