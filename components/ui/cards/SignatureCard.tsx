"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
  subtitle?: string;
  image?: string | null;
  category?: string | null;
  tier?: "signature" | "verified" | "default" | string | null;
  href?: string;
  variant?: "hero" | "default" | "featured" | "standard";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  className?: string;
};

function TierBadge({ tier }: { tier?: Props["tier"] }) {
  const { t } = useTranslation();

  if (tier !== "signature" && tier !== "verified") return null;

  const label = tier === "signature"
    ? t("listing.badge.signature")
    : t("listing.badge.verified");

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tier === "signature"
          ? "bg-primary text-primary-foreground"
          : "bg-emerald-500 text-white"
      )}
    >
      {label}
    </span>
  );
}

export function SignatureCard({
  title,
  subtitle,
  image,
  category,
  tier = "default",
  href,
  variant = "default",
  isFavorite = false,
  onToggleFavorite,
  googleRating,
  googleReviewCount,
  className: classNameProp,
}: Props) {
  const { t } = useTranslation();
  const isHero = variant === "hero";
  const isFeatured = variant === "featured";
  const isStandard = variant === "standard";
  const isExternalImage = typeof image === "string" && /^https?:\/\//i.test(image);

  const favoriteButton = onToggleFavorite ? (
    <button
      type="button"
      aria-label={isFavorite ? t("sections.homepage.common.removeFromSaved") : t("sections.homepage.common.saveListing")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite();
      }}
      className={cn(
        "absolute right-4 z-30 rounded-full bg-white/18 p-2 text-white backdrop-blur transition-all duration-300 ease-out hover:bg-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        googleRating ? "top-14" : "top-4"
      )}
    >
      <Heart className={cn("h-4 w-4", isFavorite && "fill-white")} />
    </button>
  ) : null;

  const content = (
    <>
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          unoptimized={isExternalImage}
          sizes={
            isHero
              ? "(max-width: 1024px) 100vw, 50vw"
              : isFeatured
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          }
          quality={72}
          className="object-cover transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden="true" />
      )}

      {/* Consistent gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

      <div className="absolute left-5 right-16 top-5 z-10 flex min-w-0 flex-col items-start gap-2 sm:left-6 sm:top-6">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <TierBadge tier={tier} />
          {googleRating ? (
            <GoogleRatingBadge
              rating={googleRating}
              reviewCount={googleReviewCount}
              variant="overlay"
              size="sm"
            />
          ) : null}
        </div>
        {category ? (
          <span className="max-w-full text-[11px] font-bold uppercase leading-tight tracking-[0.18em] text-white/80">
            {category}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 text-white text-shadow-card",
          isHero ? "p-6 sm:p-8" : isFeatured ? "p-5 sm:p-7" : "p-5 sm:p-6"
        )}
      >
        <h3
          className={cn(
            "line-clamp-2 font-card-title font-bold not-italic leading-tight tracking-[-0.01em]",
            isFeatured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={cn(
              "line-clamp-2 text-white/85",
              isHero ? "mt-3 text-sm sm:text-base" : isFeatured ? "mt-3 text-sm sm:text-base" : "mt-2 text-sm"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    "group relative isolate block h-full min-h-[220px] overflow-hidden rounded-md bg-black shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] motion-reduce:transition-none hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    isFeatured && "min-h-[200px] sm:min-h-[240px] lg:min-h-0",
    isStandard && "min-h-[200px] sm:min-h-[220px]",
    classNameProp
  );

  if (href) {
    return (
      <div className={className}>
        {content}
        <Link
          href={href}
          aria-label={title}
          className="absolute inset-0 z-20 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="sr-only">{title}</span>
        </Link>
        {favoriteButton}
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
      {favoriteButton}
    </div>
  );
}

export default SignatureCard;
