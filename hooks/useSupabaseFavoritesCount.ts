"use client";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserFavorites } from "@/hooks/useUserFavorites";

/**
 * Hook to fetch the count of user's favorites from Supabase.
 * Reuses the shared favorites query to avoid extra API calls.
 */
export function useSupabaseFavoritesCount() {
  const { user } = useAuth();
  const { data: favorites = [], isLoading, error } = useUserFavorites();

  const count = useMemo(() => (user?.id ? favorites.length : 0), [favorites.length, user?.id]);

  return {
    data: count,
    isLoading: user?.id ? isLoading : false,
    error,
  };
}
