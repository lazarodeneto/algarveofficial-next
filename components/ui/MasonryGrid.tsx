"use client";

import Image from "next/image";
import { Crown, ArrowRight } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/favorite-button";

/* ──────────────────────────────────────────────────────────────── */
/*  Types                                                          */
/* ──────────────────────────────────────────────────────────────── */

export type MasonryGridItem = {
  id: string;
  image: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  aspectRatio?: string; // e.g. "3/4", "4/3", "1/1" — prevents CLS when provided
  priority?: boolean;
  blurDataURL?: string; // base64 blur placeholder
  tier?: "signature" | "verified" | "default";
  featured?: boolean;
};

interface MasonryGridProps {
  items: MasonryGridItem[];
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
  onItemClick?: (item: MasonryGridItem) => void;
  className?: string;
  /** Renders a skeleton pulse block when true */
  isLoading?: boolean;
  /** Number of skeleton items to show while loading */
  skeletonCount?: number;
  /** Root margin for intersection observer (e.g. "200px") */
  rootMargin?: string;
  /** Max hero cards per viewport chunk (default: 1 per 6 items) */
  heroFrequency?: number;
}

/* ──────────────────────────────────────────────────────────────── */
/*  useInView — lightweight intersection observer hook             */
/* ──────────────────────────────────────────────────────────────── */

function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    const el = ref.current;
    if (!el || inView) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0, ...options }
    );

    observerRef.current.observe(el);
  }, [inView, options]);

  useState(() => setupObserver);

  // Setup on mount and when ref changes
  useMemo(() => setupObserver(), [setupObserver]);

  return [ref, inView];
}

/* ──────────────────────────────────────────────────────────────── */
/*  Layout engine — prioritise + distribute cards                  */
/* ──────────────────────────────────────────────────────────────── */

type CardVariant = "hero" | "standard" | "compact";

interface LayoutItem extends MasonryGridItem {
  variant: CardVariant;
}

function assignVariants(
  items: MasonryGridItem[],
  heroFrequency: number
): LayoutItem[] {
  let heroCount = 0;
  let sinceLastHero = 0;

  return items.map((item, index) => {
    // Determine raw priority
    const isHeroEligible = item.featured || item.tier === "signature";
    const isVerified = item.tier === "verified";

    let variant: CardVariant;

    if (isHeroEligible && sinceLastHero >= heroFrequency) {
      variant = "hero";
      heroCount++;
      sinceLastHero = 0;
    } else if (isHeroEligible || isVerified) {
      variant = "standard";
      sinceLastHero++;
    } else {
      variant = "compact";
      sinceLastHero++;
    }

    return { ...item, variant };
  });
}

/* ──────────────────────────────────────────────────────────────── */
/*  Skeleton                                                       */
/* ──────────────────────────────────────────────────────────────── */

function SkeletonCard({ variant = "standard" }: { variant?: CardVariant }) {
  const aspect = variant === "hero" ? "aspect-[4/5]" : variant === "compact" ? "aspect-[3/4]" : "aspect-[3/4]";
  return (
    <div className="mb-5 break-inside-avoid">
      <div className={cn("relative overflow-hidden rounded-2xl bg-muted", aspect)}>
        <div className="absolute inset-0 animate-pulse bg-muted" />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Card component — three variants                                */
/* ──────────────────────────────────────────────────────────────── */

function MasonryCard({
  item,
  isFavorite,
  onToggleFavorite,
  onItemClick,
  rootMargin,
}: {
  item: LayoutItem;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
  onItemClick?: (item: MasonryGridItem) => void;
  rootMargin?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const titleId = useId();
  const [cardRef, isVisible] = useInView<HTMLDivElement>({
    rootMargin: rootMargin ?? "200px",
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onItemClick?.(item);
      }
    },
    [item, onItemClick]
  );

  const isClickable = Boolean(onItemClick || item.href);

  // Variant-driven styling
  const variantConfig = {
    hero: {
      heightClass: "min-h-[32rem] sm:min-h-[36rem]",
      titleClass: "text-3xl sm:text-4xl lg:text-5xl",
      subtitleClass: "text-base sm:text-lg",
      overlay: "from-black/90 via-black/40 to-black/10",
      badge: "bg-primary text-primary-foreground",
      showDescription: true,
      showCta: true,
      imageQuality: 75,
    },
    standard: {
      heightClass: "min-h-[22rem] sm:min-h-[26rem]",
      titleClass: "text-2xl sm:text-3xl",
      subtitleClass: "text-sm sm:text-base",
      overlay: "from-black/85 via-black/30 to-black/5",
      badge: "bg-white/15 text-white border border-white/25",
      showDescription: true,
      showCta: false,
      imageQuality: 70,
    },
    compact: {
      heightClass: "min-h-[16rem] sm:min-h-[20rem]",
      titleClass: "text-xl sm:text-2xl",
      subtitleClass: "text-sm",
      overlay: "from-black/80 via-black/25 to-transparent",
      badge: "bg-white/10 text-white/80 border border-white/15",
      showDescription: false,
      showCta: false,
      imageQuality: 65,
    },
  }[item.variant];

  const CardWrapper = item.href
    ? (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          {...props}
          href={item.href}
          ref={cardRef as React.Ref<HTMLAnchorElement>}
          className={cn(
            "group relative mb-5 block break-inside-avoid overflow-hidden rounded-2xl bg-muted shadow-sm transition duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            props.className
          )}
        />
      )
    : (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div
          {...props}
          ref={cardRef}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onClick={isClickable ? () => onItemClick?.(item) : undefined}
          onKeyDown={isClickable ? handleKeyDown : undefined}
          className={cn(
            "group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-muted shadow-sm transition duration-300 hover:shadow-xl",
            isClickable && "cursor-pointer",
            props.className
          )}
        />
      );

  const favoriteActive = isFavorite?.(item.id) ?? false;

  // Aspect ratio for CLS safety
  const aspectRatioMap: Record<CardVariant, string> = {
    hero: "4/5",
    standard: "3/4",
    compact: "1/1",
  };
  const aspectStyle = item.aspectRatio
    ? ({ aspectRatio: item.aspectRatio } as React.CSSProperties)
    : ({ aspectRatio: aspectRatioMap[item.variant] } as React.CSSProperties);

  return (
    <CardWrapper aria-labelledby={item.title ? titleId : undefined}>
      {/* Image container — aspect ratio locks height, eliminating CLS */}
      <div
        className={cn("relative w-full", variantConfig.heightClass)}
        style={aspectStyle}
      >
        {/* Skeleton — visible until image loads or while not in viewport */}
        {(!loaded || !isVisible) && (
          <div
            className="absolute inset-0 animate-pulse bg-muted"
            aria-hidden="true"
          />
        )}

        {isVisible ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? item.title ?? ""}
            fill
            sizes={
              item.variant === "hero"
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            }
            quality={variantConfig.imageQuality}
            priority={item.priority}
            loading={item.priority ? "eager" : "lazy"}
            placeholder={item.blurDataURL ? "blur" : undefined}
            blurDataURL={item.blurDataURL}
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover transition duration-500",
              item.variant === "hero"
                ? "group-hover:scale-[1.03]"
                : "group-hover:scale-[1.04]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null}
      </div>

      {/* Gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t transition duration-300",
          variantConfig.overlay
        )}
      />

      {/* Tier badge — top left */}
      {item.tier && item.tier !== "default" && (
        <div className="absolute left-4 top-4 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm",
              variantConfig.badge
            )}
          >
            {item.tier === "signature" && <Crown className="h-3 w-3" />}
            {item.tier}
          </span>
        </div>
      )}

      {/* Favorite button */}
      {onToggleFavorite && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            isFavorite={favoriteActive}
            onToggle={() => onToggleFavorite(item.id)}
            size="sm"
            variant="glassmorphism"
            className="bg-white/90 backdrop-blur border-white/20 hover:bg-white hover:border-red-400/30 [&_svg]:text-neutral-700 [&_svg]:hover:text-red-400"
          />
        </div>
      )}

      {/* Content overlay — bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <div
          className={cn(
            "bg-gradient-to-t from-black/60 to-transparent",
            item.variant === "hero" ? "p-1" : ""
          )}
        >
          {item.subtitle && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {item.subtitle}
            </p>
          )}
          {item.title && (
            <h3
              id={titleId}
              className={cn(
                "font-serif font-semibold leading-tight tracking-normal text-white",
                variantConfig.titleClass
              )}
            >
              {item.title}
            </h3>
          )}
          {variantConfig.showDescription && item.imageAlt && (
            <p className={cn("mt-3 max-w-lg line-clamp-2 text-white/80", variantConfig.subtitleClass)}>
              {item.imageAlt}
            </p>
          )}
          {variantConfig.showCta && (
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition group-hover:text-white">
              Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Main grid                                                      */
/* ──────────────────────────────────────────────────────────────── */

export default function MasonryGrid({
  items,
  isFavorite,
  onToggleFavorite,
  onItemClick,
  className,
  isLoading,
  skeletonCount = 8,
  rootMargin,
  heroFrequency = 6,
}: MasonryGridProps) {
  const layoutItems = useMemo(
    () => assignVariants(items, heroFrequency),
    [items, heroFrequency]
  );

  return (
    <div
      className={cn(
        "columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4",
        className
      )}
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} variant={i === 0 ? "hero" : "standard"} />
          ))
        : layoutItems.map((item) => (
            <MasonryCard
              key={item.id}
              item={item}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onItemClick={onItemClick}
              rootMargin={rootMargin}
            />
          ))}
    </div>
  );
}
