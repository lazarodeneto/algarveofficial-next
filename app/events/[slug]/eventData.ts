import { cache } from "react";

import type { CalendarEvent } from "@/types/events";
import type { Locale } from "@/lib/i18n/config";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { getPublicEventCutoffDate } from "@/lib/events/publicVisibility";
import { localizeEvent } from "@/lib/events/i18n";

export type EventSeoRecord = CalendarEvent & {
  localizedSlugs: Record<Locale, string>;
};

export const getPublishedEventBySlug = cache(async (slug: string, locale?: string): Promise<EventSeoRecord | null> => {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .gte("end_date", getPublicEventCutoffDate())
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return localizeEvent({
    ...(data as CalendarEvent),
    localizedSlugs: buildUniformLocalizedSlugMap(data.slug),
  }, locale);
});
