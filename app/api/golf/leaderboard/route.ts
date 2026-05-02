import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/golf/leaderboard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get("course_id")?.trim();

  if (!courseId) {
    return NextResponse.json([]);
  }

  const entries = await getLeaderboard(courseId);

  return NextResponse.json(
    entries.map((entry) => ({
      player_name: entry.playerName,
      score: entry.score,
      rounds: entry.rounds,
    })),
  );
}
