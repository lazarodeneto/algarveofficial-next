import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ListingReviewStatus = "pending" | "approved" | "rejected";

export interface ListingReview {
  approved_at: string | null;
  id: string;
  listing_id: string;
  comment: string | null;
  created_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  rating: number;
  rejection_reason: string | null;
  status: ListingReviewStatus;
  updated_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface AdminListingReview extends ListingReview {
  listing?: {
    name: string;
    slug: string;
  } | null;
}

export function useListingReviews(listingId: string | undefined) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["listing-reviews", listingId],
    enabled: isBrowser && !!listingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_reviews")
        .select("*")
        .eq("listing_id", listingId!)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviews = (data ?? []) as ListingReview[];
      const userIds = Array.from(
        new Set(reviews.map((review) => review.user_id).filter(Boolean)),
      );

      if (userIds.length === 0) {
        return reviews;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profileError) throw profileError;

      const profilesById = new Map(
        (profileRows ?? [])
          .filter((profile) => profile.id)
          .map((profile) => [
            profile.id as string,
            {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            },
          ]),
      );

      return reviews.map((review) => ({
        ...review,
        profile: profilesById.get(review.user_id) ?? null,
      }));
    },
    initialData: [] as ListingReview[],
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyListingReview(listingId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["listing-review-mine", listingId, userId],
    enabled: !!listingId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_reviews")
        .select("*")
        .eq("listing_id", listingId!)
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) throw error;
      return data as ListingReview | null;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function usePendingListingReviewCount() {
  return useQuery({
    queryKey: ["listing-reviews", "pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("listing_reviews")
        .select("id", { count: "exact" })
        .eq("status", "pending")
        .limit(1);

      if (error) {
        console.error("Error fetching pending listing review count:", error);
        return 0;
      }

      return count || 0;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useAdminListingReviews(status: ListingReviewStatus | "all" = "pending") {
  return useQuery({
    queryKey: ["admin-listing-reviews", status],
    queryFn: async () => {
      let query = supabase
        .from("listing_reviews")
        .select("*, listing:listings(name, slug)")
        .order("created_at", { ascending: false });

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reviews = (data ?? []) as AdminListingReview[];
      const userIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));

      if (userIds.length === 0) {
        return reviews;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profileError) throw profileError;

      const profilesById = new Map(
        (profileRows ?? []).map((profile) => [
          profile.id as string,
          {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          },
        ]),
      );

      return reviews.map((review) => ({
        ...review,
        profile: profilesById.get(review.user_id) ?? null,
      }));
    },
    staleTime: 1000 * 30,
  });
}

export function useUpsertListingReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      userId,
      rating,
      comment,
    }: {
      listingId: string;
      userId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("listing_reviews")
        .upsert(
          { listing_id: listingId, user_id: userId, rating, comment: comment || null },
          { onConflict: "listing_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as ListingReview;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing-review-mine", variables.listingId, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-listing-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", "pending-count"] });
    },
  });
}

export function useDeleteListingReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, listingId }: { reviewId: string; listingId: string }) => {
      const { error } = await supabase
        .from("listing_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      return { reviewId, listingId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing-review-mine", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["admin-listing-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", "pending-count"] });
    },
  });
}

export function useModerateListingReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      reviewId: string;
      listingId: string;
      status: Exclude<ListingReviewStatus, "pending">;
      rejectionReason?: string;
    }) => {
      const { reviewId, status, rejectionReason } = variables;

      const { data, error } = await supabase
        .from("listing_reviews")
        .update({
          status,
          rejection_reason: status === "rejected" ? (rejectionReason?.trim() || null) : null,
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data as ListingReview;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-listing-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing-review-mine", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing-reviews", "pending-count"] });
    },
  });
}
