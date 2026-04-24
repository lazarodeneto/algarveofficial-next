import { NextRequest, NextResponse } from "next/server";

import { GolfRoundsError, updateHoleScore } from "@/lib/golf/rounds";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface UpdateHoleBody {
  strokes?: unknown;
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
  context: { params: Promise<{ roundId: string; holeNumber: string }> },
) {
  const { roundId, holeNumber: rawHoleNumber } = await context.params;

  const holeNumber = Number.parseInt(rawHoleNumber, 10);
  if (!Number.isInteger(holeNumber)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_HOLE_NUMBER",
          message: "holeNumber must be an integer.",
        },
      },
      { status: 400 },
    );
  }

  let body: UpdateHoleBody;
  try {
    body = (await request.json()) as UpdateHoleBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Body must be valid JSON." } },
      { status: 400 },
    );
  }

  const strokes = typeof body.strokes === "number" ? body.strokes : Number.NaN;
  if (!Number.isInteger(strokes)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_STROKES",
          message: "strokes must be an integer.",
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
    const round = await updateHoleScore({
      roundId,
      userId: user.id,
      holeNumber,
      strokes,
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
        enteredHoles: round.enteredHoles,
        totalScore: round.totalScore,
        totalVsPar: round.totalVsPar,
      },
    });
  } catch (error) {
    return mapRoundError(error);
  }
}
