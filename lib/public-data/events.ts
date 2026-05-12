import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import {
  getPublicEventCutoffDate,
  hasPublicEventRealDateRange,
  isPublicEventPast,
  isPublicEventVisibleByDate,
  toPublicEventDateKey,
} from "@/lib/events/publicVisibility";
import { getEventCompactDateRangeLabel } from "@/lib/events/dateDisplay";
import { localizeEvent, localizeEvents } from "@/lib/events/i18n";
import type { CalendarEvent, EventCategory } from "@/types/events";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type PublicEventDTO = CalendarEvent & {
  dateRangeLabel: string;
  venueLabel: string | null;
  imageUrl: string | null;
  hasImage: boolean;
};

export type PublicEventsOptions = {
  locale?: string;
  category?: EventCategory | "all";
  timeFilter?: "upcoming" | "past" | "all";
  limit?: number;
};

export type PublicEventGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanNullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function applyEventTimeFilter<T extends { gte: (column: string, value: string) => T; lt: (column: string, value: string) => T }>(
  query: T,
  timeFilter: "upcoming" | "past" | "all",
): T {
  const today = getPublicEventCutoffDate();
  if (timeFilter === "past") return query.lt("end_date", today);
  if (timeFilter === "all") return query;
  return query.gte("end_date", today);
}

export function normalizePublicEvent(event: CalendarEvent, locale?: string): PublicEventDTO | null {
  if (!hasPublicEventRealDateRange(event)) return null;

  const startDate = toPublicEventDateKey(event.start_date);
  const endDate = toPublicEventDateKey(event.end_date);
  if (!startDate || !endDate) return null;

  const imageUrl = cleanNullableText(event.image);
  const venue = cleanNullableText(event.venue);
  const location = cleanNullableText(event.location);
  const eventData = isRecord(event.event_data) ? event.event_data : {};

  return {
    ...event,
    start_date: startDate,
    end_date: endDate,
    image: imageUrl,
    imageUrl,
    hasImage: Boolean(imageUrl),
    venue,
    location,
    venueLabel: venue ?? location,
    tags: event.tags ?? [],
    related_listing_ids: event.related_listing_ids ?? [],
    event_data: eventData,
    dateRangeLabel: getEventCompactDateRangeLabel(
      {
        ...event,
        start_date: startDate,
        end_date: endDate,
        event_data: eventData,
      },
      locale,
    ),
  };
}

function normalizeAndFilterPublicEvents(
  events: CalendarEvent[],
  locale: string | undefined,
  timeFilter: "upcoming" | "past" | "all",
): PublicEventDTO[] {
  const localizedEvents = localizeEvents(events, locale);
  return localizedEvents
    .map((event) => normalizePublicEvent(event, locale))
    .filter((event): event is PublicEventDTO => {
      if (!event) return false;
      if (timeFilter === "past") return isPublicEventPast(event);
      if (timeFilter === "all") return true;
      return isPublicEventVisibleByDate(event);
    });
}

export const getPublicEvents = cache(
  async ({
    locale,
    category = "all",
    timeFilter = "upcoming",
    limit = 100,
  }: PublicEventsOptions = {}): Promise<PublicEventDTO[]> => {
    const supabase = createPublicServerClient();
    let query = supabase
      .from("events")
      .select("*, city:cities(id, name, slug)")
      .eq("status", "published")
      .order("start_date", { ascending: timeFilter !== "past" })
      .limit(Math.min(Math.max(limit, 1), 500));

    query = applyEventTimeFilter(query, timeFilter);

    if (category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return normalizeAndFilterPublicEvents((data ?? []) as CalendarEvent[], locale, timeFilter);
  },
);

export const getPublicEventBySlug = cache(
  async (slug: string, locale?: string): Promise<PublicEventDTO | null> => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return null;

    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, city:cities(id, name, slug)")
      .eq("slug", normalizedSlug)
      .eq("status", "published")
      .gte("end_date", getPublicEventCutoffDate())
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return normalizePublicEvent(localizeEvent(data as CalendarEvent, locale), locale);
  },
);

export const getPublicEventGlobalSettings = cache(
  async (keys: readonly string[]): Promise<PublicEventGlobalSetting[]> => {
    if (keys.length === 0) return [];
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("global_settings")
      .select("key, value, category")
      .in("key", [...keys])
      .order("key", { ascending: true });

    if (error) throw error;
    return (data ?? []) as PublicEventGlobalSetting[];
  },
);
