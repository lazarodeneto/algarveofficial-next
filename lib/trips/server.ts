import { z } from "zod";

import type { Trip, TripEvent } from "@/types/tripPlanner";

export class TripRouteError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "TripRouteError";
    this.status = status;
    this.code = code;
  }
}

export const tripWriteSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
  party_size: z.number().int().positive().max(100).optional().nullable(),
  currency: z.string().trim().length(3).optional().default("EUR"),
  status: z.enum(["planning", "active", "completed", "archived"]).optional().default("planning"),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  events: z.array(z.unknown()).optional(),
});

export const tripPatchSchema = tripWriteSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one trip field is required.",
});

export const tripEventWriteSchema = z.object({
  event_type: z.string().trim().min(1).max(80).optional().default("listing"),
  listing_id: z.string().uuid().optional().nullable(),
  external_event_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  day_date: z.string().date().optional().nullable(),
  date: z.string().date().optional().nullable(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  time_slot: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  estimated_cost_cents: z.number().int().min(0).optional().nullable(),
  estimated_cost: z.number().min(0).optional().nullable(),
  currency: z.string().trim().length(3).optional().default("EUR"),
  snapshot: z.record(z.string(), z.unknown()).optional().default({}),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const tripEventPatchSchema = tripEventWriteSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one trip event field is required.",
});

export function errorPayload(code: string, message: string, details?: unknown) {
  return {
    error: {
      code,
      message,
      details: details ?? null,
    },
  };
}

export function toTrip(row: any, events: any[] = []): Trip {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? "",
    party_size: row.party_size ?? undefined,
    currency: row.currency ?? "EUR",
    status: row.status ?? "planning",
    metadata: row.metadata ?? {},
    events: events.map(toTripEvent),
    total_estimated_cost: events.reduce((sum, event) => sum + ((event.estimated_cost_cents ?? 0) / 100), 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function toTripEvent(row: any): TripEvent {
  return {
    id: row.id,
    trip_id: row.trip_id,
    listing_id: row.listing_id ?? "",
    event_type: row.event_type ?? "listing",
    title: row.title,
    date: row.day_date ?? "",
    day_date: row.day_date ?? "",
    time_slot: row.start_time ? String(row.start_time).slice(0, 5) : undefined,
    start_time: row.start_time ? String(row.start_time).slice(0, 5) : undefined,
    end_time: row.end_time ? String(row.end_time).slice(0, 5) : undefined,
    notes: row.notes ?? undefined,
    estimated_cost: row.estimated_cost_cents != null ? row.estimated_cost_cents / 100 : undefined,
    estimated_cost_cents: row.estimated_cost_cents ?? undefined,
    currency: row.currency ?? "EUR",
    snapshot: row.snapshot ?? {},
    metadata: row.metadata ?? {},
  };
}

export async function buildListingSnapshot(client: any, listingId: string | null | undefined) {
  if (!listingId) return {};

  const { data, error } = await client
    .from("listings")
    .select("id, name, featured_image_url, city:cities(name), category:categories(name, slug)")
    .eq("id", listingId)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new TripRouteError(404, "LISTING_NOT_PUBLIC", "Listing is not available for trip planning.");
  }

  return {
    listing_name: data.name ?? null,
    city: Array.isArray(data.city) ? data.city[0]?.name ?? null : data.city?.name ?? null,
    image_url: data.featured_image_url ?? null,
    category: Array.isArray(data.category) ? data.category[0]?.name ?? null : data.category?.name ?? null,
    category_slug: Array.isArray(data.category) ? data.category[0]?.slug ?? null : data.category?.slug ?? null,
  };
}

export async function listTripsForUser(client: any, userId: string) {
  const { data: trips, error: tripsError } = await client
    .from("user_trips")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (tripsError) throw tripsError;

  const tripRows = trips ?? [];
  if (tripRows.length === 0) return [];

  const { data: events, error: eventsError } = await client
    .from("user_trip_events")
    .select("*")
    .in("trip_id", tripRows.map((trip: any) => trip.id))
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (eventsError) throw eventsError;

  const eventsByTrip = new Map<string, any[]>();
  for (const event of events ?? []) {
    const list = eventsByTrip.get(event.trip_id) ?? [];
    list.push(event);
    eventsByTrip.set(event.trip_id, list);
  }

  return tripRows.map((trip: any) => toTrip(trip, eventsByTrip.get(trip.id) ?? []));
}

export function normalizeTripEventInput(input: z.infer<typeof tripEventWriteSchema>, snapshot: Record<string, unknown>) {
  const estimatedCostCents =
    input.estimated_cost_cents ??
    (input.estimated_cost != null ? Math.round(input.estimated_cost * 100) : null);

  return {
    event_type: input.event_type ?? "listing",
    listing_id: input.listing_id ?? null,
    external_event_id: input.external_event_id ?? null,
    title: input.title?.trim() || (snapshot.listing_name as string | undefined) || "Trip activity",
    notes: input.notes?.trim() || null,
    day_date: input.day_date ?? input.date ?? null,
    start_time: input.start_time ?? input.time_slot ?? null,
    end_time: input.end_time ?? null,
    sort_order: input.sort_order ?? 0,
    estimated_cost_cents: estimatedCostCents,
    currency: input.currency ?? "EUR",
    snapshot: {
      ...snapshot,
      ...(input.snapshot ?? {}),
    },
    metadata: input.metadata ?? {},
  };
}

export function tripErrorResponse(error: unknown, fallbackCode: string, fallbackMessage: string) {
  const typed = error as { status?: number; code?: string; message?: string };
  return {
    status: typed.status ?? 500,
    body: errorPayload(typed.code ?? fallbackCode, typed.message ?? fallbackMessage),
  };
}
