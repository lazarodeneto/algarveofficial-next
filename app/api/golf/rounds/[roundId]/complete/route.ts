import { NextRequest, NextResponse } from "next/server";

import { completeRound, GolfRoundsError } from "@/lib/golf/rounds";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await context.params;

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
    const round = await completeRound({ roundId, userId: user.id });
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
        finishedAt: round.finishedAt,
        enteredHoles: round.enteredHoles,
        totalScore: round.totalScore,
        totalVsPar: round.totalVsPar,
      },
    });
  } catch (error) {
    return mapRoundError(error);
  }
}
