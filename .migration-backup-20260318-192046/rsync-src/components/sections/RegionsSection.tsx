"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { FavoriteButton } from "@/components/ui/favorite-button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { usePublishedListings } from "@/hooks/useListings";
import { useRegions } from "@/hooks/useReferenceData";
import { useTranslation } from "react-i18next";
import type { StaticImageData } from "next/image";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getRegionImageSet } from "@/lib/regionImages";
import SkeletonCard from "@/components/skeleton/SkeletonCard";

export function RegionsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isDestinationSaved } = useSavedDestinations();
  const { data: listings = [], isLoading: listingsLoading } = usePublishedListings();
  const { data: regions = [], isLoading: regionsLoading } = useRegions();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const isLoading = listingsLoading || regionsLoading;

  const listingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const listing of listings) {
      if (!listing.region_id) continue;
      counts[listing.region_id] = (counts[listing.region_id] || 0) + 1;
    }
    return counts;
  }, [listings]);

  const displayRegions = useMemo(() => {
    return regions.filter((r) => !!getRegionImageSet(r.slug));
  }, [regions]);

  if (!mounted) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="pt-8 pb-24 lg:pt-10 lg:pb-32 bg-background">
        <div className="app-container">

          {/* HEADER */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-32 mx-auto mb-4" />
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
                  {t("sections.regions.label")}
                </span>

                <h2 className="mt-4 text-title font-serif text-foreground">
                  {t("sections.regions.title")}
                </h2>

                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                  {t("sections.regions.subtitle")}
                </p>
              </>
            )}
          </m.div>

          {/* GRID */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">

            {isLoading &&
              [1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} variant="destination" />
              ))}

            {!isLoading &&
              displayRegions.map((region) => {
                const images = getRegionImageSet(region.slug);
                if (!images) return null;

                const listingCount = listingCounts?.[region.id] || 0;

                const resolveImageSrc = (value: string | StaticImageData) =>
                  typeof value === "string" ? value : value.src;

                return (
                  <div key={region.id} className="relative">

                    {/* Favorite */}
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton
                        isFavorite={isDestinationSaved("region", region.id)}
                        type="region"
                        id={region.id}
                        size="sm"
                        variant="glassmorphism"
                      />
                    </div>

                    <Link
                      href={buildLangPath(langPrefix, `/destinations/${region.slug}`)}
                      className="group block overflow-hidden rounded-xl border bg-card"
                    >
                      <div className="relative aspect-[0.9] lg:aspect-[5/4]">
                        <img
                          src={resolveImageSrc(images.image)}
                          srcSet={`${resolveImageSrc(images.image400)} 400w,
                                  ${resolveImageSrc(images.image800)} 800w,
                                  ${resolveImageSrc(images.image)} 1200w`}
                          alt={region.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end p-3 lg:p-6">
                        <h3 className="text-white text-lg lg:text-2xl font-serif">
                          {region.name}
                        </h3>

                        <p className="hidden sm:block text-white/70 mt-2">
                          {region.short_description || "Discover premium experiences"}
                        </p>

                        <div className="flex justify-between items-center mt-3 text-white/60 text-xs">
                          <span>
                            {listingCount} {t("sections.regions.listings")}
                          </span>

                          <span className="flex items-center gap-1 text-primary">
                            {t("sections.regions.explore")}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}

          </div>

          {/* CTA */}
          {!isLoading && displayRegions.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 flex justify-center"
            >
              <Link href={buildLangPath(langPrefix, "/destinations")}>
                <Button variant="gold" size="lg" className="gap-2">
                  <Compass className="h-5 w-5" />
                  {t("sections.regions.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </m.div>
          )}

        </div>
      </section>
    </LazyMotion>
  );
}
