"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ListingWithRelations } from "@/hooks/useListings";
import { shuffleItemsForPageLoad } from "@/lib/listings/page-load-shuffle";

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type StoredOrderState<T> = {
  signature: string;
  storageKey: string;
  items: readonly T[];
};

function readStoredOrder(storageKey: string) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return null;

    return parsedValue.filter((value): value is string => typeof value === "string");
  } catch {
    return null;
  }
}

function writeStoredOrder(storageKey: string, ids: readonly string[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Browsers can deny storage in private or restricted modes. Random display still works.
  }
}

export function usePageLoadListingShuffle<T extends Pick<ListingWithRelations, "id">>(
  listings: readonly T[],
  storageKey: string,
) {
  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  const signature = useMemo(
    () => listings.map((listing) => listing.id).join("\u001F"),
    [listings],
  );
  const [displayState, setDisplayState] = useState<StoredOrderState<T>>({
    signature: "",
    storageKey: "",
    items: listings,
  });

  useBrowserLayoutEffect(() => {
    const currentListings = listingsRef.current;

    if (currentListings.length <= 1) {
      setDisplayState((current) =>
        current.signature === signature && current.storageKey === storageKey
          ? current
          : { signature, storageKey, items: currentListings },
      );
      writeStoredOrder(storageKey, currentListings.map((listing) => listing.id));
      return;
    }

    const previousOrder = readStoredOrder(storageKey);
    const shuffledListings = shuffleItemsForPageLoad(
      currentListings,
      (listing) => listing.id,
      previousOrder,
    );

    setDisplayState((current) =>
      current.signature === signature && current.storageKey === storageKey
        ? current
        : { signature, storageKey, items: shuffledListings },
    );
    writeStoredOrder(storageKey, shuffledListings.map((listing) => listing.id));
  }, [signature, storageKey]);

  const latestListingsById = useMemo(
    () => new Map(listings.map((listing) => [listing.id, listing])),
    [listings],
  );

  return useMemo(() => {
    if (displayState.signature !== signature || displayState.storageKey !== storageKey) {
      return listings;
    }

    return displayState.items.map((listing) => latestListingsById.get(listing.id) ?? listing);
  }, [displayState, latestListingsById, listings, signature, storageKey]);
}
