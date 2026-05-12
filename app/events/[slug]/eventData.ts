import { cache } from "react";

import type { CalendarEvent } from "@/types/events";
import type { Locale } from "@/lib/i18n/config";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { getPublicEventBySlug } from "@/lib/public-data/events";

export type EventSeoRecord = CalendarEvent & {
  localizedSlugs: Record<Locale, string>;
};

export const getPublishedEventBySlug = cache(async (slug: string, locale?: string): Promise<EventSeoRecord | null> => {
  const event = await getPublicEventBySlug(slug, locale);
  if (!event) return null;
  return {
    ...(event as CalendarEvent),
    localizedSlugs: buildUniformLocalizedSlugMap(event.slug),
  };
});
