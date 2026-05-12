"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOwnerListings() {
  const { user } = useAuth();
  const isBrowser = typeof window !== "undefined";

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
      const listings = data || [];
      const listingIds = listings.map((listing) => listing.id).filter(Boolean);

      if (listingIds.length === 0) {
        return listings;
      }

      const { data: claims, error: claimsError } = await supabase
        .from("business_claims")
        .select("id, listing_id, selected_tier, status, verification_method, created_at")
        .eq("claimant_user_id", user.id)
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (claimsError) {
        console.warn("[owner-listings] claim summary unavailable", claimsError.message);
        return listings;
      }

      const latestClaimByListing = new Map<string, (typeof claims)[number]>();
      for (const claim of claims ?? []) {
        if (!latestClaimByListing.has(claim.listing_id)) {
          latestClaimByListing.set(claim.listing_id, claim);
        }
      }

      return listings.map((listing) => ({
        ...listing,
        latest_claim: latestClaimByListing.get(listing.id) ?? null,
      }));
    },
    enabled: isBrowser && !!user?.id,
    initialData: [],
    staleTime: 0,
  });
}
