import Image from "next/image";
import { LocalizedLink } from "@/components/navigation/LocalizedLink";
import type { ProgrammaticListing } from "@/lib/seo/programmatic/category-city-data";

interface ListingCardProps {
  listing: ProgrammaticListing;
  tx: Record<string, string>;
}

/**
 * Shared listing card for programmatic city+category pages.
 * Used by both `app/[city]/[category]/page.tsx` (English) and
 * `app/[locale]/[city]/[category]/page.tsx` (localized variants).
 *
 * Badge strings are driven by the `tx` prop so they render in the
 * correct locale without any hardcoded English fallbacks leaking.
 */
export function ListingCard({ listing, tx }: ListingCardProps) {
  const tierBadge =
    listing.tier === "signature"
      ? (tx["common.signature"] ?? "Signature")
      : listing.tier === "verified"
        ? (tx["common.verified"] ?? "Verified")
        : null;

  return (
    <LocalizedLink
      href={`/listing/${listing.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.featured_image_url ? (
          <Image
            src={listing.featured_image_url}
            alt={listing.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        {tierBadge && (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {tierBadge}
          </span>
        )}
        {listing.is_curated && (
          <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {tx["common.curated"] ?? "Curated"}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {listing.name}
        </h3>
        {listing.short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {listing.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {listing.google_rating !== null ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-amber-500">★</span>
              {listing.google_rating.toFixed(1)}
              {listing.google_review_count && (
                <span className="opacity-60">({listing.google_review_count})</span>
              )}
            </span>
          ) : (
            <span />
          )}
          {listing.price_from && (
            <span className="text-xs text-muted-foreground">
              From {listing.price_currency ?? "€"}{listing.price_from}
            </span>
          )}
        </div>
      </div>
    </LocalizedLink>
  );
}
