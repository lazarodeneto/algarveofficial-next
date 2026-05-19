import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/server/user-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  buildListingSnapshot,
  errorPayload,
  tripErrorResponse,
  toTripEvent,
  tripEventPatchSchema,
} from "@/lib/trips/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const paramsSchema = z.object({
  tripId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ tripId: string; eventId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:events:update",
    email: auth.email,
    maxAttempts: 90,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(errorPayload("TRIP_EVENT_ID_INVALID", "Valid trip and event ids are required."), { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorPayload("INVALID_JSON", "Request body must be valid JSON."), { status: 400 });
  }

  const parsed = tripEventPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(errorPayload("TRIP_EVENT_VALIDATION_ERROR", "Invalid trip event payload.", parsed.error.flatten()), {
      status: 400,
    });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  try {
    const snapshot =
      parsed.data.listing_id !== undefined
        ? await buildListingSnapshot(client as any, parsed.data.listing_id)
        : undefined;

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.event_type !== undefined) updatePayload.event_type = parsed.data.event_type;
    if (parsed.data.listing_id !== undefined) updatePayload.listing_id = parsed.data.listing_id ?? null;
    if (parsed.data.external_event_id !== undefined) updatePayload.external_event_id = parsed.data.external_event_id ?? null;
    if (parsed.data.title !== undefined) {
      updatePayload.title = parsed.data.title?.trim() || (snapshot?.listing_name as string | undefined) || "Trip activity";
    }
    if (parsed.data.notes !== undefined) updatePayload.notes = parsed.data.notes?.trim() || null;
    if (parsed.data.day_date !== undefined || parsed.data.date !== undefined) {
      updatePayload.day_date = parsed.data.day_date ?? parsed.data.date ?? null;
    }
    if (parsed.data.start_time !== undefined || parsed.data.time_slot !== undefined) {
      updatePayload.start_time = parsed.data.start_time ?? parsed.data.time_slot ?? null;
    }
    if (parsed.data.end_time !== undefined) updatePayload.end_time = parsed.data.end_time ?? null;
    if (parsed.data.sort_order !== undefined) updatePayload.sort_order = parsed.data.sort_order;
    if (parsed.data.estimated_cost_cents !== undefined || parsed.data.estimated_cost !== undefined) {
      updatePayload.estimated_cost_cents =
        parsed.data.estimated_cost_cents ??
        (parsed.data.estimated_cost != null ? Math.round(parsed.data.estimated_cost * 100) : null);
    }
    if (parsed.data.currency !== undefined) updatePayload.currency = parsed.data.currency;
    if (snapshot !== undefined || parsed.data.snapshot !== undefined) {
      updatePayload.snapshot = {
        ...(snapshot ?? {}),
        ...(parsed.data.snapshot ?? {}),
      };
    }
    if (parsed.data.metadata !== undefined) updatePayload.metadata = parsed.data.metadata;

    const { data, error } = await (client as any)
      .from("user_trip_events")
      .update(updatePayload)
      .eq("id", parsedParams.data.eventId)
      .eq("trip_id", parsedParams.data.tripId)
      .eq("user_id", auth.userId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json(errorPayload("TRIP_EVENT_NOT_FOUND", "Trip event not found."), { status: 404 });
    return NextResponse.json({ event: toTripEvent(data) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const response = tripErrorResponse(error, "TRIP_EVENT_UPDATE_FAILED", "Failed to update trip event.");
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ tripId: string; eventId: string }> }) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "trips:events:delete",
    email: auth.email,
    maxAttempts: 90,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(errorPayload("TRIP_EVENT_ID_INVALID", "Valid trip and event ids are required."), { status: 400 });
  }

  const client = createServiceRoleClient();
  if (!client) return NextResponse.json(errorPayload("SERVICE_UNAVAILABLE", "Trip storage is not configured."), { status: 503 });

  const { error, count } = await (client as any)
    .from("user_trip_events")
    .delete({ count: "exact" })
    .eq("id", parsedParams.data.eventId)
    .eq("trip_id", parsedParams.data.tripId)
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json(errorPayload("TRIP_EVENT_DELETE_FAILED", error.message), { status: 500 });
  }

  if (!count) return NextResponse.json(errorPayload("TRIP_EVENT_NOT_FOUND", "Trip event not found."), { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
