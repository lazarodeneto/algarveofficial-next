import { m } from "framer-motion";
import Image from "next/image";
import NextLink from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { type ComponentProps } from "react";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useRegionListingCounts, useRegions } from "@/hooks/useReferenceData";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { getRegionImageSet } from "@/lib/regionImages";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SkeletonCard from "@/components/skeleton/SkeletonCard";

interface RegionsSectionProps {
  imageTimestamp?: number;
}

export function RegionsSection({ imageTimestamp = 0 }: RegionsSectionProps) {
  const { isDestinationSaved, toggleRegion } = useSavedDestinations();
  const { data: regionCounts } = useRegionListingCounts();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { t } = useTranslation();
  const l = useLocalePath();
  const isLoading = regionsLoading;

  function Link(props: ComponentProps<typeof NextLink>) {
    return <NextLink prefetch={false} {...props} />;
  }

  // Filter to only regions that have images available (from DB or static)
  const displayRegions = (regions?.filter((region) => region.image_url || getRegionImageSet(region.slug)) ?? []).slice(0, 8);

  if (isLoading) {
    return (
      <section id="regions" className="pt-8 pb-24 lg:pt-10 lg:pb-32 bg-background">
        <div className="app-container">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 lg:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} variant="destination" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!displayRegions.length) {
    return null;
  }

  return (
    <section id="regions" className="pt-8 pb-24 lg:pt-10 lg:pb-32 bg-background">
        <div className="app-container">
          {/* Section Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
            style={{ willChange: 'transform, opacity' }}
          >
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              Selected Destinations
            </span>
            <h2 className="mt-4 text-title font-serif font-medium text-foreground">
              Explore the Algarve by Region
            </h2>
            <p className="mt-4 text-body text-muted-foreground max-w-2xl mx-auto">
              Discover selected Algarve destinations with premium places to stay, eat and explore.
            </p>
          </m.div>

          {/* Regions Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 lg:gap-4">
            {displayRegions.map((region) => {
              const images = getRegionImageSet(region.slug);
              const hasCustomImage = !!region.image_url;
              const listingCount = regionCounts?.[region.id] ?? 0;

              return (
                <div key={region.id} className="relative min-w-0">
                  {/* Favorite Button - Top Right */}
                  <div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                    <FavoriteButton
                      isFavorite={isDestinationSaved('region', region.id)}
                      onToggle={() => toggleRegion(region.id)}
                      size="sm"
                      variant="glassmorphism"
                    />
                  </div>

                  <Link
                    href={l(`/destinations/${region.slug}`)}
                    className="glass-box group relative block cursor-pointer overflow-hidden rounded-xl border border-border bg-card aspect-[0.9] sm:aspect-[0.9] lg:aspect-[5/4] lg:rounded-2xl"
                  >
                    {/* Image */}
                    <div className="absolute inset-0 rounded-[inherit]">
                      {hasCustomImage ? (
                        <Image
                          src={`${region.image_url}?_t=${imageTimestamp}`}
                          alt={region.name}
                          fill
                          sizes="(max-width: 639px) 48vw, (max-width: 1023px) 31vw, 384px"
                          className="object-cover rounded-[inherit]"
                          unoptimized
                        />
                      ) : images ? (
                        <Image
                          src={images.image800}
                          alt={region.name}
                          fill
                          sizes="(max-width: 639px) 48vw, (max-width: 1023px) 31vw, 384px"
                          className="object-cover rounded-[inherit]"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 rounded-[inherit]" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-2.5 sm:p-3 lg:p-6">
                      <h3 className="mb-1 text-sm font-serif font-medium leading-[1.05] text-white sm:text-lg lg:mb-2 lg:text-2xl">
                        {region.name}
                      </h3>
                      <p className="mb-3 hidden text-body-sm text-white/70 sm:block lg:mb-4">
                        {region.short_description ?? "Discover premium experiences"}
                      </p>
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-body-xs text-white/60">
                          {listingCount} {t("sections.regions.listings")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-body-xs font-medium text-primary lg:gap-2">
                          <span className="hidden sm:inline">{t("sections.regions.explore")}</span>
                          <span className="sm:hidden">{t("common.go")}</span>
                          <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* CTA Button — width matches flex-grid-centered card widths */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <Link
              href={l("/destinations")}
              className="block w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(50%-0.625rem)] lg:w-auto"
            >
              <Button variant="gold" size="lg" className="gap-2 w-full">
                <Compass className="h-5 w-5" />
                View All Regions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </m.div>
        </div>
      </section>
  );
}
