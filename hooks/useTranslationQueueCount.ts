"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the count of translation_jobs with status = 'queued'.
 *
 * ─ Semantics ─────────────────────────────────────────────────────────────────
 * Pending  → queued  (actively waiting for the translation worker)
 * Attention → missing + queued + failed  (used internally, not this hook)
 * Completed → auto + reviewed + edited
 *
 * The badge intentionally shows ONLY queued so operators see real pipeline
 * pressure, not historical auto-translated volume (which can be 9 000+).
 *
 * Updated in real-time via Supabase Realtime.
 */
export function useTranslationQueueCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      const { count: queued, error } = await supabase
        .from("translation_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "queued");

      if (!error && mounted) {
        setCount(queued ?? 0);
      }
    }

    fetchCount();

    const channel = supabase
      .channel("translation-queue-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "translation_jobs" },
        fetchCount,
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
