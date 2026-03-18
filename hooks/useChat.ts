"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type ChatThread = Tables<"chat_threads"> & {
  listings?: { name: string; featured_image_url: string | null } | null;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
  last_message?: Tables<"chat_messages"> | null;
};

type ChatMessage = Tables<"chat_messages">;

// Fetch all threads for the current user (as viewer or owner)
export function useChatThreads() {
  const { user } = useAuth();

  if (typeof window === "undefined") {
    return {
      data: [] as ChatThread[],
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ["chat-threads", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch threads where user is viewer or owner
      const { data, error } = await supabase
        .from("chat_threads")
        .select(`
          *,
          listings:listing_id (name, featured_image_url)
        `)
        .or(`viewer_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as ChatThread[];
    },
    enabled: !!user,
  });
}

/**
 * Fetch messages for a specific thread.
 * Realtime invalidation is handled by InboxRealtimeProvider (single channel).
 * No per-thread channel — eliminates duplicate WAL subscriptions.
 */
export function useChatMessages(threadId: string | null) {
  if (typeof window === "undefined") {
    return {
      data: [] as ChatMessage[],
      isLoading: false,
      error: null,
    };
  }
  return useQuery({
    queryKey: ["chat-messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!threadId,
  });
}

// Create or find a thread for a listing
export function useCreateOrFindThread() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      mutate: () => {},
      mutateAsync: async () => ({}),
      isPending: false,
    };
  }

  return useMutation({
    mutationFn: async ({ listingId, ownerId }: { listingId: string; ownerId: string }) => {
      if (!user) throw new Error("Must be logged in");

      // First, try to find existing thread
      const { data: existing } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("listing_id", listingId)
        .eq("owner_id", ownerId)
        .eq("viewer_id", user.id)
        .single();

      if (existing) return existing;

      // Create new thread
      const { data, error } = await supabase
        .from("chat_threads")
        .insert({
          listing_id: listingId,
          owner_id: ownerId,
          viewer_id: user.id,
          channel: "whatsapp",
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      mutate: () => {},
      mutateAsync: async () => ({}),
      isPending: false,
    };
  }

  return useMutation({
    mutationFn: async ({ threadId, messageText }: { threadId: string; messageText: string }) => {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: {
          thread_id: threadId,
          message_text: messageText,
        },
      });

      if (error) {
        let detailedMessage = "";
        const errorContext = (error as { context?: unknown }).context;
        if (errorContext instanceof Response) {
          const payload = await errorContext.json().catch(() => null) as { error?: string } | null;
          if (payload?.error) detailedMessage = payload.error;
        }
        throw new Error(detailedMessage || error.message || "Failed to send message");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });
}

// Mark all unread inbound messages in a thread as read for the current user
export function useMarkThreadMessagesAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      mutate: () => {},
      mutateAsync: async () => ({}),
      isPending: false,
    };
  }

  return useMutation({
    onMutate: async (threadId: string) => {
      const updateThreadList = (queryKey: string[]) => {
        const previousThreads = queryClient.getQueryData<Array<{ id: string; unread_count?: number }>>(queryKey);
        if (!previousThreads) {
          return { previousThreads: undefined, unreadDelta: 0 };
        }

        let unreadDelta = 0;
        const nextThreads = previousThreads.map((thread) => {
          if (thread.id !== threadId) return thread;
          unreadDelta = thread.unread_count ?? 0;
          return { ...thread, unread_count: 0 };
        });

        queryClient.setQueryData(queryKey, nextThreads);
        return { previousThreads, unreadDelta };
      };

      const ownerResult = updateThreadList(["owner-chat-threads", user?.id]);
      const userResult = updateThreadList(["user-chat-threads", user?.id]);

      const ownerUnreadKey = ["owner-messages", "unread-count", user?.id];
      const userUnreadKey = ["user-messages", "unread-count", user?.id];
      const ownerPreviousUnreadCount = queryClient.getQueryData<number>(ownerUnreadKey);
      const userPreviousUnreadCount = queryClient.getQueryData<number>(userUnreadKey);

      if (ownerResult.unreadDelta > 0) {
        const previousCount = ownerPreviousUnreadCount ?? 0;
        queryClient.setQueryData(ownerUnreadKey, Math.max(0, previousCount - ownerResult.unreadDelta));
      }

      if (userResult.unreadDelta > 0) {
        const previousCount = userPreviousUnreadCount ?? 0;
        queryClient.setQueryData(userUnreadKey, Math.max(0, previousCount - userResult.unreadDelta));
      }

      return {
        ownerPreviousThreads: ownerResult.previousThreads,
        userPreviousThreads: userResult.previousThreads,
        ownerPreviousUnreadCount,
        userPreviousUnreadCount,
      };
    },
    mutationFn: async (threadId: string) => {
      if (!user?.id || !threadId) return;
      
      const { error } = await supabase.rpc("mark_thread_messages_read", { p_thread_id: threadId });
      if (error) throw error;
    },
    onError: (_, __, context) => {
      if (context?.ownerPreviousThreads) {
        queryClient.setQueryData(["owner-chat-threads", user?.id], context.ownerPreviousThreads);
      }
      if (context?.userPreviousThreads) {
        queryClient.setQueryData(["user-chat-threads", user?.id], context.userPreviousThreads);
      }
      if (context?.ownerPreviousUnreadCount !== undefined) {
        queryClient.setQueryData(["owner-messages", "unread-count", user?.id], context.ownerPreviousUnreadCount);
      }
      if (context?.userPreviousUnreadCount !== undefined) {
        queryClient.setQueryData(["user-messages", "unread-count", user?.id], context.userPreviousUnreadCount);
      }
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
    },
  });
}

// Check if a listing owner has WhatsApp enabled
export function useOwnerWhatsAppStatus(ownerId: string | undefined) {
  if (typeof window === "undefined") {
    return {
      data: { enabled: false, phone: null },
      isLoading: false,
      error: null,
    };
  }
  return useQuery({
    queryKey: ["owner-whatsapp-status", ownerId],
    queryFn: async () => {
      if (!ownerId) return { enabled: false, phone: null };

      const { data, error } = await supabase
        .from("whatsapp_accounts")
        .select("wa_enabled, business_phone_e164")
        .eq("owner_id", ownerId)
        .eq("wa_enabled", true)
        .maybeSingle();

      if (error) throw error;
      return {
        enabled: !!data,
        phone: data?.business_phone_e164 || null,
      };
    },
    enabled: !!ownerId,
  });
}
