"use client";
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const POLLING_INTERVAL_MS = 20_000; // 20 seconds
const REALTIME_DEBOUNCE_MS = 250;

type StatusChangePayload = {
  eventType?: string;
  new?: { status?: unknown } | null;
  old?: { status?: unknown } | null;
};

function hasPendingStatusImpact(payload: StatusChangePayload, pendingStatus: string) {
  const nextStatus = typeof payload.new?.status === "string" ? payload.new.status : null;
  const previousStatus = typeof payload.old?.status === "string" ? payload.old.status : null;

  if (payload.eventType === "INSERT") {
    return nextStatus === pendingStatus;
  }

  if (payload.eventType === "DELETE") {
    return previousStatus === pendingStatus;
  }

  if (payload.eventType === "UPDATE") {
    return nextStatus === pendingStatus || previousStatus === pendingStatus;
  }

  return false;
}

/**
 * Lightweight admin dashboard sync hook.
 * Keeps messages + moderation badges/lists aligned across pages and sessions.
 *
 * Uses:
 * - short-interval polling as a fallback
 * - realtime postgres change listeners for immediate moderation updates
 *
 * Pauses when the browser tab is hidden.
 *
 * Must be called ONCE in the admin shell/layout, not in individual pages/components.
 */
export function useAdminMessagePolling() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-chat-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["listings", "pending-review-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] });
    queryClient.invalidateQueries({ queryKey: ["listing-reviews", "pending-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-listing-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["listing-claims", "pending-count"] });
    queryClient.invalidateQueries({ queryKey: ["listing-claims"] });
    queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
  }, [queryClient]);

  const scheduleInvalidate = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      invalidate();
      debounceRef.current = null;
    }, REALTIME_DEBOUNCE_MS);
  }, [invalidate]);

  useEffect(() => {
    if (!user?.id || (user.role !== "admin" && user.role !== "editor")) {
      return;
    }

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(invalidate, POLLING_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Only poll when tab is visible
    if (document.visibilityState === "visible") start();

    const moderationChannel = supabase
      .channel("admin-dashboard-moderation-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        (payload) => {
          if (hasPendingStatusImpact(payload as StatusChangePayload, "pending_review")) {
            scheduleInvalidate();
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listing_reviews" },
        (payload) => {
          if (hasPendingStatusImpact(payload as StatusChangePayload, "pending")) {
            scheduleInvalidate();
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          if (hasPendingStatusImpact(payload as StatusChangePayload, "pending_review")) {
            scheduleInvalidate();
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listing_claims" },
        (payload) => {
          if (hasPendingStatusImpact(payload as StatusChangePayload, "pending")) {
            scheduleInvalidate();
          }
        },
      )
      .subscribe();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
        invalidate(); // Refresh immediately on return
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
      supabase.removeChannel(moderationChannel);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [user?.id, user?.role, invalidate, scheduleInvalidate]);
}
