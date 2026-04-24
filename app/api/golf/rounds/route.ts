import { NextRequest, NextResponse } from "next/server";

import {
  createRoundForSession,
  GolfRoundsError,
  isGolfTeeColor,
  type GolfTeeColor,
} from "@/lib/golf/rounds";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface CreateRoundBody {
  listingId?: unknown;
  teeColor?: unknown;
}

function mapRoundError(error: unknown) {
  if (error instanceof GolfRoundsError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected golf round error.";
  return NextResponse.json(
    { ok: false, error: { code: "UNEXPECTED_ERROR", message } },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  let body: CreateRoundBody;
  try {
    body = (await request.json()) as CreateRoundBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      { status: 400 },
    );
  }

  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  if (!listingId) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_LISTING_ID", message: "listingId is required." } },
      { status: 400 },
    );
  }

  const rawTee = typeof body.teeColor === "string" ? body.teeColor.trim().toLowerCase() : "";
  const teeColor: GolfTeeColor = isGolfTeeColor(rawTee) ? rawTee : "yellow";

  const supabase = await createClient();

  try {
    const created = await createRoundForSession(supabase, {
      listingId,
      teeColor,
    });

    return NextResponse.json(
      { ok: true, data: { roundId: created.roundId } },
      { status: 201 },
    );
  } catch (error) {
    return mapRoundError(error);
  }
}
