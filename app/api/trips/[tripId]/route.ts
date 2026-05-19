import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/server/user-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { errorPayload, toTrip, tripPatchSchema } from "@/lib/trips/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paramsSchema = z.object({ tripId: z.string().uuid() });

async function loadTrip(client: any, userId: string, tripId: string) {
  const { data: trip, error: tripError } = await client
    .from("user_trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (tripError) throw tripError;
  if (!trip) return null;

  const { data: events, error: eventsError } = await client
    .from("user_trip_events")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("day_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (eventsError) throw eventsError;
  return toTrip(trip, events ?? []);
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
    const trip = await loadTrip(client as any, auth.userId, parsedParams.data.tripId);
    if (!trip) return NextResponse.json(errorPayload("TRIP_NOT_FOUND", "Trip not found."), { status: 404 });
    return NextResponse.json({ trip }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      errorPayload("TRIP_LOOKUP_FAILED", error instanceof Error ? error.message : "Failed to load trip."),
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:update",
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

  const parsed = tripPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorPayload("TRIP_VALIDATION_ERROR", "Invalid trip payload.", parsed.error.flatten()), {
      status: 400,
    });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  const payload = parsed.data;

  try {
    const { data, error } = await (client as any)
      .from("user_trips")
      .update({
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined ? { description: payload.description ?? null } : {}),
        ...(payload.start_date !== undefined ? { start_date: payload.start_date ?? null } : {}),
        ...(payload.end_date !== undefined ? { end_date: payload.end_date ?? null } : {}),
        ...(payload.party_size !== undefined ? { party_size: payload.party_size ?? null } : {}),
        ...(payload.currency !== undefined ? { currency: payload.currency } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.metadata !== undefined ? { metadata: payload.metadata } : {}),
      })
      .eq("id", parsedParams.data.tripId)
      .eq("user_id", auth.userId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json(errorPayload("TRIP_NOT_FOUND", "Trip not found."), { status: 404 });

    const trip = await loadTrip(client as any, auth.userId, parsedParams.data.tripId);
    return NextResponse.json({ trip }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      errorPayload("TRIP_UPDATE_FAILED", error instanceof Error ? error.message : "Failed to update trip."),
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:delete",
    email: auth.email,
    maxAttempts: 30,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(errorPayload("TRIP_ID_INVALID", "A valid trip id is required."), { status: 400 });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  const { error, count } = await (client as any)
    .from("user_trips")
    .delete({ count: "exact" })
    .eq("id", parsedParams.data.tripId)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json(errorPayload("TRIP_DELETE_FAILED", error.message), { status: 500 });
  }

  if (!count) return NextResponse.json(errorPayload("TRIP_NOT_FOUND", "Trip not found."), { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
