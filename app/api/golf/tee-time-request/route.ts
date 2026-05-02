import { NextResponse } from "next/server";

import { teeTimeRequestSchema } from "@/lib/golf/tee-time-request";
import { createServiceRoleClient } from "@/lib/supabase/service";

function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error: { code, message, details: details ?? null } },
    { status },
  );
}

function optionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = teeTimeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "TEE_TIME_VALIDATION_ERROR",
      "Invalid tee time request payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return errorResponse(503, "SERVICE_ROLE_NOT_CONFIGURED", "Lead intake is temporarily unavailable.");
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from("golf_tee_time_requests" as never)
    .insert({
      course_id: payload.course_id ?? null,
      listing_id: payload.listing_id ?? null,
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: optionalText(payload.phone),
      preferred_date: payload.preferred_date ?? null,
      preferred_time: payload.preferred_time ?? null,
      players: payload.players ?? null,
      handicap: optionalText(payload.handicap),
      message: optionalText(payload.message),
      status: "new",
    } as never)
    .select("id, status, created_at")
    .single();

  if (error) {
    return errorResponse(500, "TEE_TIME_INSERT_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}
