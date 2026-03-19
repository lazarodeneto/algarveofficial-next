import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useUserFavorites } from '@/hooks/useUserFavorites';

const STORAGE_KEY = 'algarve-favorite-listings';

export interface FavoriteListing {
  id: string;
  listing_id: string;
  saved_at: string;
}

export function useFavoriteListings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  // Local state for unauthenticated users
  const [localFavorites, setLocalFavorites] = useState<FavoriteListing[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Supabase query for authenticated users
  const { data: allFavorites = [], isLoading } = useUserFavorites();
  const supabaseFavorites: FavoriteListing[] = allFavorites
    .filter((fav) => Boolean(fav.listing_id))
    .map((fav) => ({
      id: fav.id,
      listing_id: fav.listing_id!,
      saved_at: fav.created_at,
    }));

  // Persist local favorites to localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localFavorites));
    }
  }, [localFavorites, user]);

  // Use Supabase data when logged in, otherwise use local state
  const favoriteListings = user ? supabaseFavorites : localFavorites;
  const favoriteListingIds = favoriteListings.map(f => f.listing_id);

  const addFavorite = useCallback(async (listingId: string) => {
    if (user) {
      // Add to Supabase
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId });
      
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'all', user.id] });
      }
    } else {
      // Add to local state
      const exists = localFavorites.some(f => f.listing_id === listingId);
      if (exists) return;

      const newFavorite: FavoriteListing = {
        id: `fav-${Date.now()}`,
        listing_id: listingId,
        saved_at: new Date().toISOString(),
      };
      setLocalFavorites(prev => [...prev, newFavorite]);
    }
  }, [user, localFavorites, queryClient]);

  const removeFavorite = useCallback(async (listingId: string) => {
    if (user) {
      // Remove from Supabase
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'all', user.id] });
      }
    } else {
      // Remove from local state
      setLocalFavorites(prev => prev.filter(f => f.listing_id !== listingId));
    }
  }, [user, queryClient]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (favoriteListingIds.includes(listingId)) {
      await removeFavorite(listingId);
    } else {
      await addFavorite(listingId);
    }
  }, [favoriteListingIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((listingId: string) => {
    return favoriteListingIds.includes(listingId);
  }, [favoriteListingIds]);

  return {
    favoriteListings,
    favoriteListingIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoading: isBrowser && user ? isLoading : false,
  };
}
