"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/favorite-button";

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
}

/* ------------------------------------------------------------------ */
//  useInView — lightweight intersection observer hook

function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, options]);

  return [ref, inView];
}

/* ------------------------------------------------------------------ */
//  Skeleton placeholder — same dimensions as a card so CLS = 0

function SkeletonCard() {
  return (
    <div className="mb-5 break-inside-avoid">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
//  Individual card

function MasonryCard({
  item,
  isFavorite,
  onToggleFavorite,
  onItemClick,
  rootMargin,
}: {
  item: MasonryGridItem;
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
  const aspectStyle = item.aspectRatio
    ? ({ aspectRatio: item.aspectRatio } as React.CSSProperties)
    : undefined;

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

  return (
    <CardWrapper aria-labelledby={item.title ? titleId : undefined}>
      {/* Image container — aspect ratio locks height, eliminating CLS */}
      <div
        className={cn(
          "relative w-full",
          !item.aspectRatio && "min-h-[200px]"
        )}
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            quality={70}
            priority={item.priority}
            loading={item.priority ? "eager" : "lazy"}
            placeholder={item.blurDataURL ? "blur" : undefined}
            blurDataURL={item.blurDataURL}
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover transition duration-500 group-hover:scale-[1.04]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null}
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />

      {/* Favorite button — integrated with project FavoriteButton */}
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

      {/* Bottom gradient + text */}
      {(item.title || item.subtitle) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
          {item.title && (
            <p id={titleId} className="text-sm font-semibold text-white">
              {item.title}
            </p>
          )}
          {item.subtitle && (
            <p className="mt-0.5 text-xs font-medium text-white/80">
              {item.subtitle}
            </p>
          )}
        </div>
      )}
    </CardWrapper>
  );
}

/* ------------------------------------------------------------------ */
//  Main grid

export default function MasonryGrid({
  items,
  isFavorite,
  onToggleFavorite,
  onItemClick,
  className,
  isLoading,
  skeletonCount = 8,
  rootMargin,
}: MasonryGridProps) {
  return (
    <div
      className={cn(
        "columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4",
        className
      )}
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))
        : items.map((item) => (
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
