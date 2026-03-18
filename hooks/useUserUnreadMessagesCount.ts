"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to fetch the count of unread inbound messages for a user (viewer)
 * Realtime invalidation is handled by InboxRealtimeProvider (single channel)
 */
export function useUserUnreadMessagesCount() {
  const { user } = useAuth();

  if (typeof window === "undefined") {
    return {
      data: 0,
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ["user-messages", "unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error, status } = await supabase
        .from("chat_messages")
        .select("id, chat_threads!inner(viewer_id)", { count: "exact", head: false })
        .eq("chat_threads.viewer_id", user.id)
        .neq("sender_type", "viewer")
        .neq("delivery_status", "read")
        .limit(1);

      if (error) {
        if (status === 503) {
          return 0;
        }
        console.error("Error counting user unread messages:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5_000,
  });
}
