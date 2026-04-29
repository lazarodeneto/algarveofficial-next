"use client";

import Image from "next/image";
import { ArrowRight, Crown } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { getOverlay, useImageBrightness } from "@/lib/hooks/useImageBrightness";

export type BaseCardVariant = "default" | "featured" | "compact" | "editorial";

export interface BaseCardProps {
  id: string;
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  tier?: "signature" | "verified" | "default";
  href?: string;
  variant?: BaseCardVariant;
  aspectRatio?: string;
  priority?: boolean;
  blurDataURL?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  className?: string;
  showCta?: boolean;
  ctaLabel?: string;
}

/* ──────────────────────────────────────────────────────────────── */

const variantConfig: Record<
  BaseCardVariant,
  {
    heightClass: string;
    titleClass: string;
    subtitleClass: string;
    descClass: string;
    overlay: string;
    imageQuality: number;
    showDescription: boolean;
    showCta: boolean;
    badgeStyle: string;
  }
> = {
  default: {
    heightClass: "min-h-[22rem] sm:min-h-[26rem]",
    titleClass: "text-2xl sm:text-3xl",
    subtitleClass: "text-xs sm:text-sm",
    descClass: "text-sm sm:text-base",
    overlay: "from-black/85 via-black/30 to-black/5",
    imageQuality: 70,
    showDescription: true,
    showCta: false,
    badgeStyle: "bg-white/15 text-white border-white/25",
  },
  featured: {
    heightClass: "min-h-[32rem] sm:min-h-[36rem]",
    titleClass: "text-3xl sm:text-4xl lg:text-5xl",
    subtitleClass: "text-sm sm:text-base",
    descClass: "text-base sm:text-lg",
    overlay: "from-black/90 via-black/40 to-black/10",
    imageQuality: 75,
    showDescription: true,
    showCta: true,
    badgeStyle: "bg-primary text-primary-foreground",
  },
  compact: {
    heightClass: "min-h-[16rem] sm:min-h-[20rem]",
    titleClass: "text-xl sm:text-2xl",
    subtitleClass: "text-xs",
    descClass: "text-sm",
    overlay: "from-black/80 via-black/25 to-transparent",
    imageQuality: 65,
    showDescription: false,
    showCta: false,
    badgeStyle: "bg-white/10 text-white/80 border-white/15",
  },
  editorial: {
    heightClass: "min-h-[28rem] sm:min-h-[32rem]",
    titleClass: "text-3xl sm:text-4xl lg:text-5xl",
    subtitleClass: "text-xs sm:text-sm",
    descClass: "text-sm sm:text-base",
    overlay: "from-black/92 via-black/35 to-black/5",
    imageQuality: 75,
    showDescription: true,
    showCta: true,
    badgeStyle: "bg-primary text-primary-foreground",
  },
};

const aspectRatioMap: Record<BaseCardVariant, string> = {
  default: "3/4",
  featured: "4/5",
  compact: "1/1",
  editorial: "4/5",
};

/* ──────────────────────────────────────────────────────────────── */

export function BaseCard({
  id,
  image,
  imageAlt,
  title,
  subtitle,
  description,
  badge,
  tier,
  href,
  variant = "default",
  aspectRatio,
  priority,
  blurDataURL,
  isFavorite,
  onToggleFavorite,
  onClick,
  className,
  showCta: showCtaProp,
  ctaLabel = "Explore",
}: BaseCardProps) {
  const [loaded, setLoaded] = useState(false);
  const titleId = useId();
  const config = variantConfig[variant];
  const brightness = useImageBrightness(image);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick]
  );

  const isClickable = Boolean(onClick || href);
  const effectiveAspect = aspectRatio ?? aspectRatioMap[variant];

  const Wrapper = href
    ? (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          {...props}
          href={href}
          className={cn(
            "group relative isolate block overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            config.heightClass,
            props.className
          )}
        />
      )
    : (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div
          {...props}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onClick={isClickable ? onClick : undefined}
          onKeyDown={isClickable ? handleKeyDown : undefined}
          className={cn(
            "group relative isolate overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-xl",
            isClickable && "cursor-pointer",
            config.heightClass,
            props.className
          )}
        />
      );

  const showCta = showCtaProp ?? config.showCta;
  const effectiveBadge = badge ?? (tier && tier !== "default" ? tier : undefined);

  return (
    <Wrapper
      aria-labelledby={title ? titleId : undefined}
      className={className}
      style={{ aspectRatio: effectiveAspect }}
    >
      {/* Image */}
      {image && (
        <div className="absolute inset-0">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
          )}
          <Image
            src={image}
            alt={imageAlt ?? title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            quality={config.imageQuality}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder={blurDataURL ? "blur" : undefined}
            blurDataURL={blurDataURL}
            onLoad={() => setLoaded(true)}
            className={cn(
              "rounded-2xl object-cover transition-transform duration-500 ease-out will-change-transform",
              variant === "featured" || variant === "editorial"
                ? "group-hover:scale-110"
                : "group-hover:scale-110",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t",
          getOverlay(brightness),
          "to-transparent"
        )}
      />

      {/* Top bar — badge + favorite */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-5">
        {effectiveBadge && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm",
              config.badgeStyle
            )}
          >
            {tier === "signature" && <Crown className="h-3 w-3" />}
            {effectiveBadge}
          </span>
        )}

        {onToggleFavorite && (
          <FavoriteButton
            isFavorite={isFavorite ?? false}
            onToggle={onToggleFavorite}
            size="sm"
            variant="glassmorphism"
            className="shrink-0 bg-white/90 backdrop-blur border-white/20 hover:bg-white hover:border-red-400/30 [&_svg]:text-neutral-700 [&_svg]:hover:text-red-400"
          />
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        {subtitle && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {subtitle}
          </p>
        )}
        <h3
          id={titleId}
          className={cn(
            "font-serif font-semibold leading-tight tracking-normal text-white",
            config.titleClass
          )}
        >
          {title}
        </h3>
        {config.showDescription && description && (
          <p className={cn("mt-3 max-w-lg line-clamp-2 text-white/80", config.descClass)}>
            {description}
          </p>
        )}
        {showCta && (
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition group-hover:text-white">
            {ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </Wrapper>
  );
}

export default BaseCard;
