"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the total count of items awaiting translation or review across all content types:
 * - listing translation_jobs with status='queued'
 * - category_translations, city_translations, region_translations with status='needs_review'
 * - footer_section_translations, footer_link_translations, blog_post_translations with status='needs_review'
 *
 * Updated in real-time via Supabase Realtime.
 * Gracefully handles missing tables (migration not yet applied).
 */
export function useTranslationQueueCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      // Use allSettled so a missing table (pre-migration) doesn't break the count
      const results = await Promise.allSettled([
        supabase
          .from("translation_jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "queued"),
        supabase
          .from("category_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
        supabase
          .from("city_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
        supabase
          .from("region_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
        supabase
          .from("footer_section_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
        supabase
          .from("footer_link_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
        supabase
          .from("blog_post_translations" as never)
          .select("id", { count: "exact", head: true })
          .eq("status", "needs_review"),
      ]);

      let total = 0;
      for (const r of results) {
        if (r.status === "fulfilled" && !r.value.error) {
          total += r.value.count ?? 0;
        }
      }
      if (mounted) setCount(total);
    }

    fetchCount();

    // Subscribe to all relevant tables for live badge updates
    const channel = supabase
      .channel("translation-queue-count-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "translation_jobs" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "category_translations" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "city_translations" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "region_translations" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "footer_section_translations" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "footer_link_translations" }, fetchCount)
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_post_translations" }, fetchCount)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
