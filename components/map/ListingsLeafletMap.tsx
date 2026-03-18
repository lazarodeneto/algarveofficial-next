"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryMapColor } from "@/lib/mapCategoryColors";
import "leaflet/dist/leaflet.css";

const ALGARVE_DEFAULT_CENTER: [number, number] = [37.08, -8.15];
const ALGARVE_DEFAULT_ZOOM = 9.5;

const TILE_LAYERS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?language=en",
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

function isValidLatLng(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

function isWithinBounds(
  latitude: number,
  longitude: number,
  bounds: [[number, number], [number, number]]
): boolean {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLng &&
    longitude <= maxLng
  );
}

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

function buildClusterNodes(
  points: MapListingPoint[],
  map: any,
  enableClustering: boolean
): ClusterNode[] {
  if (!enableClustering || points.length <= 1 || map.getZoom() >= 15) {
    return points.map((point) => ({ type: "point", point }));
  }

  const zoom = map.getZoom();
  const cellSize = getClusterCellSize(zoom);
  const buckets = new Map<string, MapListingPoint[]>();

  points.forEach((point) => {
    const projected = map.project([point.latitude, point.longitude], zoom);
    const key = `${Math.floor(projected.x / cellSize)}:${Math.floor(
      projected.y / cellSize
    )}`;
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

    const latitude =
      bucket.reduce((sum, point) => sum + point.latitude, 0) / bucket.length;
    const longitude =
      bucket.reduce((sum, point) => sum + point.longitude, 0) / bucket.length;

    const sortedSamples = [...bucket].sort((a, b) => {
      const tierOrder: Record<string, number> = {
        signature: 0,
        verified: 1,
        unverified: 2,
      };
      const aTier = tierOrder[a.tier || "unverified"] ?? 2;
      const bTier = tierOrder[b.tier || "unverified"] ?? 2;
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

function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeImageUrl(value: string | null | undefined): string {
  if (!value) return "/placeholder.svg";
  return value;
}

function getPointIcon(
  leaflet: any,
  color: string,
  categorySlug: string | null | undefined,
  isPrimary: boolean,
  tier?: string | null
) {
  const size = isPrimary ? 40 : 32;
  const iconSize = isPrimary ? 18 : 15;
  const tierAccent =
    tier === "signature"
      ? "#f59e0b"
      : tier === "verified"
        ? "#10b981"
        : "rgba(255,255,255,0.85)";

  const categoryKey = categorySlug?.toLowerCase().trim() || "default";

  return new leaflet.DivIcon({
    className: `listing-marker-icon category-${categoryKey}`,
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
          <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="6" />
          </svg>
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
}

function getClusterIcon(leaflet: any, color: string, count: number) {
  const size = count >= 100 ? 54 : count >= 30 ? 48 : 40;

  return new leaflet.DivIcon({
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
}

function buildPointPopupHtml(point: MapListingPoint, viewDetailsLabel: string) {
  const imageUrl = safeImageUrl(point.featuredImageUrl || point.categoryImageUrl);
  const tierBadge =
    point.tier === "signature" || point.tier === "verified"
      ? `<span style="
          display:inline-block;
          font-size:11px;
          font-weight:700;
          padding:4px 8px;
          border-radius:9999px;
          background:${point.tier === "signature" ? "#f59e0b" : "#10b981"};
          color:#fff;
        ">${escapeHtml(point.tier)}</span>`
      : "";

  const locationLine = `${escapeHtml(point.cityName || "Algarve")}${point.categoryName ? ` · ${escapeHtml(point.categoryName)}` : ""
    }`;

  const cta = point.href
    ? `<a href="${escapeHtml(point.href)}" style="
          display:inline-flex;
          width:100%;
          justify-content:center;
          align-items:center;
          border-radius:8px;
          background:#0f172a;
          color:#fff;
          text-decoration:none;
          padding:10px 12px;
          font-size:12px;
          font-weight:600;
          margin-top:6px;
        ">${escapeHtml(viewDetailsLabel)}</a>`
    : "";

  return `
    <div style="min-width:220px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <img
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(point.name)}"
        style="width:100%;height:112px;object-fit:cover;border-radius:8px;display:block;"
      />
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">${tierBadge}</div>
      <div style="margin-top:8px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(
    point.name
  )}</p>
        <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">${locationLine}</p>
      </div>
      ${cta}
    </div>
  `;
}

function buildClusterPopupHtml(node: Extract<ClusterNode, { type: "cluster" }>) {
  const items = node.samples
    .map(
      (sample) =>
        `<li style="margin:4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">• ${escapeHtml(
          sample.name
        )}</li>`
    )
    .join("");

  return `
    <div style="min-width:210px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#111827;">
        ${node.count} listings in this area
      </p>
      <ul style="margin:0;padding-left:0;list-style:none;font-size:12px;color:#6b7280;">
        ${items}
      </ul>
    </div>
  `;
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  const validPoints = useMemo(() => {
    return points
      .map((point) => ({
        ...point,
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
      }))
      .filter((point) => {
        if (!isValidLatLng(point.latitude, point.longitude)) return false;
        if (!enforceBoundsOnPoints || !maxBounds) return true;
        return isWithinBounds(point.latitude, point.longitude, maxBounds);
      });
  }, [enforceBoundsOnPoints, maxBounds, points]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (!cancelled) {
        setLeaflet(L);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const getDarkMode = () =>
      document.documentElement.classList.contains("dark");

    setIsDark(getDarkMode());

    const observer = new MutationObserver(() => {
      setIsDark(getDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!leaflet || !mapContainerRef.current || mapRef.current) return;

    const map = leaflet.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom,
      scrollWheelZoom,
      zoomAnimation: false,
      markerZoomAnimation: false,
      maxBounds: maxBounds ?? undefined,
      maxBoundsViscosity: maxBounds ? maxBoundsViscosity : undefined,
    });

    mapRef.current = map;
    markersLayerRef.current = leaflet.layerGroup().addTo(map);

    tileLayerRef.current = leaflet
      .tileLayer(isDark ? TILE_LAYERS.dark : TILE_LAYERS.light, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      })
      .addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [
    leaflet,
    defaultCenter,
    defaultZoom,
    minZoom,
    scrollWheelZoom,
    maxBounds,
    maxBoundsViscosity,
    isDark,
  ]);

  useEffect(() => {
    if (!tileLayerRef.current || !leaflet) return;

    tileLayerRef.current.setUrl(isDark ? TILE_LAYERS.dark : TILE_LAYERS.light);
  }, [isDark, leaflet]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !markersLayerRef.current) return;

    const map = mapRef.current;
    const layerGroup = markersLayerRef.current;
    const viewDetailsLabel = "View details";

    const renderMarkers = () => {
      if (!map || !layerGroup) return;

      layerGroup.clearLayers();

      const nodes = buildClusterNodes(validPoints, map, enableClustering);

      nodes.forEach((node) => {
        if (node.type === "point") {
          const point = node.point;
          const isActive = point.id === activeListingId;
          const color = getCategoryMapColor(point.categorySlug);
          const icon = getPointIcon(
            leaflet,
            color,
            point.categorySlug,
            Boolean(isActive || point.isPrimary),
            point.tier
          );

          const marker = leaflet.marker([point.latitude, point.longitude], {
            icon,
          });

          marker.on("click", () => {
            onListingSelect?.(point.id);
          });

          if (showPopups) {
            marker.bindPopup(buildPointPopupHtml(point, viewDetailsLabel), {
              minWidth: 220,
            });
          }

          marker.addTo(layerGroup);
          return;
        }

        const clusterColor = getCategoryMapColor(node.dominantCategorySlug);
        const clusterIcon = getClusterIcon(leaflet, clusterColor, node.count);

        const marker = leaflet.marker([node.latitude, node.longitude], {
          icon: clusterIcon,
        });

        marker.on("click", () => {
          const currentZoom = map.getZoom();
          const safeZoom = Number.isFinite(currentZoom)
            ? Math.min(currentZoom + 2, 17)
            : 13;

          map.setView([node.latitude, node.longitude], safeZoom, {
            animate: true,
          });
        });

        marker.bindPopup(buildClusterPopupHtml(node), {
          minWidth: 210,
        });

        marker.addTo(layerGroup);
      });
    };

    const fitMap = () => {
      if (!autoFit || !validPoints.length) return;

      const safePoints = validPoints.filter((point) => {
        if (!isValidLatLng(point.latitude, point.longitude)) return false;
        if (!maxBounds) return true;
        return isWithinBounds(point.latitude, point.longitude, maxBounds);
      });

      if (!safePoints.length) return;

      const focusedPoint = focusListingId
        ? safePoints.find((point) => point.id === focusListingId)
        : null;

      if (focusedPoint) {
        const currentZoom = map.getZoom();
        const safeZoom = Number.isFinite(currentZoom)
          ? Math.max(currentZoom, 14)
          : 14;

        map.setView(
          [focusedPoint.latitude, focusedPoint.longitude],
          safeZoom,
          { animate: false }
        );
        return;
      }

      const bounds = leaflet.latLngBounds(
        safePoints.map(
          (point) => [point.latitude, point.longitude] as [number, number]
        )
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: safePoints.length === 1 ? 15 : 12,
        });
      }
    };

    renderMarkers();
    fitMap();

    map.off("zoomend");
    map.off("moveend");
    map.on("zoomend", renderMarkers);
    map.on("moveend", renderMarkers);

    return () => {
      map.off("zoomend", renderMarkers);
      map.off("moveend", renderMarkers);
    };
  }, [
    leaflet,
    validPoints,
    enableClustering,
    activeListingId,
    showPopups,
    onListingSelect,
    autoFit,
    focusListingId,
    maxBounds,
  ]);

  if (!mounted || !leaflet) {
    return (
      <div
        className={cn(
          "rounded-xl overflow-hidden border border-border bg-muted/40",
          className
        )}
      >
        <div
          className={cn(
            "w-full min-h-[320px] flex items-center justify-center",
            mapClassName
          )}
        >
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  if (validPoints.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl overflow-hidden border border-border bg-muted/40",
          className
        )}
      >
        <div
          className={cn(
            "w-full min-h-[320px] flex items-center justify-center p-6",
            mapClassName
          )}
        >
          <p className="text-sm text-muted-foreground text-center">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border border-border relative z-0",
        className
      )}
    >
      <div
        ref={mapContainerRef}
        className={cn("w-full min-h-[320px]", mapClassName)}
        style={{ background: "hsl(var(--muted))" }}
      />
    </div>
  );
}

export default ListingsLeafletMap;