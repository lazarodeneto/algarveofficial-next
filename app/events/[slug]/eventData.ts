import { cache } from "react";

import type { CalendarEvent } from "@/types/events";
import type { Locale } from "@/lib/i18n/config";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type EventSeoRecord = CalendarEvent & {
  localizedSlugs: Record<Locale, string>;
};

export const getPublishedEventBySlug = cache(async (slug: string): Promise<EventSeoRecord | null> => {
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
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as CalendarEvent),
    localizedSlugs: buildUniformLocalizedSlugMap(data.slug),
  };
});
