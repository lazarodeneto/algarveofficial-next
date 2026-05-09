"use client";

import { useCallback } from 'react';

import { useFavoriteListings } from '@/hooks/useFavoriteListings';

type EventFavoriteTarget = {
  id: string;
  listing_id?: string | null;
};

function getEventFavoriteListingId(event: EventFavoriteTarget): string | null {
  return event.listing_id ?? null;
}

export function useFavoriteEvents() {
  const {
    addFavorite: addListingFavorite,
    favoriteListingIds,
    isLoading,
    removeFavorite: removeListingFavorite,
  } = useFavoriteListings();

  const addFavorite = useCallback(async (event: EventFavoriteTarget) => {
    const listingId = getEventFavoriteListingId(event);
    if (!listingId) return;
    await addListingFavorite(listingId);
  }, [addListingFavorite]);

  const removeFavorite = useCallback(async (event: EventFavoriteTarget) => {
    const listingId = getEventFavoriteListingId(event);
    if (!listingId) return;
    await removeListingFavorite(listingId);
  }, [removeListingFavorite]);

  const toggleFavorite = useCallback(async (event: EventFavoriteTarget) => {
    const listingId = getEventFavoriteListingId(event);
    if (!listingId) return;

    if (favoriteListingIds.includes(listingId)) {
      await removeListingFavorite(listingId);
      return;
    }

    await addListingFavorite(listingId);
  }, [addListingFavorite, favoriteListingIds, removeListingFavorite]);

  const isFavorite = useCallback((event: EventFavoriteTarget) => {
    const listingId = getEventFavoriteListingId(event);
    return Boolean(listingId && favoriteListingIds.includes(listingId));
  }, [favoriteListingIds]);

  return {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoading,
  };
}
