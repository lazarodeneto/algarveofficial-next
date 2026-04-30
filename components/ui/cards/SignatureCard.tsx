"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
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
          className="object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" aria-hidden="true" />
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/95 via-black/76 via-[48%] to-transparent"
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-black/28" />

      <div className="absolute left-5 right-16 top-5 z-10 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
        <TierBadge tier={tier} />
        {category ? (
          <span className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.18em] text-white/82">
            {category}
          </span>
        ) : null}
      </div>

      {onToggleFavorite ? (
        <button
          type="button"
          aria-label={isFavorite ? "Remove from saved" : "Save listing"}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/18 p-2 text-white backdrop-blur transition duration-300 ease-out hover:bg-white/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-white")} />
        </button>
      ) : null}

      <div className={cn("absolute bottom-0 left-0 right-0 z-10 text-white", isHero ? "p-6 sm:p-8" : "p-5 sm:p-6")}>
        <h3
          className={cn(
            "line-clamp-2 font-sans font-bold not-italic leading-tight tracking-normal",
            "text-lg sm:text-xl"
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className={cn("mt-3 line-clamp-2 text-white/90", isHero ? "text-sm sm:text-base" : "text-sm")}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    "group relative isolate block h-full min-h-[220px] overflow-hidden rounded-2xl bg-black shadow-card transition-all duration-300 ease-out [backface-visibility:hidden] hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
