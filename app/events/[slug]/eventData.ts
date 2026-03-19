import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import { createClient } from "@/lib/supabase/server";

export type EventSeoRecord = Pick<
  Tables<"events">,
  "slug" | "title" | "short_description" | "meta_title" | "meta_description" | "start_date" | "created_at" | "updated_at"
>;

export const getPublishedEventBySlug = cache(async (slug: string): Promise<EventSeoRecord | null> => {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug, title, short_description, meta_title, meta_description, start_date, created_at, updated_at, status")
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EventSeoRecord | null) ?? null;
});
