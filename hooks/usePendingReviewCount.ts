"use client";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch the count of listings pending review
 * Used by both AdminSidebar and AdminHeader for synchronized notifications
 */
export function usePendingReviewCount() {
  return useQuery({
    queryKey: ['listings', 'pending-review-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('listings')
        .select('id', { count: 'exact' })
        .eq('status', 'pending_review')
        .limit(1);

      if (error) {
        console.error('Error fetching pending review count:', error);
        return 0;
      }

      return count || 0;
    },
    // Refetch every 60 seconds to reduce DB load
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
