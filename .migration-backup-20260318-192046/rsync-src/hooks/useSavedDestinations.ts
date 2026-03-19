"use client";
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useUserFavorites } from '@/hooks/useUserFavorites';

export interface SavedDestination {
  id: string;
  type: 'region' | 'city';
  destinationId: string;
  savedAt: string;
}

export function useSavedDestinations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: favorites = [], isLoading } = useUserFavorites();

  const savedDestinations = useMemo<SavedDestination[]>(
    () =>
      (favorites || [])
        .filter((fav) => fav.region_id || fav.city_id)
        .map((fav) => ({
          id: fav.id,
          type: (fav.region_id ? 'region' : 'city') as 'region' | 'city',
          destinationId: (fav.region_id || fav.city_id)!,
          savedAt: fav.created_at,
        })),
    [favorites]
  );

  const savedCityIds = useMemo(
    () => savedDestinations.filter((d) => d.type === 'city').map((d) => d.destinationId),
    [savedDestinations]
  );

  const savedRegionIds = useMemo(
    () => savedDestinations.filter((d) => d.type === 'region').map((d) => d.destinationId),
    [savedDestinations]
  );

  const refreshFavorites = useCallback(() => {
    if (!user?.id) return;
    queryClient.invalidateQueries({ queryKey: ['favorites', 'all', user.id] });
  }, [queryClient, user?.id]);

  const addDestination = useCallback(async (type: 'region' | 'city', id: string) => {
    if (!user) return;

    const exists = savedDestinations.some((d) => d.type === type && d.destinationId === id);
    if (exists) return;

    const insertData = {
      user_id: user.id,
      ...(type === 'region' ? { region_id: id } : { city_id: id }),
    };

    const { error } = await supabase.from('favorites').insert(insertData);
    if (error) {
      console.error('Error adding destination:', error);
      return;
    }

    refreshFavorites();
  }, [refreshFavorites, savedDestinations, user]);

  const removeDestination = useCallback(async (type: 'region' | 'city', id: string) => {
    if (!user) return;

    const column = type === 'region' ? 'region_id' : 'city_id';
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq(column, id);

    if (error) {
      console.error('Error removing destination:', error);
      return;
    }

    refreshFavorites();
  }, [refreshFavorites, user]);

  const removeById = useCallback(async (destId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', destId);

    if (error) {
      console.error('Error removing destination:', error);
      return;
    }

    refreshFavorites();
  }, [refreshFavorites, user]);

  const toggleCity = useCallback((cityId: string) => {
    if (savedCityIds.includes(cityId)) {
      removeDestination('city', cityId);
    } else {
      addDestination('city', cityId);
    }
  }, [addDestination, removeDestination, savedCityIds]);

  const toggleRegion = useCallback((regionId: string) => {
    if (savedRegionIds.includes(regionId)) {
      removeDestination('region', regionId);
    } else {
      addDestination('region', regionId);
    }
  }, [addDestination, removeDestination, savedRegionIds]);

  const isDestinationSaved = useCallback((type: 'region' | 'city', id: string) => {
    return savedDestinations.some(
      (d) => d.type === type && d.destinationId === id
    );
  }, [savedDestinations]);

  return {
    savedDestinations,
    savedCityIds,
    savedRegionIds,
    addDestination,
    removeDestination,
    removeById,
    toggleCity,
    toggleRegion,
    isDestinationSaved,
    isLoading: user ? isLoading : false,
  };
}
