"use client";

import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";
import NextLink from "next/link";

import { Button } from "@/components/ui/Button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useRegionListingCounts, useRegions } from "@/hooks/useReferenceData";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { getRegionImageSet } from "@/lib/regionImages";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeleton/SkeletonCard";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { cn } from "@/lib/utils";

interface RegionsSectionProps {
  imageTimestamp?: number;
}

type RegionCardProps = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  description?: string | null;
  image?: string;
  imageAlt: string;
  isHero?: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  exploreLabel: string;
  className?: string;
};

function EditorialRegionCard({
  href,
  title,
  subtitle,
  image,
  imageAlt,
  isFavorite,
  onToggleFavorite,
  exploreLabel,
  className,
}: RegionCardProps) {
  return (
    <NextLink
      prefetch={false}
      href={href}
      className={cn(
        "group relative isolate block h-full min-h-[200px] overflow-hidden rounded-2xl bg-black shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={72}
          className="object-cover transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none group-hover:scale-[1.04]"
        />
      ) : null}
      {/* Consistent overlay — lighter than Signature */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute right-3 top-3 z-10" onClick={(event) => event.preventDefault()}>
        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          size="sm"
          variant="glassmorphism"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white text-shadow-card sm:p-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {subtitle}
        </p>
        <h3 className="line-clamp-2 font-serif text-xl font-semibold not-italic leading-tight tracking-normal text-white sm:text-2xl">
          {title}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 sm:mt-3 sm:gap-2">
          {exploreLabel} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </NextLink>
  );
}

export function RegionsSection({ imageTimestamp = 0 }: RegionsSectionProps) {
  const { isDestinationSaved, toggleRegion } = useSavedDestinations();
  const { data: regionCounts } = useRegionListingCounts();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { t } = useTranslation();
  const l = useLocalePath();

  const displayRegions = (regions?.filter((region) => region.image_url || getRegionImageSet(region.slug)) ?? []).slice(0, 6);

  if (regionsLoading) {
    return (
      <section id="regions" className="bg-background py-16 sm:py-20 lg:py-24">
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
    <section id="regions" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="app-container">
        {/* Section Header */}
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t("sections.homepage.regions.label")}
            </span>
            <h2 className="mt-3 text-title font-serif font-medium text-foreground">
              {t("sections.homepage.regions.title")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("sections.homepage.regions.subtitle")}
            </p>
          </div>
          <NextLink prefetch={false} href={l("/destinations")} className="hidden text-sm font-semibold text-primary transition-colors hover:text-primary/80 lg:inline-flex">
            {t("sections.homepage.regions.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </NextLink>
        </div>

        {/* Region grid — equal weight, navigational */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {displayRegions.map((region) => {
            const images = getRegionImageSet(region.slug);
            const hasCustomImage = !!region.image_url;
            const listingCount = regionCounts?.[region.id] ?? 0;
            const imageSrc = hasCustomImage
              ? `${region.image_url}?_t=${imageTimestamp}`
              : typeof images?.image800 === "string"
                ? images.image800
                : images?.image800?.src;

            return (
              <EditorialRegionCard
                key={region.id}
                id={region.id}
                image={imageSrc}
                imageAlt={region.name}
                title={region.name}
                subtitle={t("sections.homepage.common.listingCount", { count: listingCount })}
                description={region.short_description ?? t("sections.homepage.regions.subtitle")}
                href={l(`/destinations/${region.slug}`)}
                isFavorite={isDestinationSaved('region', region.id)}
                onToggleFavorite={() => toggleRegion(region.id)}
                exploreLabel={t("sections.homepage.common.explore")}
              />
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center lg:hidden">
          <NextLink
            prefetch={false}
            href={l("/destinations")}
            className="block w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(50%-0.625rem)] lg:w-auto"
          >
            <Button variant="gold" size="lg" className="gap-2 w-full">
              <Compass className="h-5 w-5" />
              {t("sections.homepage.regions.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </NextLink>
        </div>
      </div>
    </section>
  );
}
