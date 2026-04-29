"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getOverlay, useImageBrightness } from "@/lib/hooks/useImageBrightness";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  image?: string | null;
  category?: string | null;
  tier?: "signature" | "verified" | "default" | string | null;
  href?: string;
  variant?: "hero" | "default";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

function TierBadge({ tier }: { tier?: Props["tier"] }) {
  if (tier !== "signature" && tier !== "verified") return null;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tier === "signature"
          ? "bg-primary text-primary-foreground"
          : "bg-emerald-500 text-white"
      )}
    >
      {tier}
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
  className: classNameProp,
}: Props) {
  const isHero = variant === "hero";
  const isExternalImage = typeof image === "string" && /^https?:\/\//i.test(image);
  const brightness = useImageBrightness(image);

  const content = (
    <>
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          unoptimized={isExternalImage}
          sizes={isHero ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
          quality={72}
          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden="true" />
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t",
          getOverlay(brightness),
          "to-transparent"
        )}
      />

      {category ? (
        <div className="absolute left-4 top-4 z-10 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
          {category}
        </div>
      ) : null}

      {onToggleFavorite ? (
        <button
          type="button"
          aria-label={isFavorite ? "Remove from saved" : "Save listing"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-white")} />
        </button>
      ) : null}

      <div className={cn("absolute bottom-0 left-0 right-0 z-10 text-white", isHero ? "p-6 sm:p-8" : "p-5 sm:p-6")}>
        <TierBadge tier={tier} />
        <h3
          className={cn(
            "mt-3 line-clamp-2 font-serif font-semibold leading-tight tracking-normal",
            isHero ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl"
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className={cn("mt-3 line-clamp-2 text-white/80", isHero ? "text-sm sm:text-base" : "text-sm")}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    "group relative isolate block h-full min-h-[240px] overflow-hidden rounded-2xl bg-black shadow-[0_24px_74px_-46px_rgba(0,0,0,0.86)] transition-shadow duration-300 [backface-visibility:hidden] hover:shadow-[0_28px_82px_-48px_rgba(0,0,0,0.95)]",
    isHero ? "lg:col-span-2 lg:row-span-2" : "",
    classNameProp
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export default SignatureCard;
