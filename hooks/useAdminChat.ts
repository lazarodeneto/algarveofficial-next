"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeThreadStatus, type ThreadStatus } from "@/lib/chatThreadStatus";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import { getSupabaseFunctionErrorMessage } from "@/lib/supabaseFunctionError";

export interface ChatThread {
  id: string;
  viewer_id: string | null;
  owner_id: string;
  listing_id: string | null;
  status: string;
  channel: string;
  last_message_at: string | null;
  created_at: string;
  contact_name?: string | null;
  contact_email?: string | null;
  viewer?: { full_name: string | null };
  owner?: { full_name: string | null };
  listing?: { name: string; slug: string };
  message_count?: number;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  body_text: string;
  sender_type: string;
  direction: string;
  delivery_status: string;
  created_at: string;
  recipient_id?: string | null;
}

interface ThreadFilters {
  status?: string;
  ownerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

type UntypedRpcResult<T = unknown> = Promise<{ data: T | null; error: unknown }>;

const callUntypedRpc = <T = unknown>(fn: string, args?: Record<string, unknown>) =>
  (supabase.rpc as unknown as (fn: string, args?: Record<string, unknown>) => UntypedRpcResult<T>)(fn, args);

/**
 * Hook to fetch admin chat threads
 * Realtime invalidation for thread list is handled by InboxRealtimeProvider
 */
export function useAdminChatThreads(filters: ThreadFilters = {}) {
  return useQuery({
    queryKey: ["admin-chat-threads", filters],
    queryFn: async () => {
      let query = supabase
        .from("chat_threads")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.ownerId) {
        query = query.eq("owner_id", filters.ownerId);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data: threads, error } = await query;
      if (error) throw error;
      if (!threads || threads.length === 0) return [] as ChatThread[];

      const viewerIds = [...new Set(threads.map((t) => t.viewer_id).filter((id): id is string => Boolean(id)))];
      const ownerIds = [...new Set(threads.map((t) => t.owner_id).filter((id): id is string => Boolean(id)))];
      const listingIds = [...new Set(threads.map((t) => t.listing_id).filter((id): id is string => Boolean(id)))];
      const threadIds = threads.map((t) => t.id);

      // Fetch related data in parallel (safe fields only)
      const [viewersResult, ownersResult, listingsResult, messagesResult] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", viewerIds),
        supabase.from("profiles").select("id, full_name").in("id", ownerIds),
        supabase.from("listings").select("id, name, slug").in("id", listingIds),
        supabase.from("chat_messages").select("thread_id").in("thread_id", threadIds),
      ]);

      const viewerMap = new Map(viewersResult.data?.map((v) => [v.id, v]) || []);
      const ownerMap = new Map(ownersResult.data?.map((o) => [o.id, o]) || []);
      const listingMap = new Map(listingsResult.data?.map((l) => [l.id, l]) || []);

      const messageCountMap = new Map<string, number>();
      messagesResult.data?.forEach((m) => {
        messageCountMap.set(m.thread_id, (messageCountMap.get(m.thread_id) || 0) + 1);
      });

      return threads.map((thread) => ({
        ...thread,
        status: normalizeThreadStatus(thread.status),
        viewer: thread.viewer_id ? viewerMap.get(thread.viewer_id) : undefined,
        owner: ownerMap.get(thread.owner_id),
        listing: thread.listing_id ? listingMap.get(thread.listing_id) : undefined,
        message_count: messageCountMap.get(thread.id) || 0,
      })) as ChatThread[];
    },
  });
}

/**
 * Hook to fetch messages for a specific thread (admin view)
 * No Realtime subscription - uses polling via useAdminMessagePolling in AdminLayout
 */
export function useAdminChatMessages(threadId: string | null) {
  return useQuery({
    queryKey: ["admin-chat-messages", threadId],
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
    staleTime: 5_000,
  });
}

export function useAdminOwners() {
  return useQuery({
    queryKey: ["admin-owners-list"],
    queryFn: async () => {
      const { data: threads, error: threadsError } = await supabase.from("chat_threads").select("owner_id");

      if (threadsError) throw threadsError;

      const ownerIds = [...new Set(threads?.map((t) => t.owner_id) || [])];
      if (ownerIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ownerIds);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
    staleTime: 60_000,
  });
}

export function useUpdateThreadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, status }: { threadId: string; status: ThreadStatus }) => {
      const { error } = await supabase.from("chat_threads").update({ status }).eq("id", threadId);
      if (error) throw error;
      return { threadId, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      toast.success("Thread status updated");
    },
    onError: (error) => {
      toast.error("Failed to update thread status");
      console.error(error);
    },
  });
}

export function useAdminSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, messageText }: { threadId: string; messageText: string }) => {
      const { data, error } = await invokeFunctionWithAuthRetry("whatsapp-send", {
        body: {
          thread_id: threadId,
          message_text: messageText,
        },
      });

      if (error) {
        throw new Error(await getSupabaseFunctionErrorMessage(error, "Failed to send message"));
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
      toast.success("Message sent");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });
}

export function useMarkThreadAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      const unreadKey = ["admin-messages", "unread-count"] as const;
      const previousUnreadCount = queryClient.getQueryData<number>(unreadKey);

      if (previousUnreadCount && previousUnreadCount > 0) {
        queryClient.setQueryData(unreadKey, previousUnreadCount - 1);
      }

      return { previousUnreadCount };
    },
    mutationFn: async (threadId: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({ delivery_status: "read" })
        .eq("thread_id", threadId)
        .neq("sender_type", "admin")
        .neq("delivery_status", "read");

      if (error) throw error;
    },
    onError: (_, __, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(["admin-messages", "unread-count"], context.previousUnreadCount);
      }
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
    },
  });
}

export function useMarkThreadsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      const unreadKey = ["admin-messages", "unread-count"] as const;
      const previousUnreadCount = queryClient.getQueryData<number>(unreadKey);
      queryClient.setQueryData(unreadKey, 0);
      return { previousUnreadCount };
    },
    mutationFn: async (threadIds: string[]) => {
      const uniqueThreadIds = Array.from(new Set(threadIds.filter(Boolean)));
      if (uniqueThreadIds.length === 0) return;

      const { error } = await supabase
        .from("chat_messages")
        .update({ delivery_status: "read" })
        .in("thread_id", uniqueThreadIds)
        .neq("sender_type", "admin")
        .neq("delivery_status", "read");

      if (error) throw error;
    },
    onError: (_, __, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(["admin-messages", "unread-count"], context.previousUnreadCount);
      }
    },
    onSuccess: (_, threadIds) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      threadIds.forEach((threadId) => {
        queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", threadId] });
      });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await callUntypedRpc("admin_delete_chat_thread", { p_thread_id: threadId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
      toast.success("Thread deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete thread");
      console.error(error);
    },
  });
}

export function useDeleteChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, threadId }: { messageId: string; threadId: string }) => {
      const { error } = await callUntypedRpc("admin_delete_chat_message", { p_message_id: messageId });
      if (error) throw error;
      return threadId;
    },
    onSuccess: (threadId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["owner-chat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["user-messages", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["owner-messages", "unread-count"] });
      toast.success("Message deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete message");
      console.error(error);
    },
  });
}
