"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "next/link";

/**
 * Hook to fetch the count of unread inbound messages for an owner
 * Realtime invalidation is handled by InboxRealtimeProvider (single channel)
 */
export function useOwnerUnreadMessagesCount() {
  const { user } = useAuth();
  const location = useLocation();
  const isOwnerMessagesRoute = location.pathname.startsWith("/owner/messages");

  if (typeof window === "undefined") {
    return {
      data: 0,
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ["owner-messages", "unread-count", user?.id, isOwnerMessagesRoute],
    queryFn: async () => {
      if (isOwnerMessagesRoute) return 0;
      if (!user?.id) return 0;

      const { count, error, status } = await supabase
        .from("chat_messages")
        .select("id, chat_threads!inner(owner_id)", { count: "exact", head: false })
        .eq("chat_threads.owner_id", user.id)
        .neq("sender_type", "owner")
        .neq("delivery_status", "read")
        .limit(1);

      if (error) {
        if (status === 503) {
          return 0;
        }
        console.error("Error counting owner unread messages:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5_000,
  });
}
