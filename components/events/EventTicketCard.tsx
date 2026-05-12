"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Sparkles, Ticket, UsersRound } from "lucide-react";
import type { TFunction } from "i18next";

import { FavoriteButton } from "@/components/ui/favorite-button";
import { EventDateBadge } from "@/components/events/EventDateBadge";
import type { CalendarEvent, EventCategory } from "@/types/events";
import { cn } from "@/lib/utils";
import {
  getEventCompactDateRangeLabel,
  getEventDateBadgeParts,
} from "@/lib/events/dateDisplay";
import {
  getEventCardCategoryClass,
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
  const buyTicketsLabel = t("events.card.buyTickets", "Buy Tickets");
  const viewDetailsLabel = t("events.card.viewDetails", "View Details");
  const goingLabel = t("events.card.going", "+1K Going");
  const accessibleTitle = t("events.openEvent", { title: event.title, defaultValue: `Open ${event.title}` });

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[18px] border-[1.5px] border-green-500/55 bg-white p-2 text-slate-950 shadow-[0_24px_55px_-34px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:border-green-600/80 hover:shadow-[0_30px_70px_-38px_rgba(22,163,74,0.42)] dark:border-green-500/35 dark:bg-card dark:text-foreground",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={accessibleTitle}
        className="absolute inset-0 z-10 rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      />

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

        <EventDateBadge
          primary={dateBadge.primary}
          secondary={dateBadge.secondary}
        />

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
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/55 bg-white/92 text-slate-950 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.85)] backdrop-blur"
            aria-hidden="true"
          >
            <UsersRound className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-[0.7rem] font-extrabold text-white backdrop-blur">
            {goingLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 px-1.5 pb-2 pt-3">
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

        <h3 className="line-clamp-2 min-h-[3.3rem] font-fira text-2xl font-bold leading-[1.1] tracking-normal text-slate-950 dark:text-foreground">
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

        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          {event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-green-500 bg-green-600 px-3 text-center text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              {buyTicketsLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-green-300 bg-green-100 px-3 text-center text-sm font-bold text-green-700/70 dark:border-green-500/25 dark:bg-green-500/15 dark:text-green-200/70"
            >
              {buyTicketsLabel}
            </span>
          )}

          <Link
            href={href}
            aria-label={accessibleTitle}
            className="relative z-20 inline-flex h-11 items-center justify-center rounded-md bg-slate-100 px-3 text-center text-sm font-bold text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 dark:bg-muted dark:text-foreground dark:hover:bg-muted/80"
          >
            {viewDetailsLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
