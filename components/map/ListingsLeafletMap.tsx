"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DivIcon, latLngBounds, Map as LeafletMap } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getCategoryMapColor } from "@/lib/mapCategoryColors";
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

const markerIconCache = new Map<string, DivIcon>();
const clusterIconCache = new Map<string, DivIcon>();

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
  href?: string;
  isPrimary?: boolean;
}

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

type ClusterNode =
  | {
      type: "point";
      point: MapListingPoint;
    }
  | {
      type: "cluster";
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      dominantCategorySlug?: string | null;
      samples: MapListingPoint[];
    };

function getClusterCellSize(zoom: number): number {
  if (zoom >= 15) return 34;
  if (zoom >= 13) return 44;
  if (zoom >= 11) return 58;
  if (zoom >= 9) return 74;
  return 92;
}

function getDominantCategorySlug(points: MapListingPoint[]): string | null {
  const counts = new Map<string, number>();

  points.forEach((point) => {
    if (!point.categorySlug) return;
    counts.set(point.categorySlug, (counts.get(point.categorySlug) || 0) + 1);
  });

  let dominantSlug: string | null = null;
  let dominantCount = -1;
  counts.forEach((count, slug) => {
    if (count > dominantCount) {
      dominantSlug = slug;
      dominantCount = count;
    }
  });

  return dominantSlug;
}

function buildClusterNodes(points: MapListingPoint[], map: LeafletMap, enableClustering: boolean): ClusterNode[] {
  if (!enableClustering || points.length <= 1 || map.getZoom() >= 15) {
    return points.map((point) => ({ type: "point", point }));
  }

  const zoom = map.getZoom();
  const cellSize = getClusterCellSize(zoom);
  const buckets = new Map<string, MapListingPoint[]>();

  points.forEach((point) => {
    const projected = map.project([point.latitude, point.longitude], zoom);
    const key = `${Math.floor(projected.x / cellSize)}:${Math.floor(projected.y / cellSize)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(point);
    } else {
      buckets.set(key, [point]);
    }
  });

  const nodes: ClusterNode[] = [];

  buckets.forEach((bucket, key) => {
    if (bucket.length === 1) {
      nodes.push({ type: "point", point: bucket[0] });
      return;
    }

    const latitude = bucket.reduce((sum, point) => sum + point.latitude, 0) / bucket.length;
    const longitude = bucket.reduce((sum, point) => sum + point.longitude, 0) / bucket.length;
    const sortedSamples = [...bucket].sort((a, b) => {
      const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
      const aTier = (tierOrder[a.tier || "unverified"]) ?? 2;
      const bTier = (tierOrder[b.tier || "unverified"]) ?? 2;
      if (aTier !== bTier) return aTier - bTier;
      return a.name.localeCompare(b.name);
    });

    nodes.push({
      type: "cluster",
      id: key,
      latitude,
      longitude,
      count: bucket.length,
      dominantCategorySlug: getDominantCategorySlug(bucket),
      samples: sortedSamples.slice(0, 5),
    });
  });

  return nodes;
}

function getPointIcon(
  color: string,
  categorySlug: string | null | undefined,
  isPrimary: boolean,
  tier?: string | null
): DivIcon {
  const tierKey = tier ?? "unverified";
  const categoryKey = categorySlug?.toLowerCase().trim() ?? "default";
  const cacheKey = `${color}:${categoryKey}:${isPrimary ? "primary" : "default"}:${tierKey}`;
  const cached = markerIconCache.get(cacheKey);
  if (cached) return cached;

  const size = isPrimary ? 40 : 32;
  const tierAccent =
    tier === "signature" ? "#f59e0b" : tier === "verified" ? "#10b981" : "rgba(255,255,255,0.85)";
  const markerLabel = categoryKey.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase() ?? "•";

  const icon = new DivIcon({
    className: "listing-marker-icon",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          width:100%;
          height:100%;
          border-radius:9999px;
          background:${color};
          border:3px solid #fff;
          box-shadow:0 8px 20px rgba(0,0,0,.35), 0 0 0 2px rgba(15,23,42,.15);
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            color:#ffffff;
            font-weight:800;
            font-size:${isPrimary ? 15 : 12}px;
            line-height:1;
            transform:translateY(-0.25px);
            font-family:var(--font-sans), ui-sans-serif, system-ui, sans-serif;
          ">
            ${markerLabel}
          </div>
        </div>
        <div style="
          position:absolute;
          right:-2px;
          top:-2px;
          width:11px;
          height:11px;
          border-radius:9999px;
          background:${tierAccent};
          border:2px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,.35);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

  markerIconCache.set(cacheKey, icon);
  return icon;
}

function getClusterIcon(color: string, count: number): DivIcon {
  const size = count >= 100 ? 54 : count >= 30 ? 48 : 40;
  const cacheKey = `${color}:${size}:${count >= 100 ? "100+" : count >= 30 ? "30+" : "default"}`;
  const cached = clusterIconCache.get(cacheKey);
  if (cached) return cached;

  const icon = new DivIcon({
    className: "listing-cluster-icon",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:linear-gradient(135deg, ${color}, #0f172a);
        border:3px solid rgba(255,255,255,.95);
        box-shadow:0 10px 22px rgba(0,0,0,.38);
        color:#fff;
        font-size:${count >= 100 ? 14 : 13}px;
        font-weight:800;
        display:flex;
        align-items:center;
        justify-content:center;
        letter-spacing:.01em;
      ">
        ${count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
}

function AutoFitBounds({
  points,
  focusListingId,
  maxBounds,
}: {
  points: MapListingPoint[];
  focusListingId?: string | null;
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
      const focusedPoint = focusListingId ? safePoints.find((point) => point.id === focusListingId) : null;
      if (focusedPoint && isValidLatLng(focusedPoint.latitude, focusedPoint.longitude)) {
        const currentZoom = map.getZoom();
        const safeZoom = Number.isFinite(currentZoom) ? Math.max(currentZoom, 14) : 14;
        map.setView([focusedPoint.latitude, focusedPoint.longitude], safeZoom, { animate: false });
        return;
      }

      if (previousPointsKey.current === pointsKey) return;
      previousPointsKey.current = pointsKey;

      const bounds = latLngBounds(safePoints.map((point) => [point.latitude, point.longitude] as [number, number]));
      if (!bounds.isValid()) return;

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: safePoints.length === 1 ? 15 : 12,
      });
    });
  }, [focusListingId, map, maxBounds, points, pointsKey]);

  return null;
}

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
  const map = useMap();
  const [, setViewportTick] = useState(0);

  useMapEvents({
    zoomend: () => setViewportTick((tick) => tick + 1),
    moveend: () => setViewportTick((tick) => tick + 1),
  });

  const nodes = buildClusterNodes(points, map, enableClustering);

  return (
    <>
      {nodes.map((node) => {
        if (node.type === "point") {
          const point = node.point;
          const isActive = point.id === activeListingId;
          const color = getCategoryMapColor(point.categorySlug);
          const icon = getPointIcon(color, point.categorySlug, Boolean(isActive || point.isPrimary), point.tier);

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onListingSelect?.(point.id),
              }}
            >
              {showPopups && (
                <Popup className="listing-map-popup" minWidth={220}>
                  <div className="space-y-2 min-w-[220px]">
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
                        {t("sections.curated.viewDetails")}
                      </Link>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        }

        const clusterColor = getCategoryMapColor(node.dominantCategorySlug);
        const clusterIcon = getClusterIcon(clusterColor, node.count);

        return (
          <Marker
            key={`cluster-${node.id}`}
            position={[node.latitude, node.longitude]}
            icon={clusterIcon}
            eventHandlers={{
              click: () => {
                const currentZoom = map.getZoom();
                const safeZoom = Number.isFinite(currentZoom) ? Math.min(currentZoom + 2, 17) : 13;
                map.setView([node.latitude, node.longitude], safeZoom, { animate: true });
              },
            }}
          >
            {showPopups && (
              <Popup>
                <div className="min-w-[210px] space-y-2">
                  <p className="text-sm font-semibold text-foreground">{node.count} listings in this area</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {node.samples.map((sample) => (
                      <li key={sample.id} className="line-clamp-1">
                        • {sample.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
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
}: ListingsLeafletMapProps) {
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

        {autoFit && <AutoFitBounds points={validPoints} focusListingId={focusListingId} maxBounds={maxBounds} />}

        <ClusteredMarkers
          points={validPoints}
          enableClustering={enableClustering}
          activeListingId={activeListingId}
          showPopups={showPopups}
          onListingSelect={onListingSelect}
        />
      </MapContainer>
    </div>
  );
}

export default ListingsLeafletMap;
