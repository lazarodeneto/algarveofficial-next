"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { divIcon, latLngBounds, point, type DivIcon, type Map as LeafletMap } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { createMarker } from "@/lib/map/mapMarkerFactory";
import { useOptionalMapSync } from "@/lib/map/MapSyncContext";
import { useHydrated } from "@/hooks/useHydrated";
import ListingImage from "@/components/ListingImage";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import "leaflet/dist/leaflet.css";

const ALGARVE_DEFAULT_CENTER: [number, number] = [37.08, -8.15];
const ALGARVE_DEFAULT_ZOOM = 9.5;

const TILE_LAYERS = {
  dark: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?language=en",
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?language=en",
};

export interface MapListingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  slug?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  categoryImageUrl?: string | null;
  cityName?: string | null;
  tier?: string | null;
  featuredImageUrl?: string | null;
  priceFrom?: number | null;
  priceCurrency?: string | null;
  href?: string;
  isPrimary?: boolean;
}

export type MapViewportBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

interface ListingsLeafletMapProps {
  points: MapListingPoint[];
  className?: string;
  mapClassName?: string;
  emptyMessage?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  scrollWheelZoom?: boolean;
  enableClustering?: boolean;
  autoFit?: boolean;
  showPopups?: boolean;
  maxBounds?: [[number, number], [number, number]];
  maxBoundsViscosity?: number;
  minZoom?: number;
  enforceBoundsOnPoints?: boolean;
  activeListingId?: string | null;
  focusListingId?: string | null;
  onListingSelect?: (listingId: string) => void;
  onBoundsChange?: (bounds: MapViewportBounds) => void;
}

function isValidLatLng(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

function isWithinBounds(
  latitude: number,
  longitude: number,
  bounds: [[number, number], [number, number]]
): boolean {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng;
}

type MarkerCluster = {
  getChildCount: () => number;
};

function createClusterCustomIcon(cluster: MarkerCluster): DivIcon {
  const count = cluster.getChildCount();
  const size = count >= 100 ? 54 : count >= 30 ? 48 : 40;

  return divIcon({
    html: `<div class="custom-cluster-icon__bubble">${count}</div>`,
    className: "custom-cluster-icon",
    iconSize: point(size, size, true),
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function AutoFitBounds({
  points,
  maxBounds,
}: {
  points: MapListingPoint[];
  maxBounds?: [[number, number], [number, number]];
}) {
  const map = useMap();
  const previousPointsKey = useRef<string>("");
  const pointsKey = useMemo(() => points.map((point) => point.id).join("|"), [points]);

  useEffect(() => {
    const safePoints = points.filter((point) => {
      if (!isValidLatLng(point.latitude, point.longitude)) return false;
      if (!maxBounds) return true;
      return isWithinBounds(point.latitude, point.longitude, maxBounds);
    });
    if (safePoints.length === 0) return;

    map.whenReady(() => {
      if (previousPointsKey.current === pointsKey) return;
      previousPointsKey.current = pointsKey;

      const bounds = latLngBounds(safePoints.map((point) => [point.latitude, point.longitude] as [number, number]));
      if (!bounds.isValid()) return;

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: safePoints.length === 1 ? 15 : 12,
      });
    });
  }, [map, maxBounds, points, pointsKey]);

  return null;
}

function FlyToActivePoint({
  points,
  activeListingId,
}: {
  points: MapListingPoint[];
  activeListingId?: string | null;
}) {
  const map = useMap();
  const previousActiveId = useRef<string | null>(null);

  useEffect(() => {
    if (!activeListingId || previousActiveId.current === activeListingId) return;

    const activePoint = points.find((point) => point.id === activeListingId);
    if (!activePoint || !isValidLatLng(activePoint.latitude, activePoint.longitude)) return;

    previousActiveId.current = activeListingId;
    const currentZoom = map.getZoom();
    const safeZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, 14) : 14;

    map.flyTo([activePoint.latitude, activePoint.longitude], safeZoom, {
      animate: true,
      duration: 0.45,
    });
  }, [activeListingId, map, points]);

  return null;
}

function BoundsChangeListener({ onBoundsChange }: { onBoundsChange?: (bounds: MapViewportBounds) => void }) {
  const timeoutRef = useRef<number | null>(null);

  const emitBounds = useCallback((map: LeafletMap) => {
    if (!onBoundsChange) return;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }, 180);
  }, [onBoundsChange]);

  const map = useMapEvents({
    moveend: () => emitBounds(map),
    zoomend: () => emitBounds(map),
  });

  useEffect(() => {
    emitBounds(map);
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [emitBounds, map]);

  return null;
}

const ListingPointMarker = memo(function ListingPointMarker({
  point,
  isActive,
  showPopups,
  viewDetailsLabel,
  onListingSelect,
}: {
  point: MapListingPoint;
  isActive: boolean;
  showPopups: boolean;
  viewDetailsLabel: string;
  onListingSelect?: (listingId: string) => void;
}) {
  const icon = createMarker({
    category: point.categorySlug,
    tier: point.tier,
    price: point.priceFrom,
    currency: point.priceCurrency,
    isActive: Boolean(isActive || point.isPrimary),
  });

  return (
    <Marker
      position={[point.latitude, point.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          onListingSelect?.(point.id);
          document.getElementById(`listing-${point.id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        },
      }}
    >
      {showPopups && (
        <Popup className="listing-map-popup" minWidth={180}>
          <div className="w-[min(220px,calc(100vw-7rem))] space-y-2">
            <ListingImage
              src={point.featuredImageUrl}
              category={point.categorySlug}
              categoryImageUrl={point.categoryImageUrl}
              listingId={point.id}
              alt={point.name}
              fill
              className="h-28 rounded-md"
            />

            <div className="flex items-center gap-2">
              {(point.tier === "signature" || point.tier === "verified") && (
                <ListingTierBadge tier={point.tier} size="sm" />
              )}
            </div>

            <div>
              <p className="font-medium text-foreground line-clamp-1">{point.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {point.cityName ?? "Algarve"}
                {point.categoryName ? ` · ${point.categoryName}` : ""}
              </p>
            </div>

            {point.href && (
              <Link
                href={point.href}
                className="inline-flex items-center justify-center w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {viewDetailsLabel}
              </Link>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  );
});

function ClusteredMarkers({
  points,
  enableClustering,
  activeListingId,
  showPopups,
  onListingSelect,
}: {
  points: MapListingPoint[];
  enableClustering: boolean;
  activeListingId?: string | null;
  showPopups: boolean;
  onListingSelect?: (listingId: string) => void;
}) {
  const { t } = useTranslation();
  const viewDetailsLabel = t("sections.curated.viewDetails");
  const markers = (
    <>
      {points.map((point) => (
        <ListingPointMarker
          key={point.id}
          point={point}
          isActive={point.id === activeListingId}
          showPopups={showPopups}
          viewDetailsLabel={viewDetailsLabel}
          onListingSelect={onListingSelect}
        />
      ))}
    </>
  );

  if (!enableClustering) {
    return markers;
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      iconCreateFunction={createClusterCustomIcon}
    >
      {markers}
    </MarkerClusterGroup>
  );
}

export function ListingsLeafletMap({
  points,
  className,
  mapClassName,
  emptyMessage = "No locations available for this view.",
  defaultCenter = ALGARVE_DEFAULT_CENTER,
  defaultZoom = ALGARVE_DEFAULT_ZOOM,
  scrollWheelZoom = true,
  enableClustering = true,
  autoFit = true,
  showPopups = true,
  maxBounds,
  maxBoundsViscosity = 1,
  minZoom = 8,
  enforceBoundsOnPoints = false,
  activeListingId,
  focusListingId,
  onListingSelect,
  onBoundsChange,
}: ListingsLeafletMapProps) {
  const mapSync = useOptionalMapSync();
  const hydrated = useHydrated();
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  const validPoints = useMemo(
    () => {
      return points
        .map((point) => {
          const latitude = Number(point.latitude);
          const longitude = Number(point.longitude);
          return {
            ...point,
            latitude,
            longitude,
          };
        })
        .filter((point) => {
          if (!isValidLatLng(point.latitude, point.longitude)) return false;
          if (!enforceBoundsOnPoints || !maxBounds) return true;
          return isWithinBounds(point.latitude, point.longitude, maxBounds);
        });
    },
    [enforceBoundsOnPoints, maxBounds, points]
  );

  useEffect(() => {
    if (!hydrated) return;

    const getDarkMode = () => document.documentElement.classList.contains("dark");

    const observer = new MutationObserver(() => {
      setIsDark(getDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [hydrated]);

  const tileUrl = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;
  const syncedActiveListingId = activeListingId ?? focusListingId ?? mapSync?.activeId ?? null;
  const handleListingSelect = onListingSelect ?? mapSync?.setActiveId;

  if (!hydrated) {
    return (
      <div className={cn("rounded-xl overflow-hidden border border-border bg-muted/40", className)}>
        <div className={cn("w-full min-h-[320px] flex items-center justify-center", mapClassName)}>
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  if (validPoints.length === 0) {
    return (
      <div className={cn("rounded-xl overflow-hidden border border-border bg-muted/40", className)}>
        <div className={cn("w-full min-h-[320px] flex items-center justify-center p-6", mapClassName)}>
          <p className="text-sm text-muted-foreground text-center">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border relative z-0", className)}>
      {isDark ? (
        <div className="absolute inset-0 z-[400] pointer-events-none bg-black/25 mix-blend-multiply" />
      ) : null}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={minZoom}
        scrollWheelZoom={scrollWheelZoom}
        zoomAnimation={false}
        markerZoomAnimation={false}
        maxBounds={maxBounds}
        maxBoundsViscosity={maxBounds ? maxBoundsViscosity : undefined}
        className={cn("w-full min-h-[320px]", mapClassName)}
        style={{ background: "hsl(var(--muted))" }}
      >
        <TileLayer
          key={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />

        {autoFit && <AutoFitBounds points={validPoints} maxBounds={maxBounds} />}
        <BoundsChangeListener onBoundsChange={onBoundsChange} />
        <FlyToActivePoint points={validPoints} activeListingId={syncedActiveListingId} />

        <ClusteredMarkers
          points={validPoints}
          enableClustering={enableClustering}
          activeListingId={syncedActiveListingId}
          showPopups={showPopups}
          onListingSelect={handleListingSelect}
        />
      </MapContainer>
    </div>
  );
}

export default ListingsLeafletMap;
