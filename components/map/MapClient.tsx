"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
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
  initialListings: MapListingSeed[];
  initialCities: CitySeed[];
  initialRegions: RegionSeed[];
  initialCategories: CategorySeed[];
}

const DEFAULT_LOCALE = "en";
const DEFAULT_LISTING_FILTERS = {};

export default function MapClient({
  initialListings,
  initialCities,
  initialRegions,
  initialCategories,
}: MapClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["cities", DEFAULT_LOCALE], initialCities);
    queryClient.setQueryData(["regions", DEFAULT_LOCALE], initialRegions);
    queryClient.setQueryData(["categories", DEFAULT_LOCALE], initialCategories);
    queryClient.setQueryData(
      ["listings", "published", DEFAULT_LISTING_FILTERS, DEFAULT_LOCALE],
      initialListings,
    );

    const serverShell = document.getElementById("map-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialCategories, initialCities, initialListings, initialRegions, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <HelmetProvider>
      <MapExplorerPage />
    </HelmetProvider>
  );
}
