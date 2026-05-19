import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/server/user-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  buildListingSnapshot,
  errorPayload,
  normalizeTripEventInput,
  tripErrorResponse,
  toTripEvent,
  tripEventWriteSchema,
} from "@/lib/trips/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paramsSchema = z.object({ tripId: z.string().uuid() });

async function assertTrip(client: any, userId: string, tripId: string) {
  const { data, error } = await client
    .from("user_trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(errorPayload("TRIP_ID_INVALID", "A valid trip id is required."), { status: 400 });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  try {
    if (!(await assertTrip(client as any, auth.userId, parsedParams.data.tripId))) {
      return NextResponse.json(errorPayload("TRIP_NOT_FOUND", "Trip not found."), { status: 404 });
    }

    const { data, error } = await (client as any)
      .from("user_trip_events")
      .select("*")
      .eq("trip_id", parsedParams.data.tripId)
      .eq("user_id", auth.userId)
      .order("day_date", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ events: (data ?? []).map(toTripEvent) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      errorPayload("TRIP_EVENTS_LOOKUP_FAILED", error instanceof Error ? error.message : "Failed to load trip events."),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:events:create",
    email: auth.email,
    maxAttempts: 60,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(errorPayload("TRIP_ID_INVALID", "A valid trip id is required."), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorPayload("INVALID_JSON", "Request body must be valid JSON."), { status: 400 });
  }

  const parsed = tripEventWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorPayload("TRIP_EVENT_VALIDATION_ERROR", "Invalid trip event payload.", parsed.error.flatten()), {
      status: 400,
    });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  try {
    if (!(await assertTrip(client as any, auth.userId, parsedParams.data.tripId))) {
      return NextResponse.json(errorPayload("TRIP_NOT_FOUND", "Trip not found."), { status: 404 });
    }

    const snapshot = await buildListingSnapshot(client as any, parsed.data.listing_id);
    const normalized = normalizeTripEventInput(parsed.data, snapshot);

    const { data, error } = await (client as any)
      .from("user_trip_events")
      .insert({
        ...normalized,
        trip_id: parsedParams.data.tripId,
        user_id: auth.userId,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ event: toTripEvent(data) }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const response = tripErrorResponse(error, "TRIP_EVENT_CREATE_FAILED", "Failed to create trip event.");
    return NextResponse.json(response.body, { status: response.status });
  }
}
