"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { normalizeThreadStatus, type ThreadStatus } from "@/lib/chatThreadStatus";

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

/**
 * Hook to fetch admin chat threads.
 * SECURITY: This hook MUST use API route /api/admin/chat/threads.
 * Do NOT use Supabase client here.
 */
export function useAdminChatThreads(filters: ThreadFilters = {}) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-chat-threads", user?.id, filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.ownerId) params.set("ownerId", filters.ownerId);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.set("dateTo", filters.dateTo.toISOString());

      const res = await fetch(`/api/admin/chat/threads?${params}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return (json.threads ?? []) as ChatThread[];
    },
  });
}

/**
 * Hook to fetch messages for a specific thread (admin view).
 * SECURITY: This hook MUST use API route.
 */
export function useAdminChatMessages(threadId: string | null) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-chat-messages", user?.id, threadId],
    enabled: !!user && !authLoading && !!threadId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/chat/threads?threadId=${threadId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return (json.data ?? []) as ChatMessage[];
    },
    staleTime: 5_000,
  });
}

/**
 * Hook to fetch list of owners who have chat threads.
 * SECURITY: This hook MUST use API route.
 */
export function useAdminOwners() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-owners-list", user?.id],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/chat/threads/owners", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) return [];
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpdateThreadStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, status }: { threadId: string; status: ThreadStatus }) => {
      const res = await fetch("/api/admin/chat/threads", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to update thread");
      return { threadId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
      toast.success("Thread status updated");
    },
    onError: (error) => {
      toast.error("Failed to update thread status");
      console.error(error);
    },
  });
}

export function useAdminSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, messageText }: { threadId: string; messageText: string }) => {
      const res = await fetch("/api/admin/chat/message", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, messageText }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to send message");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
      toast.success("Message sent");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });
}

export function useMarkThreadAsRead() {
  const { user } = useAuth();
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
      const res = await fetch("/api/admin/chat/read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
    },
    onError: (_, __, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(["admin-messages", "unread-count"], context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
    },
  });
}

export function useMarkThreadsAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      const unreadKey = ["admin-messages", "unread-count"] as const;
      const previousUnreadCount = queryClient.getQueryData<number>(unreadKey);
      queryClient.setQueryData(unreadKey, 0);
      return { previousUnreadCount };
    },
    mutationFn: async (threadIds: string[]) => {
      const unique = Array.from(new Set(threadIds.filter(Boolean)));
      if (unique.length === 0) return;
      const res = await fetch("/api/admin/chat/read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadIds: unique }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
    },
    onError: (_, __, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(["admin-messages", "unread-count"], context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
    },
  });
}

export function useDeleteThread() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const res = await fetch("/api/admin/chat/threads", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete thread");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
      toast.success("Thread deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete thread");
      console.error(error);
    },
  });
}

export function useDeleteChatMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const res = await fetch("/api/admin/chat/message", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-threads", user?.id], exact: false });
      queryClient.invalidateQueries({ queryKey: ["admin-messages", "unread-count"], exact: false });
      toast.success("Message deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete message");
      console.error(error);
    },
  });
}
