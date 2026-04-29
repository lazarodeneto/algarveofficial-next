"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { type ComponentProps } from "react";
import NextLink from "next/link";

import { Button } from "@/components/ui/Button";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useRegionListingCounts, useRegions } from "@/hooks/useReferenceData";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { getRegionImageSet } from "@/lib/regionImages";
import { getOverlay, useImageBrightness } from "@/lib/hooks/useImageBrightness";
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
};

function EditorialRegionCard({
  href,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  isHero = false,
  isFavorite,
  onToggleFavorite,
}: RegionCardProps) {
  const brightness = useImageBrightness(image);

  return (
    <NextLink
      prefetch={false}
      href={href}
      className={cn(
        "group relative isolate block h-full min-h-[240px] overflow-hidden rounded-2xl bg-black shadow-[0_22px_70px_-46px_rgba(0,0,0,0.85)] transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-[0_28px_82px_-48px_rgba(0,0,0,0.95)]",
        isHero ? "lg:col-span-2 lg:row-span-2" : ""
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={isHero ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"}
          quality={72}
          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
        />
      ) : null}
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent", getOverlay(brightness))} />
      <div className="absolute right-4 top-4 z-10" onClick={(event) => event.preventDefault()}>
        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          size="sm"
          variant="glassmorphism"
        />
      </div>
      <div className={cn("absolute inset-x-0 bottom-0 z-10 text-white", isHero ? "p-5 sm:p-7" : "p-4 sm:p-5")}>
        <div
          className={cn(
            "inline-block max-w-full rounded-lg bg-black/40 px-4 py-3 backdrop-blur-sm",
            isHero ? "sm:px-5 sm:py-4" : ""
          )}
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            {subtitle}
          </p>
          <h3 className={cn(
            "line-clamp-2 font-semibold leading-tight tracking-tight text-white drop-shadow-md",
            isHero ? "font-serif text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"
          )}>
            {title}
          </h3>
          {description ? (
            <p className={cn("mt-3 line-clamp-2 text-sm leading-6 text-white/90", isHero ? "max-w-xl sm:text-base" : "max-w-md")}>
              {description}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
            Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
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

  function Link(props: ComponentProps<typeof NextLink>) {
    return <NextLink prefetch={false} {...props} />;
  }

  const displayRegions = (regions?.filter((region) => region.image_url || getRegionImageSet(region.slug)) ?? []).slice(0, 8);

  if (regionsLoading) {
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

        {/* Editorial region grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:auto-rows-[260px] lg:gap-6">
          {displayRegions.slice(0, 5).map((region, index) => {
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
                subtitle={`${listingCount} ${t("sections.regions.listings")}`}
                description={region.short_description ?? "Discover premium experiences"}
                href={l(`/destinations/${region.slug}`)}
                isHero={index === 0}
                isFavorite={isDestinationSaved('region', region.id)}
                onToggleFavorite={() => toggleRegion(region.id)}
              />
            );
          })}
        </div>

        {/* CTA */}
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
