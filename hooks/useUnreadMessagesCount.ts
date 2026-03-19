"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/components/router/nextRouterCompat";

/**
 * Hook to fetch the count of active admin message threads.
 * This keeps sidebar/header message badges aligned with Admin Messages page totals.
 */
export function useUnreadMessagesCount() {
  const { user } = useAuth();
  const location = useLocation();
  const isBrowser = typeof window !== "undefined";
  const isAdminMessagesRoute = location.pathname.startsWith("/admin/messages");

  return useQuery({
    queryKey: ["admin-messages", "unread-count", isAdminMessagesRoute],
    queryFn: async () => {
      if (isAdminMessagesRoute) return 0;
      if (!user?.id) return 0;

      // Count unread inbound messages, then map to active threads for badge consistency.
      const { data: unreadMessages, error } = await supabase
        .from("chat_messages")
        .select("thread_id")
        .neq("sender_type", "admin")
        .neq("delivery_status", "read");

      if (error) {
        console.error("Error counting unread admin message threads:", error);
        return 0;
      }

      const unreadThreadIds = [...new Set((unreadMessages || []).map((message) => message.thread_id).filter(Boolean))];
      if (unreadThreadIds.length === 0) return 0;

      const { data: activeThreads, error: activeError } = await supabase
        .from("chat_threads")
        .select("id")
        .in("id", unreadThreadIds)
        .eq("status", "active");

      if (activeError) {
        console.error("Error filtering active unread admin threads:", activeError);
        return 0;
      }

      return activeThreads?.length || 0;
    },
    enabled: isBrowser && !!user?.id,
    initialData: 0,
    staleTime: 2_000,
  });
}
