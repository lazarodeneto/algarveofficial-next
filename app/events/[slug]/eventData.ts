import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import type { Locale } from "@/lib/i18n/config";
import { buildUniformLocalizedSlugMap } from "@/lib/i18n/localized-routing";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type EventSeoRecord = Pick<
  Tables<"events">,
  | "slug"
  | "id"
  | "title"
  | "short_description"
  | "location"
  | "venue"
  | "meta_title"
  | "meta_description"
  | "image"
  | "start_date"
  | "end_date"
  | "ticket_url"
  | "created_at"
  | "updated_at"
> & {
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
    .select("id, slug, title, short_description, location, venue, meta_title, meta_description, image, start_date, end_date, ticket_url, created_at, updated_at, status")
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
    ...(data as Omit<EventSeoRecord, "localizedSlugs">),
    localizedSlugs: buildUniformLocalizedSlugMap(data.slug),
  } as EventSeoRecord;
});
