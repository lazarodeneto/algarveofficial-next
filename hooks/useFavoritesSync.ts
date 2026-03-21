import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// localStorage keys used by the favorite hooks
const LISTINGS_STORAGE_KEY = 'algarve-favorite-listings';
const CATEGORIES_STORAGE_KEY = 'algarve-favorite-categories';

interface LocalFavorite {
  id: string;
  listing_id?: string;
  category_id?: string;
  saved_at: string;
}

/**
 * Hook that syncs localStorage favorites to Supabase when a user logs in.
 * This ensures data consistency across devices by migrating local favorites
 * to the database, then clearing localStorage after successful sync.
 */
export function useFavoritesSync() {
  const { user } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per login session, and only when user is authenticated
    if (!user || hasSynced.current) return;

    const syncFavoritesToSupabase = async () => {
      try {
        // Get localStorage favorites
        const localListings = getLocalFavorites(LISTINGS_STORAGE_KEY);
        const localCategories = getLocalFavorites(CATEGORIES_STORAGE_KEY);

        if (localListings.length === 0 && localCategories.length === 0) {
          hasSynced.current = true;
          return;
        }



        // Extract listing IDs to validate
        const listingIdsToCheck = localListings
          .map(f => f.listing_id)
          .filter((id): id is string => !!id);

        // Validate that listings actually exist in database
        let validListingIds = new Set<string>();
        if (listingIdsToCheck.length > 0) {
          const { data: existingListings } = await supabase
            .from('listings')
            .select('id')
            .in('id', listingIdsToCheck);
          
          validListingIds = new Set(existingListings?.map(l => l.id) || []);
          
          const invalidCount = listingIdsToCheck.length - validListingIds.size;
          if (invalidCount > 0) {

          }
        }

        // Fetch existing favorites from Supabase to avoid duplicates
        const { data: existingFavorites } = await supabase
          .from('favorites')
          .select('listing_id, category_id')
          .eq('user_id', user.id);

        const existingListingIds = new Set(
          existingFavorites?.filter(f => f.listing_id).map(f => f.listing_id) || []
        );
        const existingCategoryIds = new Set(
          existingFavorites?.filter(f => f.category_id).map(f => f.category_id) || []
        );

        // Prepare new favorites to insert (excluding duplicates and invalid listings)
        const newFavorites: { user_id: string; listing_id?: string; category_id?: string }[] = [];

        // Add listings that exist and don't already exist in favorites
        for (const fav of localListings) {
          if (fav.listing_id && 
              validListingIds.has(fav.listing_id) && 
              !existingListingIds.has(fav.listing_id)) {
            newFavorites.push({
              user_id: user.id,
              listing_id: fav.listing_id
            });
          }
        }

        // Add categories that don't already exist
        for (const fav of localCategories) {
          if (fav.category_id && !existingCategoryIds.has(fav.category_id)) {
            newFavorites.push({
              user_id: user.id,
              category_id: fav.category_id
            });
          }
        }

        // Insert new favorites if any
        if (newFavorites.length > 0) {
          const { error } = await supabase
            .from('favorites')
            .insert(newFavorites);

          if (error) {
            console.error('[FavoritesSync] Error syncing favorites:', error);
            // Still clear localStorage to prevent repeated failures
            localStorage.removeItem(LISTINGS_STORAGE_KEY);
            localStorage.removeItem(CATEGORIES_STORAGE_KEY);
            hasSynced.current = true;
            return;
          }


        }

        // Clear localStorage after sync (success or skip)
        localStorage.removeItem(LISTINGS_STORAGE_KEY);
        localStorage.removeItem(CATEGORIES_STORAGE_KEY);
        

        hasSynced.current = true;

      } catch (error) {
        console.error('[FavoritesSync] Unexpected error during sync:', error);
        // Clear localStorage to prevent repeated failures
        localStorage.removeItem(LISTINGS_STORAGE_KEY);
        localStorage.removeItem(CATEGORIES_STORAGE_KEY);
        hasSynced.current = true;
      }
    };

    syncFavoritesToSupabase();
  }, [user]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!user) {
      hasSynced.current = false;
    }
  }, [user]);
}

function getLocalFavorites(storageKey: string): LocalFavorite[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid JSON, ignore
  }
  return [];
}
