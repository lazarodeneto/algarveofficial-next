"use client";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type UserChatThread = Tables<"chat_threads"> & {
  listing: { name: string; slug: string; featured_image_url: string | null } | null;
  owner: { full_name: string | null; avatar_url: string | null } | null;
  last_message: Tables<"chat_messages"> | null;
  unread_count: number;
};

type PublicProfile = { full_name?: string | null; avatar_url?: string | null } | null;

/**
 * Hook to fetch chat threads for a user (viewer role)
 * Realtime invalidation is handled by InboxRealtimeProvider (single channel)
 */
export function useUserChatThreads() {
  const { user } = useAuth();
  const profileCacheRef = useRef<Map<string, PublicProfile>>(new Map());

  return useQuery({
    queryKey: ["user-chat-threads", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: threads, error } = await supabase
        .from("chat_threads")
        .select(
          `
          *,
          listing:listings!chat_threads_listing_id_fkey (name, slug, featured_image_url)
        `
        )
        .eq("viewer_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      if (!threads?.length) return [];

      const enriched = await Promise.all(
        threads.map(async (thread) => {
          // 1) Owner profile with cache
          let ownerProfile = profileCacheRef.current.get(thread.owner_id) ?? null;

          if (!ownerProfile) {
            const { data } = await supabase.rpc("get_public_profile", { _profile_id: thread.owner_id });
            ownerProfile = (data as PublicProfile) ?? null;
            profileCacheRef.current.set(thread.owner_id, ownerProfile);
          }

          // 2) Last message + unread count in parallel
          const [lastMsgRes, unreadRes] = await Promise.all([
            supabase
              .from("chat_messages")
              .select("*")
              .eq("thread_id", thread.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),

            supabase
              .from("chat_messages")
              .select("id", { count: "exact" })
              .eq("thread_id", thread.id)
              .neq("sender_type", "viewer")
              .neq("delivery_status", "read")
              .limit(1),
          ]);

          const lastMessage = lastMsgRes.data ?? null;
          const unreadCount = unreadRes.count ?? 0;

          const profile = ownerProfile as { full_name?: string | null; avatar_url?: string | null } | null;

          return {
            ...thread,
            owner: profile ? { full_name: profile.full_name ?? null, avatar_url: profile.avatar_url ?? null } : null,
            last_message: lastMessage,
            unread_count: unreadCount,
          } as UserChatThread;
        })
      );

      return enriched;
    },
    enabled: !!user?.id,
    staleTime: 10_000,
  });
}
