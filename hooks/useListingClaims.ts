"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ListingClaim {
  id: string;
  listing_id: string | null;
  business_name: string;
  business_website: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  request_type: 'claim-business' | 'new-listing';
  status: 'pending' | 'approved' | 'rejected';
  user_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface SubmitClaimData {
  requestType: 'claim-business' | 'new-listing';
  businessName: string;
  businessWebsite?: string;
  contactName: string;
  email: string;
  phone?: string;
  message: string;
  listingId?: string;
}

/**
 * Hook to submit a listing claim/request
 */
export function useSubmitListingClaim() {
  const { user } = useAuth();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (data: SubmitClaimData) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from('listing_claims')
        .insert({
          request_type: data.requestType,
          business_name: data.businessName,
          business_website: data.businessWebsite || null,
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone || null,
          message: data.message,
          listing_id: data.listingId || null,
          user_id: user?.id || null,
          status: 'pending',
        });

      if (error) throw error;
    },
  });
}

/**
 * Hook to fetch all pending listing claims (for admin)
 */
export function useListingClaims(status?: 'pending' | 'approved' | 'rejected') {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['listing-claims', status],
    queryFn: async () => {
      let query = supabase
        .from('listing_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ListingClaim[];
    },
    enabled: isBrowser,
    initialData: [] as ListingClaim[],
  });
}

/**
 * Hook to count pending listing claims (for admin notifications)
 */
export function usePendingClaimsCount() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['listing-claims', 'pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('listing_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending claims count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: isBrowser,
    initialData: 0,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook to approve/reject a listing claim (for admin)
 */
export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ 
      claimId, 
      status, 
      rejectionReason 
    }: { 
      claimId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from('listing_claims')
        .update({
          status,
          rejection_reason: rejectionReason || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-claims'] });
    },
  });
}

/**
 * Hook to approve a claim and assign a published listing to the claimant.
 * Uses a SECURITY DEFINER function that atomically:
 * 1. Sets listing owner_id (triggers auto_grant_owner_role)
 * 2. Updates claim status to approved
 */
export function useApproveAndAssignClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ claimId, listingId }: { claimId: string; listingId: string }) => {
      if (!isBrowser) {
        return { success: false, error: "Unavailable in server context" };
      }
      if (!user?.id) {
        throw new Error("Reviewer authentication required");
      }

      const { data, error } = await supabase.rpc('approve_claim_and_assign_listing', {
        _claim_id: claimId,
        _listing_id: listingId,
        _reviewer_id: user.id,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; message?: string; user_id?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve claim');
      }
      return result;
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['listing-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });

      // Force sign-out the assigned user so their next login picks up the owner role
      if (result.user_id) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await supabase.functions.invoke('force-signout', {
            body: { user_id: result.user_id },
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : undefined,
          });
        } catch (err) {
          console.warn('Could not force sign-out assigned user:', err);
        }
      }
    },
  });
}

/**
 * Fetch published listings for assignment dropdown
 */
export function usePublishedListingsForAssignment(searchTerm: string) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['published-listings-for-assignment', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('id, name, slug, featured_image_url, cities!inner(name), category:categories(slug, image_url)')
        .eq('status', 'published')
        .order('name', { ascending: true })
        .limit(20);

      if (searchTerm.length >= 2) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isBrowser && (searchTerm.length >= 2 || searchTerm.length === 0),
    initialData: [],
  });
}

/**
 * Hook to delete a listing claim (for admin)
 */
export function useDeleteClaim() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from('listing_claims')
        .delete()
        .eq('id', claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-claims'] });
    },
  });
}
