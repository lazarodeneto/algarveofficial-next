import { useEffect, useRef, useCallback, createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Centralized inbox provider for chat updates.
 * Uses polling instead of Supabase Realtime to eliminate WAL overhead
 * (realtime.list_changes was consuming 95% of DB time).
 * 
 * Polls every 15s for owners/viewers. Admins use separate polling via useAdminMessagePolling.
 */

interface InboxRealtimeContextValue {
  isConnected: boolean;
}

const InboxRealtimeContext = createContext<InboxRealtimeContextValue>({ isConnected: false });

export function useInboxRealtime() {
  return useContext(InboxRealtimeContext);
}

interface InboxRealtimeProviderProps {
  children: ReactNode;
}

export function InboxRealtimeProvider({ children }: InboxRealtimeProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);

  const invalidateInbox = useCallback(() => {
    if (!user?.id) return;
    queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
    queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
    queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
  }, [queryClient, user?.id]);

  useEffect(() => {
    // Skip for admin/editor - they use useAdminMessagePolling
    const isAdmin = user?.role === "admin" ?? user?.role === "editor";
    if (!user?.id || isAdmin) return;

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(invalidateInbox, 30000); // 30s instead of 15s
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
        invalidateInbox(); // Refresh on return
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [user?.id, user?.role, invalidateInbox]);

  return (
    <InboxRealtimeContext.Provider value={{ isConnected: true }}>
      {children}
    </InboxRealtimeContext.Provider>
  );
}
