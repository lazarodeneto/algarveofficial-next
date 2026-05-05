"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import type { ListingWithRelations } from "@/hooks/useListings";
import { shuffleItemsForPageLoad } from "@/lib/listings/page-load-shuffle";

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type StoredOrderState<T> = {
  signature: string;
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
  const signature = useMemo(
    () => listings.map((listing) => listing.id).join("\u001F"),
    [listings],
  );
  const [displayState, setDisplayState] = useState<StoredOrderState<T>>({
    signature,
    items: listings,
  });

  useBrowserLayoutEffect(() => {
    if (listings.length <= 1) {
      setDisplayState({ signature, items: listings });
      writeStoredOrder(storageKey, listings.map((listing) => listing.id));
      return;
    }

    const previousOrder = readStoredOrder(storageKey);
    const shuffledListings = shuffleItemsForPageLoad(
      listings,
      (listing) => listing.id,
      previousOrder,
    );

    setDisplayState({ signature, items: shuffledListings });
    writeStoredOrder(storageKey, shuffledListings.map((listing) => listing.id));
  }, [listings, signature, storageKey]);

  return displayState.signature === signature ? displayState.items : listings;
}
