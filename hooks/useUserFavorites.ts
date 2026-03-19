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
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["favorites", "all", user?.id],
    queryFn: async (): Promise<UserFavoriteRow[]> => {
      if (!user?.id) return [];

      const { data, error, status } = await supabase
        .from("favorites")
        .select("id, listing_id, category_id, city_id, region_id, created_at")
        .eq("user_id", user.id);

      if (error) {
        if (status === 503) {
          return [];
        }
        throw error;
      }
      return (data || []) as UserFavoriteRow[];
    },
    enabled: isBrowser && !!user?.id,
    initialData: [] as UserFavoriteRow[],
    staleTime: 60_000,
  });
}
