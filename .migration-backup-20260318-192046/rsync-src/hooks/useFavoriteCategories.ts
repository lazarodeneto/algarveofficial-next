"use client";
import { useUserFavorites } from "@/hooks/useUserFavorites";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'algarve-favorite-categories';

export interface FavoriteCategory {
  id: string;
  category_id: string;
  saved_at: string;
}

export function useFavoriteCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      favoriteCategories: [],
      favoriteCategoryIds: [],
      addFavorite: async () => { },
      removeFavorite: async () => { },
      toggleFavorite: async () => { },
      isFavorite: () => false,
      isLoading: false,
    };
  }

  // Local state for unauthenticated users
  const [localFavorites, setLocalFavorites] = useState<FavoriteCategory[]>(() => {
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
  const supabaseFavorites: FavoriteCategory[] = allFavorites
    .filter((fav) => Boolean(fav.category_id))
    .map((fav) => ({
      id: fav.id,
      category_id: fav.category_id!,
      saved_at: fav.created_at,
    }));

  // Persist local favorites to localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localFavorites));
    }
  }, [localFavorites, user]);

  // Use Supabase data when logged in, otherwise use local state
  const favoriteCategories = user ? supabaseFavorites : localFavorites;
  const favoriteCategoryIds = favoriteCategories.map(f => f.category_id);

  const addFavorite = useCallback(async (categoryId: string) => {
    if (user) {
      // Add to Supabase
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, category_id: categoryId });

      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'all', user.id] });
      }
    } else {
      // Add to local state
      const exists = localFavorites.some(f => f.category_id === categoryId);
      if (exists) return;

      const newFavorite: FavoriteCategory = {
        id: `cat-fav-${Date.now()}`,
        category_id: categoryId,
        saved_at: new Date().toISOString(),
      };
      setLocalFavorites(prev => [...prev, newFavorite]);
    }
  }, [user, localFavorites, queryClient]);

  const removeFavorite = useCallback(async (categoryId: string) => {
    if (user) {
      // Remove from Supabase
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('category_id', categoryId);

      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'all', user.id] });
      }
    } else {
      // Remove from local state
      setLocalFavorites(prev => prev.filter(f => f.category_id !== categoryId));
    }
  }, [user, queryClient]);

  const toggleFavorite = useCallback(async (categoryId: string) => {
    if (favoriteCategoryIds.includes(categoryId)) {
      await removeFavorite(categoryId);
    } else {
      await addFavorite(categoryId);
    }
  }, [favoriteCategoryIds, addFavorite, removeFavorite]);

  const isFavorite = useCallback((categoryId: string) => {
    return favoriteCategoryIds.includes(categoryId);
  }, [favoriteCategoryIds]);

  return {
    favoriteCategories,
    favoriteCategoryIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoading: user ? isLoading : false,
  };
}
