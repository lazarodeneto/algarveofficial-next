"use client";
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const POLLING_INTERVAL_MS = 20_000; // 20 seconds

/**
 * Lightweight polling hook for admin message updates.
 * Replaces Supabase Realtime for admin users to reduce load.
 * Pauses when the browser tab is hidden.
 *
 * Must be called ONCE in AdminLayout, not in individual pages/components.
 */
export function useAdminMessagePolling() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-chat-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["listings", "pending-review-count"] });
    queryClient.invalidateQueries({ queryKey: ["listing-claims", "pending-count"] });
    queryClient.invalidateQueries({ queryKey: ["events", "pending", "count"] });
  }, [queryClient]);

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
    };
  }, [user?.id, user?.role, invalidate]);
}
