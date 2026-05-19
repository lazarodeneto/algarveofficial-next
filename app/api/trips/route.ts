import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/server/user-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  buildListingSnapshot,
  errorPayload,
  listTripsForUser,
  normalizeTripEventInput,
  tripErrorResponse,
  toTrip,
  tripEventWriteSchema,
  tripWriteSchema,
} from "@/lib/trips/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function readImportKey(metadata: Record<string, unknown> | undefined, key: "localDraftId" | "localEventId") {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function fetchImportedTrip(client: any, userId: string, localDraftId: string) {
  const { data, error } = await client
    .from("user_trips")
    .select("*")
    .eq("user_id", userId)
    .contains("metadata", { localDraftId })
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function fetchImportedEvent(client: any, userId: string, tripId: string, localEventId: string) {
  const { data, error } = await client
    .from("user_trip_events")
    .select("*")
    .eq("user_id", userId)
    .eq("trip_id", tripId)
    .contains("metadata", { localEventId })
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function loadTripEvents(client: any, userId: string, tripId: string) {
  const { data, error } = await client
    .from("user_trip_events")
    .select("*")
    .eq("user_id", userId)
    .eq("trip_id", tripId)
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const client = createServiceRoleClient();
  if (!client) {
    return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });
  }

  try {
    const trips = await listTripsForUser(client as any, auth.userId);
    return NextResponse.json({ trips }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      errorPayload("TRIPS_LOOKUP_FAILED", error instanceof Error ? error.message : "Failed to load trips."),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:create",
    email: auth.email,
    maxAttempts: 30,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorPayload("INVALID_JSON", "Request body must be valid JSON."), { status: 400 });
  }

  const parsed = tripWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorPayload("TRIP_VALIDATION_ERROR", "Invalid trip payload.", parsed.error.flatten()), {
      status: 400,
    });
  }

  const client = createServiceRoleClient();
  if (!client) {
    return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });
  }

  const payload = parsed.data;

  try {
    const normalizedEvents = [];
    for (const eventInput of payload.events ?? []) {
      const eventParsed = tripEventWriteSchema.safeParse(eventInput);
      if (!eventParsed.success) continue;
      const snapshot = await buildListingSnapshot(client as any, eventParsed.data.listing_id);
      normalizedEvents.push({
        localEventId: readImportKey(eventParsed.data.metadata, "localEventId"),
        payload: normalizeTripEventInput(eventParsed.data, snapshot),
      });
    }

    const localDraftId = readImportKey(payload.metadata, "localDraftId");
    let trip = localDraftId ? await fetchImportedTrip(client as any, auth.userId, localDraftId) : null;

    if (!trip) {
      const { data: insertedTrip, error: tripError } = await (client as any)
        .from("user_trips")
        .insert({
          user_id: auth.userId,
          title: payload.title,
          description: payload.description ?? null,
          start_date: payload.start_date ?? null,
          end_date: payload.end_date ?? null,
          party_size: payload.party_size ?? null,
          currency: payload.currency,
          status: payload.status,
          metadata: payload.metadata,
        })
        .select("*")
        .single();

      if (tripError) {
        if (localDraftId && tripError.code === "23505") {
          trip = await fetchImportedTrip(client as any, auth.userId, localDraftId);
        } else {
          throw tripError;
        }
      } else {
        trip = insertedTrip;
      }
    }

    if (!trip) {
      throw new Error("Failed to create or load imported trip.");
    }

    for (const eventInput of normalizedEvents) {
      const localEventId = eventInput.localEventId;
      if (localEventId) {
        const existingEvent = await fetchImportedEvent(client as any, auth.userId, trip.id, localEventId);
        if (existingEvent) continue;
      }

      const { error: eventError } = await (client as any)
        .from("user_trip_events")
        .insert({
          ...eventInput.payload,
          trip_id: trip.id,
          user_id: auth.userId,
        })
        .select("*")
        .single();
      if (eventError) {
        if (localEventId && eventError.code === "23505") {
          await fetchImportedEvent(client as any, auth.userId, trip.id, localEventId);
          continue;
        }
        throw eventError;
      }
    }

    const events = await loadTripEvents(client as any, auth.userId, trip.id);
    return NextResponse.json(
      { trip: toTrip(trip, events) },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const response = tripErrorResponse(error, "TRIP_CREATE_FAILED", "Failed to create trip.");
    return NextResponse.json(response.body, { status: response.status });
  }
}
