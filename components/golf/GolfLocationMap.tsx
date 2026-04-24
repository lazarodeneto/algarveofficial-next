"use client";

import dynamic from "next/dynamic";

import type { MapListingPoint } from "@/components/map/ListingsLeafletMap";

const ListingsLeafletMap = dynamic(() => import("@/components/map/ListingsLeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[320px] w-full animate-pulse bg-muted" />,
});

interface GolfLocationMapProps {
  listingId: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  tier?: string | null;
  featuredImageUrl?: string | null;
  href: string;
}

export function GolfLocationMap({
  listingId,
  name,
  slug,
  latitude,
  longitude,
  tier,
  featuredImageUrl,
  href,
}: GolfLocationMapProps) {
  const points: MapListingPoint[] = [
    {
      id: listingId,
      name,
      slug,
      latitude,
      longitude,
      tier,
      categorySlug: "golf",
      categoryName: "Golf",
      featuredImageUrl: featuredImageUrl ?? undefined,
      href,
      isPrimary: true,
    },
  ];

  return (
    <ListingsLeafletMap
      points={points}
      mapClassName="h-full min-h-[320px] w-full"
      className="h-full w-full"
      scrollWheelZoom={false}
      enableClustering={false}
      autoFit
      showPopups={false}
    />
  );
}
