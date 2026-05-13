"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { divIcon, latLngBounds } from "leaflet";
import type { DivIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Calendar, ExternalLink, MapPin, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import type { CalendarEvent, EventCategory } from "@/types/events";
import { eventCategoryLabels } from "@/types/events";
import {
  getEventCompactDateRangeLabel,
  getEventDateBadgeParts,
} from "@/lib/events/dateDisplay";
import {
  getEventCardCategoryClass,
} from "@/lib/events/cardStyles";
import {
  getLocalizedEventPriceRange,
  getTranslatedEventCategoryLabel,
} from "@/lib/events/display";
import "leaflet/dist/leaflet.css";

const ALGARVE_CENTER: [number, number] = [37.08, -8.15];
const ALGARVE_BOUNDS: [[number, number], [number, number]] = [
  [36.92, -9.05],
  [37.35, -7.35],
];

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TABLET_MAP_QUERY = "(min-width: 768px)";

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  albufeira: { latitude: 37.0889, longitude: -8.2500 },
  almancil: { latitude: 37.0833, longitude: -8.0333 },
  carvoeiro: { latitude: 37.0962, longitude: -8.4720 },
  faro: { latitude: 37.0194, longitude: -7.9322 },
  lagoa: { latitude: 37.1333, longitude: -8.4500 },
  lagos: { latitude: 37.1028, longitude: -8.6731 },
  loule: { latitude: 37.1377, longitude: -8.0197 },
  olhao: { latitude: 37.0256, longitude: -7.8411 },
  portimao: { latitude: 37.1386, longitude: -8.5372 },
  quarteira: { latitude: 37.0692, longitude: -8.0997 },
  sagres: { latitude: 37.0092, longitude: -8.9414 },
  silves: { latitude: 37.1869, longitude: -8.4389 },
  tavira: { latitude: 37.1275, longitude: -7.6506 },
  vilamoura: { latitude: 37.0775, longitude: -8.1161 },
};

type EventMapPoint = CalendarEvent & {
  latitude: number;
  longitude: number;
  usedFallbackCoordinates: boolean;
};

interface EventMapDirectoryProps {
  events: CalendarEvent[];
  locale: string;
  activeEventId?: string | null;
  eventImageFallback: string;
  className?: string;
  onEventSelect?: (eventId: string) => void;
  getEventHref: (event: Pick<CalendarEvent, "slug">) => string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCityCoordinate(event: CalendarEvent) {
  const eventData = isRecord(event.event_data) ? event.event_data : {};
  const address = isRecord(eventData.address) ? eventData.address : {};
  const cityCandidates = [
    event.city?.slug,
    event.city?.name,
    typeof address.city === "string" ? address.city : null,
    event.location,
    event.venue,
  ];

  for (const candidate of cityCandidates) {
    const normalized = normalizeKey(candidate);
    if (CITY_COORDINATES[normalized]) return CITY_COORDINATES[normalized];

    const matchedKey = Object.keys(CITY_COORDINATES).find((key) => normalized.includes(key));
    if (matchedKey) return CITY_COORDINATES[matchedKey];
  }

  return null;
}

function getEventCoordinates(event: CalendarEvent): Pick<EventMapPoint, "latitude" | "longitude" | "usedFallbackCoordinates"> | null {
  const eventData = isRecord(event.event_data) ? event.event_data : {};
  const address = isRecord(eventData.address) ? eventData.address : {};
  const categoryData = isRecord(eventData.category_data) ? eventData.category_data : {};
  const candidates: Array<[unknown, unknown]> = [
    [eventData.latitude, eventData.longitude],
    [address.latitude, address.longitude],
    [categoryData.latitude, categoryData.longitude],
  ];

  for (const [rawLatitude, rawLongitude] of candidates) {
    const latitude = getNumber(rawLatitude);
    const longitude = getNumber(rawLongitude);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude, usedFallbackCoordinates: false };
    }
  }

  const fallback = inferCityCoordinate(event);
  if (!fallback) return null;

  return {
    ...fallback,
    usedFallbackCoordinates: true,
  };
}

function createEventMarkerIcon(isActive: boolean): DivIcon {
  return divIcon({
    className: "event-map-marker",
    html: `<span class="event-map-marker__pin${isActive ? " event-map-marker__pin--active" : ""}"><span></span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function subscribeToDesktopMapQuery(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(TABLET_MAP_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDesktopMapSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(TABLET_MAP_QUERY).matches;
}

function EventMapFitBounds({ points }: { points: EventMapPoint[] }) {
  const map = useMap();
  const pointsKey = useMemo(() => points.map((point) => point.id).join("|"), [points]);

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 11, { animate: false });
      return;
    }

    const bounds = latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]));
    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      paddingTopLeft: [32, 48],
      paddingBottomRight: [32, 148],
      maxZoom: 11,
      animate: false,
    });
  }, [map, points, pointsKey]);

  return null;
}

function EventMapFocus({ point }: { point: EventMapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), 11), { animate: true });
  }, [map, point]);

  return null;
}

export function EventMapDirectory({
  events,
  locale,
  activeEventId,
  eventImageFallback,
  className,
  onEventSelect,
  getEventHref,
}: EventMapDirectoryProps) {
  const hydrated = useHydrated();
  const isMapViewport = useSyncExternalStore(
    subscribeToDesktopMapQuery,
    getDesktopMapSnapshot,
    () => false,
  );
  const { t } = useTranslation();
  const points = useMemo(
    () =>
      events
        .map((event) => {
          const coordinates = getEventCoordinates(event);
          if (!coordinates) return null;
          return { ...event, ...coordinates };
        })
        .filter((event): event is EventMapPoint => Boolean(event)),
    [events],
  );
  const [localActiveEventId, setLocalActiveEventId] = useState<string | null>(null);
  const requestedSelectedEventId = activeEventId ?? localActiveEventId;
  const selectedEventId = requestedSelectedEventId ?? points[0]?.id ?? null;
  const selectedEvent = points.find((event) => event.id === selectedEventId) ?? points[0] ?? null;
  const focusedEvent = requestedSelectedEventId ? selectedEvent : null;

  const selectEvent = (eventId: string) => {
    setLocalActiveEventId(eventId);
    onEventSelect?.(eventId);
  };

  if (!hydrated || !isMapViewport) {
    return null;
  }

  if (points.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border bg-muted/30 p-6 text-center", className)}>
        <MapPin className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">{t("events.map.empty")}</p>
      </div>
    );
  }

  const selectedDateBadge = selectedEvent ? getEventDateBadgeParts(selectedEvent, locale) : null;
  const selectedPriceRange = selectedEvent ? getLocalizedEventPriceRange(selectedEvent.price_range, t) : null;
  const selectedCategory = selectedEvent?.category as EventCategory | undefined;
  const selectedCategoryLabel =
    selectedCategory
      ? getTranslatedEventCategoryLabel(selectedCategory, eventCategoryLabels[selectedCategory], t)
      : null;

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-58px_rgba(15,23,42,0.75)]", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground">{t("events.map.title")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("events.map.subtitle")}</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {points.length}
        </span>
      </div>

      <div className="event-map relative h-[calc(100vh-10rem)] min-h-[520px] bg-muted xl:h-[calc(100vh-13rem)] xl:min-h-[560px]">
        <MapContainer
            center={ALGARVE_CENTER}
            zoom={9}
            minZoom={8}
            maxBounds={ALGARVE_BOUNDS}
            maxBoundsViscosity={0.75}
            scrollWheelZoom
            zoomAnimation={false}
            markerZoomAnimation={false}
            className="h-full w-full"
            style={{ background: "hsl(var(--muted))" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url={TILE_URL}
            />
            <EventMapFitBounds points={points} />
            <EventMapFocus point={focusedEvent} />
            {points.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude, event.longitude]}
                icon={createEventMarkerIcon(event.id === selectedEvent?.id)}
                eventHandlers={{
                  click: () => selectEvent(event.id),
                  mouseover: () => selectEvent(event.id),
                }}
              />
            ))}
          </MapContainer>

        {selectedEvent && selectedDateBadge ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex justify-center sm:inset-x-4 sm:bottom-4">
            <article className="pointer-events-auto relative w-full max-w-[25rem] rounded-2xl border-[1.5px] border-green-500/55 bg-background/92 p-2 shadow-[0_22px_55px_-36px_rgba(22,163,74,0.9)] backdrop-blur-xl transition hover:border-green-600/80 hover:shadow-[0_28px_65px_-38px_rgba(22,163,74,0.95)]">
              <Link
                href={getEventHref(selectedEvent)}
                aria-label={t("events.openEvent", {
                  title: selectedEvent.title,
                  defaultValue: `Open ${selectedEvent.title}`,
                })}
                className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              />

              <div className="grid grid-cols-[6rem_1fr] gap-3 sm:grid-cols-[7rem_1fr]">
                <div className="relative h-28 overflow-hidden rounded-xl bg-muted sm:h-32">
                  <Image
                    src={selectedEvent.image || eventImageFallback}
                    alt={selectedEvent.title}
                    fill
                    unoptimized
                    sizes="112px"
                    className="object-cover"
                  />
                  <div className="absolute left-2 top-2 rounded-xl bg-white/95 px-2.5 py-1.5 text-center shadow-sm">
                    <div className="text-lg font-black leading-none tracking-tight text-slate-950">
                      {selectedDateBadge.primary}
                    </div>
                    <div className="mt-0.5 text-[9px] font-black uppercase leading-none text-red-600">
                      {selectedDateBadge.secondary}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 space-y-2 py-0.5 pr-0.5">
                  {selectedCategory && selectedCategoryLabel ? (
                    <span className={cn(getEventCardCategoryClass(selectedCategory), "max-w-full truncate px-2 py-0.5 text-[10px]")}>
                      {selectedCategoryLabel}
                    </span>
                  ) : null}

                  <div>
                    <h4 className="line-clamp-2 text-base font-bold leading-tight text-foreground">
                      {selectedEvent.title}
                    </h4>
                  </div>

                  <div className="space-y-1.5 text-[11px] leading-tight text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{getEventCompactDateRangeLabel(selectedEvent, locale)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{selectedEvent.venue || selectedEvent.location}</span>
                    </div>
                    {selectedPriceRange ? (
                      <div className="flex items-center gap-1.5 text-primary">
                        <Ticket className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{selectedPriceRange}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {selectedEvent.ticket_url ? (
                      <a
                        href={selectedEvent.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-20 inline-flex h-8 items-center justify-center gap-1 rounded-md border border-green-500 bg-green-600 px-2 text-center text-[11px] font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                      >
                        <span className="truncate">{t("events.card.buyTickets", "Buy Tickets")}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="inline-flex h-8 cursor-not-allowed items-center justify-center rounded-md border border-green-300 bg-green-100 px-2 text-center text-[11px] font-bold text-green-700/70"
                      >
                        {t("events.card.buyTickets", "Buy Tickets")}
                      </span>
                    )}
                    <Link
                      href={getEventHref(selectedEvent)}
                      className="relative z-20 inline-flex h-8 items-center justify-center rounded-md bg-slate-100 px-2 text-center text-[11px] font-bold text-slate-900 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                    >
                      {t("events.card.viewDetails", "View Details")}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EventMapDirectory;
