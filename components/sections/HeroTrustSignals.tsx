import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Crown, Quote, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { useCuratedAssignments } from "@/hooks/useCuratedAssignments";
import { useCuratedListings, usePublishedListingsCount } from "@/hooks/useListings";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TrustReview {
  id: string;
  listing_id: string;
  rating: number;
  comment: string;
  authorName: string | null;
  listingName: string;
}

function formatCompactCount(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function trimVenueName(name: string): string {
  const simplified = name
    .replace(/\s*[-|/].*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return simplified.length > 26 ? `${simplified.slice(0, 23).trimEnd()}...` : simplified;
}

function trimReviewComment(comment: string): string {
  const normalized = comment.replace(/\s+/g, " ").trim();
  if (normalized.length <= 165) return normalized;
  return `${normalized.slice(0, 162).trimEnd()}...`;
}

interface HeroTrustSignalsProps {
  variant?: "overlay" | "surface";
  className?: string;
}

export function HeroTrustSignals({
  variant = "overlay",
  className,
}: HeroTrustSignalsProps) {
  const { t } = useTranslation();
  const { data: curatedListings = [] } = useCuratedAssignments("homepage", null, 4);
  const { data: broaderCuratedListings = [] } = useCuratedListings();
  const { data: totalListings = 0 } = usePublishedListingsCount();
  const { data: signatureListings = 0 } = usePublishedListingsCount({ tier: "signature" });

  const listingIdToName = useMemo(
    () =>
      new Map(
        curatedListings.map((listing) => [listing.id, listing.name]),
      ),
    [curatedListings],
  );
  const curatedListingIds = useMemo(() => curatedListings.map((listing) => listing.id), [curatedListings]);

  const { data: featuredReview } = useQuery({
    queryKey: ["hero-trust-review", curatedListingIds],
    enabled: curatedListingIds.length > 0,
    queryFn: async (): Promise<TrustReview | null> => {
      const { data, error } = await supabase
        .from("listing_reviews")
        .select("id, listing_id, rating, comment, user_id, approved_at, created_at")
        .in("listing_id", curatedListingIds)
        .eq("status", "approved")
        .not("comment", "is", null)
        .order("approved_at", { ascending: false })
        .limit(8);

      if (error) throw error;

      const reviews = (data || []).filter(
        (review): review is {
          id: string;
          listing_id: string;
          rating: number;
          comment: string;
          user_id: string;
          approved_at: string;
          created_at: string;
        } => Boolean(review.comment?.trim()),
      );

      if (reviews.length === 0) return null;

      const userIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));
      let profileMap = new Map<string, string | null>();

      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("public_profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profileError) throw profileError;

        profileMap = new Map(
          (profileRows || []).map((profile) => [profile.id as string, profile.full_name ?? null]),
        );
      }

      const preferred =
        reviews.find((review) => review.comment.trim().length >= 70) ??
        reviews[0];

      return {
        id: preferred.id,
        listing_id: preferred.listing_id,
        rating: preferred.rating,
        comment: preferred.comment.trim(),
        authorName: profileMap.get(preferred.user_id) ?? null,
        listingName: listingIdToName.get(preferred.listing_id) || t("hero.trust.defaultVenue", "AlgarveOfficial selection"),
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const aggregateGoogleSignals = useMemo(() => {
    const ratedListings = curatedListings.filter(
      (listing) => typeof listing.google_rating === "number" && Number.isFinite(listing.google_rating),
    );

    if (ratedListings.length === 0) {
      return null;
    }

    const totalReviews = ratedListings.reduce(
      (sum, listing) => sum + Math.max(0, listing.google_review_count || 0),
      0,
    );

    const weightedRating =
      totalReviews > 0
        ? ratedListings.reduce(
            (sum, listing) => sum + (listing.google_rating || 0) * Math.max(0, listing.google_review_count || 0),
            0,
          ) / totalReviews
        : ratedListings.reduce((sum, listing) => sum + (listing.google_rating || 0), 0) / ratedListings.length;

    return {
      rating: Number(weightedRating.toFixed(1)),
      reviewCount: totalReviews > 0 ? totalReviews : null,
    };
  }, [curatedListings]);

  const venueWordmarks = useMemo(() => {
    const names = [
      ...curatedListings.map((listing) => trimVenueName(listing.name)),
      ...broaderCuratedListings.map((listing) => trimVenueName(listing.name)),
    ];

    return Array.from(new Set(names.filter(Boolean))).slice(0, 4);
  }, [broaderCuratedListings, curatedListings]);

  const displayedVenueWordmarks = venueWordmarks.length > 0
    ? venueWordmarks
    : [
        t("hero.trust.fallbackWordmarkStay", "Premium stays"),
        t("hero.trust.fallbackWordmarkDining", "Fine dining"),
        t("hero.trust.fallbackWordmarkGolf", "Golf"),
        t("hero.trust.fallbackWordmarkLiving", "Lifestyle"),
      ];

  const trustMetrics = useMemo(
    () => [
      {
        key: "coverage",
        icon: ShieldCheck,
        value: totalListings > 0 ? formatCompactCount(totalListings) : "1K+",
        label: t("hero.trust.coverageLabel", "selected listings"),
      },
      {
        key: "signature",
        icon: Crown,
        value:
          signatureListings > 0
            ? formatCompactCount(signatureListings)
            : curatedListings.length > 0
              ? formatCompactCount(curatedListings.length)
              : t("hero.trust.signatureFallbackValue", "selected"),
        label: t("hero.trust.signatureLabel", "signature venues"),
      },
      {
        key: "partners",
        icon: Building2,
        value: venueWordmarks.length > 0 ? String(venueWordmarks.length) : "4",
        label: t("hero.trust.partnersLabel", "featured partners"),
      },
    ],
    [curatedListings.length, signatureListings, t, totalListings, venueWordmarks.length],
  );

  const isSurface = variant === "surface";

  return (
    <div
      className={cn(
        "grid gap-3 text-left lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-[2rem] p-4 sm:p-5",
          isSurface
            ? "border border-border/70 bg-card/70 shadow-[0_18px_55px_-38px_rgba(11,31,58,0.18)]"
            : "border border-white/16 bg-white/10 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.6)] backdrop-blur-xl",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px]",
                isSurface ? "text-primary" : "text-[var(--colour-card-outline-gold)]",
              )}
            >
              {t("hero.trust.eyebrow", "Trust Proof")}
            </p>
            <h2
              className={cn(
                "mt-2 font-serif text-[1.45rem] leading-tight sm:text-[1.9rem]",
                isSurface ? "text-foreground" : "text-white",
              )}
            >
              {t("hero.trust.title", "Proof that the shortlist is worth your time")}
            </h2>
            <p
              className={cn(
                "mt-2 max-w-2xl text-sm leading-7 sm:text-[0.98rem]",
                isSurface ? "text-muted-foreground" : "text-white/75",
              )}
            >
              {t(
                "hero.trust.subtitle",
                "Visible social proof from real listings, real review volume, and curated venue names right at the point of first impression.",
              )}
            </p>
          </div>
          {aggregateGoogleSignals ? (
            <GoogleRatingBadge
              rating={aggregateGoogleSignals.rating}
              reviewCount={aggregateGoogleSignals.reviewCount ?? undefined}
              variant={isSurface ? "themed" : "overlay"}
              className={cn(
                "self-start px-3 py-2",
                isSurface ? "border border-border/70" : "border border-white/12",
              )}
            />
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {trustMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.key}
                className={cn(
                  "rounded-[1.35rem] px-4 py-3",
                  isSurface
                    ? "border border-border/70 bg-background/70"
                    : "border border-white/12 bg-black/18",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isSurface ? "text-primary" : "text-[var(--colour-card-outline-gold)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.22em]",
                      isSurface ? "text-muted-foreground" : "text-white/60",
                    )}
                  >
                    {metric.label}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-2 text-[1.7rem] font-semibold leading-none sm:text-[1.95rem]",
                    isSurface ? "text-foreground" : "text-white",
                  )}
                >
                  {metric.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {displayedVenueWordmarks.map((name) => (
            <span
              key={name}
              className={cn(
                "rounded-full px-3 py-2 text-[0.76rem] font-medium tracking-[0.06em]",
                isSurface
                  ? "border border-primary/15 bg-primary/5 text-foreground"
                  : "border border-white/12 bg-white/8 text-white/90",
              )}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <aside
        className={cn(
          "rounded-[2rem] p-4 sm:p-5",
          isSurface
            ? "border border-border/70 bg-card/70 shadow-[0_18px_55px_-38px_rgba(11,31,58,0.18)]"
            : "border border-white/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] shadow-[0_24px_80px_-44px_rgba(0,0,0,0.6)] backdrop-blur-xl",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            isSurface ? "text-primary" : "text-[var(--colour-card-outline-gold)]",
          )}
        >
          <Quote className="h-4 w-4" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px]">
            {t("hero.trust.reviewEyebrow", "Visitor Review")}
          </p>
        </div>
        {featuredReview ? (
          <>
            <blockquote
              className={cn(
                "mt-4 font-serif text-[1.22rem] leading-[1.5] sm:text-[1.45rem]",
                isSurface ? "text-foreground" : "text-white",
              )}
            >
              "{trimReviewComment(featuredReview.comment)}"
            </blockquote>
            <div className="mt-5 flex items-center gap-2">
              <GoogleRatingBadge
                rating={featuredReview.rating}
                variant={isSurface ? "themed" : "overlay"}
                size="sm"
              />
              <span
                className={cn(
                  "text-xs uppercase tracking-[0.14em]",
                  isSurface ? "text-muted-foreground" : "text-white/60",
                )}
              >
                {t("hero.trust.approvedReview", "Approved review")}
              </span>
            </div>
            <p className={cn("mt-4 text-sm font-semibold", isSurface ? "text-foreground" : "text-white")}>
              {featuredReview.authorName || t("hero.trust.anonymousVisitor", "Verified visitor")}
            </p>
            <p className={cn("mt-1 text-sm", isSurface ? "text-muted-foreground" : "text-white/65")}>
              {featuredReview.listingName}
            </p>
          </>
        ) : (
          <>
            <blockquote
              className={cn(
                "mt-4 font-serif text-[1.22rem] leading-[1.5] sm:text-[1.45rem]",
                isSurface ? "text-foreground" : "text-white",
              )}
            >
              {t(
                "hero.trust.fallbackQuote",
                "A sharper first impression comes from visible proof: real ratings, real venues, and a selection that already feels trusted before the first click.",
              )}
            </blockquote>
            <p className={cn("mt-4 text-sm", isSurface ? "text-muted-foreground" : "text-white/65")}>
              {t("hero.trust.fallbackSource", "Curated across signature stays, dining, golf, and lifestyle partners")}
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
