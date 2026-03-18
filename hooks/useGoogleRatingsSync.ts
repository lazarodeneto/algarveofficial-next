"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SyncStatus {
  id: string;
  status: "idle" | "running" | "completed";
  last_cursor: string | null;
  batch_size: number;
  total_listings: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export function useGoogleRatingsSync() {
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      syncStatus: null,
      isLoading: false,
      lastRefresh: null,
      progress: 0,
      initRefresh: () => {},
      isInitializing: false,
      stopRefresh: () => {},
      isStopping: false,
    };
  }

  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ["google-ratings-sync-status"],
    queryFn: async (): Promise<SyncStatus | null> => {
      const { data, error } = await supabase
        .from("google_ratings_sync_status")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;
      return data as SyncStatus | null;
    },
    // Auto-refetch every 5 seconds while running for better progress updates
    refetchInterval: (query) => {
      const data = query.state.data as SyncStatus | null | undefined;
      return data?.status === "running" ? 5000 : false;
    },
  });

  const { data: lastRefresh } = useQuery({
    queryKey: ["google-ratings-last-refresh"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_ratings_refresh_log")
        .select("completed_at, success_count, failure_count")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const initRefreshMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("init-ratings-refresh");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Started refresh for ${data.total_listings} listings`);
      queryClient.invalidateQueries({ queryKey: ["google-ratings-sync-status"] });
    },
    onError: (error) => {
      console.error("Error initiating refresh:", error);
      toast.error("Failed to start ratings refresh");
    },
  });

  const stopRefreshMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("google_ratings_sync_status")
        .update({
          status: "idle",
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "default");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sync stopped");
      queryClient.invalidateQueries({ queryKey: ["google-ratings-sync-status"] });
    },
    onError: (error) => {
      console.error("Error stopping refresh:", error);
      toast.error("Failed to stop sync");
    },
  });

  const progress = syncStatus
    ? syncStatus.total_listings > 0
      ? Math.round((syncStatus.processed_count / syncStatus.total_listings) * 100)
      : 0
    : 0;

  return {
    syncStatus,
    isLoading,
    lastRefresh,
    progress,
    initRefresh: initRefreshMutation.mutate,
    isInitializing: initRefreshMutation.isPending,
    stopRefresh: stopRefreshMutation.mutate,
    isStopping: stopRefreshMutation.isPending,
  };
}
