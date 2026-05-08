"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import type { GolfListing } from "@/lib/golf";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { getPrimaryBestForKey, type GolfBestForKey } from "@/lib/golf/experienceTags";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export interface CourseCardLabels {
  holes: string;
  par: string;
  slope: string;
  bestFor: string;
  editorsSelection: string;
  verified: string;
  viewCourse: string;
  scorecard: string;
  locationFallback: string;
  bestForLabels: Record<GolfBestForKey, string>;
}

interface CourseCardProps {
  course: GolfListing;
  locale: string;
  labels: CourseCardLabels;
  featured?: boolean;
  className?: string;
}

export function CourseCard({ course, locale, labels, featured = false, className }: CourseCardProps) {
  const { isFavorite, toggleFavorite } = useFavoriteListings();
  const courseHref = buildLocalizedPath(locale, `/golf/courses/${course.slug}`);
  const scorecardHref = `${courseHref}#scorecard`;
  const hasScorecard = course.scorecardHoles.length > 0;
  const favoriteActive = isFavorite(course.id);
  const metrics = [
    { label: labels.holes, value: course.details?.holes },
    { label: labels.par, value: course.details?.par },
    { label: labels.slope, value: course.details?.slopeRating },
  ].filter((metric) => metric.value !== null && metric.value !== undefined);
  const metricGridClass =
    metrics.length <= 1 ? "grid-cols-1" : metrics.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
  const bestForKey = getPrimaryBestForKey(course);
  const metaItems = [
    course.details?.holes ? `${course.details.holes} ${labels.holes}` : null,
    course.details?.par ? `${labels.par} ${course.details.par}` : null,
  ].filter((item): item is string => Boolean(item));
  const tierBadge =
    course.tier === "signature"
      ? labels.editorsSelection
      : course.tier === "verified"
        ? labels.verified
        : null;
  const hasGoogleRating =
    typeof course.googleRating === "number" &&
    Number.isFinite(course.googleRating) &&
    course.googleRating > 0;

  return (
    <Card
      className={cn(
        "group flex h-full min-h-[360px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border-border/70 shadow-sm transition-transform duration-200 hover:scale-[1.03]",
        featured && "md:min-h-[420px]",
        className,
      )}
    >
      <div className={cn("relative h-48 w-full overflow-hidden bg-muted", featured && "md:h-60")}>
        {course.featuredImageUrl ? (
          <img
            src={course.featuredImageUrl}
            alt={course.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {tierBadge ? (
          <Badge
            variant={course.tier === "signature" ? "gold" : "secondary"}
            className="absolute left-4 top-4 border-white/20 uppercase tracking-[0.16em]"
          >
            {tierBadge}
          </Badge>
        ) : null}
        {hasGoogleRating ? (
          <GoogleRatingBadge
            rating={course.googleRating!}
            reviewCount={course.googleReviewCount}
            variant="overlay"
            size="sm"
            className="absolute right-4 top-4"
          />
        ) : null}
        <div className="absolute bottom-3 right-3 z-10">
          <FavoriteButton
            isFavorite={favoriteActive}
            onToggle={() => toggleFavorite(course.id)}
            size="sm"
            variant="glassmorphism"
          />
        </div>
      </div>

      <CardHeader className="min-h-[10.75rem] p-5 sm:min-h-[11.25rem] sm:p-6">
        <CardTitle className="line-clamp-2 text-[1.35rem] leading-tight sm:text-[1.5rem]">{course.name}</CardTitle>
        <CardDescription className="line-clamp-2 break-words">
          {course.city?.name ?? labels.locationFallback}
          {course.region?.name ? `, ${course.region.name}` : ""}
        </CardDescription>
        {metaItems.length > 0 ? (
          <p className="text-sm font-medium leading-6 text-foreground/75">{metaItems.join(" • ")}</p>
        ) : null}
        {bestForKey ? (
          <p className="break-words text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-primary sm:text-xs sm:tracking-[0.16em]">
            {labels.bestFor}: {labels.bestForLabels[bestForKey]}
          </p>
        ) : null}
      </CardHeader>

      <CardContent
        className={cn(
          "grid min-h-[7rem] flex-1 gap-3 px-5 pb-5 pt-0 sm:min-h-[7.5rem] sm:px-6 sm:pb-6",
          metricGridClass,
        )}
      >
        {metrics.length > 0 ? (
          metrics.map((metric) => (
            <div key={metric.label} className="min-w-0 rounded-xl border bg-muted/30 p-3 sm:p-4">
              <p className="break-words text-xs uppercase leading-tight tracking-[0.08em] text-muted-foreground sm:text-[0.9rem] sm:tracking-wide">
                {metric.label}
              </p>
              <p className="mt-1 text-[1.05rem] font-semibold sm:text-[1.2rem]">{metric.value}</p>
            </div>
          ))
        ) : (
          <div aria-hidden="true" />
        )}
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <Link
          href={courseHref}
          prefetch={false}
          aria-label={`${labels.viewCourse}: ${course.name}`}
          className={buttonVariants({
            variant: "outline",
            className: "min-h-12 w-full whitespace-normal text-center text-[1.05rem] leading-tight",
          })}
        >
          {labels.viewCourse}
        </Link>
        {hasScorecard ? (
          <Link
            href={scorecardHref}
            prefetch={false}
            aria-label={`${labels.scorecard}: ${course.name}`}
            className={buttonVariants({
              variant: "secondary",
              className:
                "min-h-12 w-full whitespace-normal border-0 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 text-center text-[1.05rem] uppercase leading-tight text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.45)]",
            })}
          >
            <ClipboardList aria-hidden="true" className="h-4 w-4 text-white" />
            {labels.scorecard}
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  );
}
