"use client";

import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Flag, MapPin } from "lucide-react";

import type { GolfListing } from "@/lib/golf";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { getPrimaryBestForKey, type GolfBestForKey } from "@/lib/golf/experienceTags";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { buttonVariants } from "@/components/ui/Button";

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
    <article
      className={cn(
        "group relative flex h-full min-h-[520px] w-full min-w-0 flex-col overflow-hidden rounded-[18px] border-[1.5px] border-green-500/55 bg-white p-2 text-slate-950 shadow-[0_24px_55px_-34px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:border-green-600/80 hover:shadow-[0_30px_70px_-38px_rgba(22,163,74,0.42)] focus-within:ring-2 focus-within:ring-green-600 focus-within:ring-offset-2 dark:border-green-500/35 dark:bg-card dark:text-foreground",
        featured && "md:min-h-[560px]",
        className,
      )}
    >
      <Link
        href={courseHref}
        prefetch={false}
        aria-label={`${labels.viewCourse}: ${course.name}`}
        className="absolute inset-0 z-10 rounded-[18px] focus-visible:outline-none"
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className={cn("relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-slate-200", featured && "md:aspect-[16/8.5]")}>
          {course.featuredImageUrl ? (
            <Image
              src={course.featuredImageUrl}
              alt={course.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          {tierBadge ? (
            <span
              className={cn(
                "absolute bottom-3 left-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase leading-none tracking-[0.12em] shadow-[0_12px_24px_-16px_rgba(15,23,42,0.9)] backdrop-blur",
                course.tier === "signature"
                  ? "border border-amber-200/70 bg-amber-400 text-slate-950"
                  : "border border-emerald-200/70 bg-emerald-500 text-white",
              )}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              {tierBadge}
            </span>
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
          <div className="pointer-events-auto absolute bottom-3 right-3 z-10">
            <FavoriteButton
              isFavorite={favoriteActive}
              onToggle={() => toggleFavorite(course.id)}
              size="lg"
              variant="solid"
              className="border-white bg-white text-slate-900 shadow-[0_12px_24px_-14px_rgba(15,23,42,0.9)] hover:border-red-200 hover:bg-white [&_svg]:text-slate-700 [&_svg]:hover:text-red-500"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-3 px-1.5 pb-2 pt-4">
          <h3 className="line-clamp-2 min-h-[3.3rem] font-fira text-2xl font-bold leading-[1.1] tracking-normal text-slate-950 dark:text-foreground">
            {course.name}
          </h3>

          <div className="space-y-2 text-[0.82rem] font-medium leading-relaxed text-slate-700 dark:text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-950 dark:text-primary" aria-hidden="true" />
              <span className="line-clamp-2">
                {course.city?.name ?? labels.locationFallback}
                {course.region?.name ? `, ${course.region.name}` : ""}
              </span>
            </div>
            {metaItems.length > 0 ? (
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 shrink-0 text-slate-950 dark:text-primary" aria-hidden="true" />
                <span className="line-clamp-1">{metaItems.join(" • ")}</span>
              </div>
            ) : null}
          </div>

          {bestForKey ? (
            <p className="break-words rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase leading-snug tracking-[0.14em] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200">
              {labels.bestFor}: {labels.bestForLabels[bestForKey]}
            </p>
          ) : null}

          <div
            className={cn(
              "grid min-h-[5.5rem] flex-1 gap-3 pt-2",
              metricGridClass,
            )}
          >
            {metrics.length > 0 ? (
              metrics.map((metric) => (
                <div key={metric.label} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/85 p-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-white/5">
                  <p className="break-words text-xs font-semibold uppercase leading-tight tracking-[0.08em] text-slate-500 dark:text-muted-foreground sm:text-[0.8rem] sm:tracking-wide">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-[1.05rem] font-bold text-slate-950 dark:text-foreground sm:text-[1.2rem]">{metric.value}</p>
                </div>
              ))
            ) : (
              <div aria-hidden="true" />
            )}
          </div>

          <div className={cn("mt-auto grid gap-2 pt-3", hasScorecard ? "grid-cols-2" : "grid-cols-1")}>
            <Link
              href={courseHref}
              prefetch={false}
              aria-label={`${labels.viewCourse}: ${course.name}`}
              className={buttonVariants({
                variant: "ghost",
                className:
                  "pointer-events-auto relative z-20 inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-100 px-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 dark:bg-muted dark:text-foreground dark:hover:bg-muted/80",
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
                  variant: "ghost",
                  className:
                    "pointer-events-auto relative z-20 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md border border-green-500 bg-green-600 px-3 text-center text-sm font-bold uppercase text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
                })}
              >
                <ClipboardList aria-hidden="true" className="h-4 w-4 text-white" />
                {labels.scorecard}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
