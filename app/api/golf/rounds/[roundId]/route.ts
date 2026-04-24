import { NextRequest, NextResponse } from "next/server";

import {
  GolfRoundsError,
  isGolfTeeColor,
  updateRoundTeeColor,
} from "@/lib/golf/rounds";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface UpdateRoundBody {
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await context.params;

  let body: UpdateRoundBody;
  try {
    body = (await request.json()) as UpdateRoundBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      { status: 400 },
    );
  }

  const teeColor = typeof body.teeColor === "string"
    ? body.teeColor.trim().toLowerCase()
    : "";

  if (!isGolfTeeColor(teeColor)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_TEE_COLOR",
          message: "teeColor must be one of: white, yellow, red.",
        },
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 },
    );
  }

  try {
    const round = await updateRoundTeeColor({
      roundId,
      userId: user.id,
      teeColor,
    });

    if (!round) {
      return NextResponse.json(
        { ok: false, error: { code: "ROUND_NOT_FOUND", message: "Round not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        roundId: round.id,
        teeColor: round.teeColor,
      },
    });
  } catch (error) {
    return mapRoundError(error);
  }
}
