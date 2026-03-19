"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { NavigationType, Router, createPath, type To } from "react-router";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import type { Tables } from "@/integrations/supabase/types";
import { useHydrated } from "@/hooks/useHydrated";

import dynamic from "next/dynamic";
const MapExplorerPage = dynamic(() => import("@/legacy-pages/public/listings/MapExplorer"), { 
  ssr: false,
  loading: () => <div className="h-screen bg-background animate-pulse" />
});

type LegacyNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

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

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

export default function MapClient({
  initialListings,
  initialCities,
  initialRegions,
  initialCategories,
}: MapClientProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const mounted = useHydrated();

  const search = nextSearchParams?.toString() ?? "";

  const location = useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
      state: null,
      key: `${pathname}${search ? `?${search}` : ""}`,
    }),
    [pathname, search],
  );

  const navigator = useMemo<LegacyNavigator>(
    () => ({
      createHref: (to) => resolveToPath(to),
      go: (delta) => {
        window.history.go(delta);
      },
      push: (to) => {
        router.push(resolveToPath(to));
      },
      replace: (to) => {
        router.replace(resolveToPath(to));
      },
    }),
    [router],
  );

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
      <Router
        location={location as never}
        navigator={navigator as never}
        navigationType={NavigationType.Pop}
      >
        <MapExplorerPage />
      </Router>
    </HelmetProvider>
  );
}
