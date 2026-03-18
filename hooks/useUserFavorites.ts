"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface UserFavoriteRow {
  id: string;
  listing_id: string | null;
  category_id: string | null;
  city_id: string | null;
  region_id: string | null;
  created_at: string;
}

export function useUserFavorites() {
  const { user } = useAuth();

  return useQuery<UserFavoriteRow[], Error>({
    queryKey: ["favorites", "all", user?.id],

    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error, status } = await supabase
        .from("favorites")
        .select(
          "id, listing_id, category_id, city_id, region_id, created_at"
        )
        .eq("user_id", user.id);

      // Graceful fallback for Supabase downtime
      if (error) {
        if (status === 503) {
          return [];
        }

        // Optional debug (keep for dev)
        if (process.env.NODE_ENV === "development") {
          console.error("Favorites fetch error:", error);
        }

        throw error;
      }

      return (data || []) as UserFavoriteRow[];
    },

    enabled: !!user?.id,

    // Performance tuning
    staleTime: 60_000,       // 1 min cache
    gcTime: 5 * 60_000,      // 5 min garbage collection

    // UX improvements
    retry: 1,
    refetchOnWindowFocus: false,
  });
}