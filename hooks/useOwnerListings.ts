"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOwnerListings() {
  const { user } = useAuth();

  if (typeof window === "undefined") {
    return {
      data: [],
      isLoading: false,
      error: null,
    } as any;
  }

  return useQuery({
    queryKey: ["owner-listings", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          city:cities(id, name, slug),
          category:categories(id, name, slug),
          region:regions(id, name, slug),
          images:listing_images(id, image_url, alt_text, is_featured, display_order)
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
