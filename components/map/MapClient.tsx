"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { useHydrated } from "@/hooks/useHydrated";

import dynamic from "next/dynamic";
const MapExplorerPage = dynamic(() => import("@/legacy-pages/public/listings/MapExplorer"), { 
  ssr: false,
  loading: () => <div className="h-screen bg-background animate-pulse" />
});

type MapListingSeed = Pick<
  Tables<"listings">,
  "id" | "name" | "slug" | "latitude" | "longitude" | "tier" | "featured_image_url"
> & {
  city?: Pick<Tables<"cities">, "id" | "name" | "slug" | "latitude" | "longitude"> | null;
  region?: Pick<Tables<"regions">, "id" | "name" | "slug"> | null;
  category?: Pick<Tables<"categories">, "id" | "name" | "slug" | "image_url"> | null;
};

type CitySeed = Tables<"cities">;
type RegionSeed = Tables<"regions">;
type CategorySeed = Tables<"categories">;

export interface MapClientProps {
  locale?: string;
  initialListings: MapListingSeed[];
  initialCities: CitySeed[];
  initialRegions: RegionSeed[];
  initialCategories: CategorySeed[];
}

const DEFAULT_LISTING_FILTERS = {};

export default function MapClient({
  locale = "en",
  initialListings,
  initialCities,
  initialRegions,
  initialCategories,
}: MapClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["cities", locale], initialCities);
    queryClient.setQueryData(["regions", locale], initialRegions);
    queryClient.setQueryData(["categories", locale], initialCategories);
    queryClient.setQueryData(
      ["listings", "published", DEFAULT_LISTING_FILTERS, locale],
      initialListings,
    );

    const serverShell = document.getElementById("map-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialCategories, initialCities, initialListings, initialRegions, locale, queryClient]);

  if (!mounted) {
    return null;
  }

  return <MapExplorerPage />;
}
