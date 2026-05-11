"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Sparkles, Ticket } from "lucide-react";
import type { TFunction } from "i18next";

import { FavoriteButton } from "@/components/ui/favorite-button";
import type { CalendarEvent, EventCategory } from "@/types/events";
import { cn } from "@/lib/utils";
import {
  getEventCompactDateRangeLabel,
  getEventDateBadgeParts,
} from "@/lib/events/dateDisplay";
import {
  getEventCardCategoryClass,
  getEventDateBadgeDisplay,
  PIXABAY_EVENT_IMAGE_FALLBACK,
} from "@/lib/events/cardStyles";
import { getLocalizedEventPriceRange } from "@/lib/events/display";

interface EventTicketCardProps {
  event: CalendarEvent;
  locale: string;
  href: string;
  categoryLabel: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  t: TFunction;
  featuredLabel?: string;
  showFeaturedBadge?: boolean;
  imageFallback?: string;
  className?: string;
}

const ATTENDEE_STYLES = [
  "bg-[linear-gradient(135deg,#fca5a5,#f97316)]",
  "bg-[linear-gradient(135deg,#93c5fd,#2563eb)]",
  "bg-[linear-gradient(135deg,#fde68a,#ca8a04)]",
  "bg-[linear-gradient(135deg,#c4b5fd,#7c3aed)]",
];

function getEventImage(event: CalendarEvent, imageFallback?: string) {
  return event.image?.trim() || imageFallback || PIXABAY_EVENT_IMAGE_FALLBACK;
}

function formatEventTime(event: CalendarEvent) {
  const normalize = (value: string | null) => value?.slice(0, 5) ?? null;
  const start = normalize(event.start_time);
  const end = normalize(event.end_time);

  if (!start) return null;
  return end ? `${start} - ${end}` : start;
}

export function EventTicketCard({
  event,
  locale,
  href,
  categoryLabel,
  isFavorite,
  onToggleFavorite,
  t,
  featuredLabel,
  showFeaturedBadge = false,
  imageFallback,
  className,
}: EventTicketCardProps) {
  const dateBadge = getEventDateBadgeParts(event, locale);
  const dateRangeLabel = getEventCompactDateRangeLabel(event, locale);
  const timeLabel = formatEventTime(event);
  const dateTimeLabel = timeLabel ? `${dateRangeLabel} · ${timeLabel}` : dateRangeLabel;
  const priceRangeLabel = getLocalizedEventPriceRange(event.price_range, t);
  const locationLabel = event.venue || event.location;
  const imageSrc = getEventImage(event, imageFallback);
  const buyTicketsLabel = t("events.card.buyTickets");
  const viewDetailsLabel = t("events.card.viewDetails");
  const goingLabel = t("events.card.going");
  const accessibleTitle = t("events.openEvent", { title: event.title });

  return (
    <article
      className={cn(
        "group h-full overflow-hidden rounded-[18px] border border-slate-200 bg-white p-2 text-slate-950 shadow-[0_24px_55px_-34px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_30px_70px_-38px_rgba(37,99,235,0.42)] dark:border-white/10 dark:bg-card dark:text-foreground",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] bg-slate-200">
        <Image
          src={imageSrc}
          alt={event.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        <div className="absolute left-3 top-3 min-w-14 rounded-xl bg-white px-2.5 py-2 text-center shadow-[0_14px_24px_-18px_rgba(15,23,42,0.8)]">
          <span className="block whitespace-pre-line text-[1.35rem] font-black leading-[0.95] tracking-tight text-slate-950">
            {getEventDateBadgeDisplay(dateBadge.primary)}
          </span>
          <span className="mt-1 block text-[0.63rem] font-extrabold uppercase text-red-600">
            {dateBadge.secondary}
          </span>
        </div>

        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onToggleFavorite}
            size="lg"
            variant="solid"
            className="border-white bg-white text-slate-900 shadow-[0_12px_24px_-14px_rgba(15,23,42,0.9)] hover:border-red-200 hover:bg-white [&_svg]:text-slate-700 [&_svg]:hover:text-red-500"
          />
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex -space-x-2" aria-hidden="true">
            {ATTENDEE_STYLES.map((style, index) => (
              <span
                key={style}
                className={cn(
                  "h-7 w-7 rounded-full border-2 border-white shadow-sm",
                  style,
                  index === 0 && "ring-1 ring-white/50",
                )}
              />
            ))}
          </div>
          <span className="rounded-full bg-black/45 px-2 py-1 text-[0.7rem] font-extrabold text-white backdrop-blur">
            {goingLabel}
          </span>
        </div>
      </div>

      <div className="space-y-3 px-1.5 pb-2 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={getEventCardCategoryClass(event.category as EventCategory)}>
            {categoryLabel}
          </span>
          {showFeaturedBadge ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[0.68rem] font-bold leading-none text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
              <Sparkles className="h-3 w-3" />
              {featuredLabel}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-extrabold leading-tight text-slate-950 dark:text-foreground">
          {event.title}
        </h3>

        <div className="space-y-2 text-[0.78rem] font-medium leading-relaxed text-slate-700 dark:text-muted-foreground">
          {locationLabel ? (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-950 dark:text-primary" />
              <span className="line-clamp-2">{locationLabel}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-950 dark:text-primary" />
            <span className="line-clamp-1">{dateTimeLabel}</span>
          </div>
          {priceRangeLabel ? (
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 shrink-0 text-slate-950 dark:text-primary" />
              <span className="line-clamp-1">{priceRangeLabel}</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-center text-sm font-bold text-white shadow-[0_12px_22px_-18px_rgba(37,99,235,0.95)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {buyTicketsLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md bg-blue-200 px-3 text-center text-sm font-bold text-blue-700/70 dark:bg-blue-500/20 dark:text-blue-200/70"
            >
              {buyTicketsLabel}
            </span>
          )}

          <Link
            href={href}
            aria-label={accessibleTitle}
            className="inline-flex h-11 items-center justify-center rounded-md bg-slate-100 px-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-muted dark:text-foreground dark:hover:bg-muted/80"
          >
            {viewDetailsLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
