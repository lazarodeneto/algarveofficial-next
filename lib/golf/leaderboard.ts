import { createServiceRoleClient } from "@/lib/supabase/service";

type UntypedSupabaseClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        limit: (count: number) => Promise<{ data: unknown[] | null; error: PostgrestErrorLike }>;
      };
      in: (column: string, values: string[]) => Promise<{ data: unknown[] | null; error: PostgrestErrorLike }>;
    };
  };
};

export interface CourseLeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  rounds: number;
}

type PostgrestErrorLike = { code?: string } | null | undefined;

function isMissingSchemaError(error: PostgrestErrorLike) {
  return error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "42703";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function fallbackPlayerName(userId: string) {
  return `Player ${userId.slice(0, 6)}`;
}

export function aggregateLeaderboardRows(rows: Array<Record<string, unknown>>): CourseLeaderboardEntry[] {
  const byPlayer = new Map<string, { bestScore: number; rounds: number }>();

  for (const row of rows) {
    const playerName =
      toNullableString(row.player_name) ??
      toNullableString(row.playerName) ??
      toNullableString(row.user_id);
    const score = toNullableNumber(row.to_par) ?? toNullableNumber(row.total_vs_par);
    if (!playerName || score === null) continue;

    const rounds = Math.max(1, toNullableNumber(row.rounds_played) ?? 1);
    const current = byPlayer.get(playerName);
    if (!current) {
      byPlayer.set(playerName, { bestScore: score, rounds });
      continue;
    }

    current.bestScore = Math.min(current.bestScore, score);
    current.rounds += rounds;
  }

  return Array.from(byPlayer.entries())
    .map(([playerName, entry]) => ({
      rank: 0,
      playerName,
      score: entry.bestScore,
      rounds: entry.rounds,
    }))
    .sort((a, b) => {
      const scoreDiff = a.score - b.score;
      if (scoreDiff !== 0) return scoreDiff;
      return b.rounds - a.rounds;
    })
    .slice(0, 5)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

async function loadLegacyLeaderboardRows(
  supabase: UntypedSupabaseClient,
  courseId: string,
): Promise<Array<Record<string, unknown>>> {
  const roundsQuery = await supabase
    .from("golf_rounds")
    .select("user_id, total_score, total_vs_par, created_at")
    .eq("listing_id", courseId)
    .limit(250);

  if (roundsQuery.error || !roundsQuery.data) return [];

  const rows = roundsQuery.data
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => row !== null);
  const userIds = Array.from(
    new Set(rows.map((row) => toNullableString(row.user_id)).filter((id): id is string => id !== null)),
  );
  const namesByUserId = new Map<string, string>();

  if (userIds.length > 0) {
    const profilesQuery = await supabase
      .from("public_profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (!profilesQuery.error) {
      for (const profile of profilesQuery.data ?? []) {
        const row = asRecord(profile);
        const id = toNullableString(row?.id);
        const name = toNullableString(row?.full_name);
        if (id && name) namesByUserId.set(id, name);
      }
    }
  }

  return rows.map((row) => {
    const userId = toNullableString(row.user_id);
    return {
      player_name: userId ? namesByUserId.get(userId) ?? fallbackPlayerName(userId) : null,
      to_par: row.total_vs_par,
      rounds_played: 1,
    };
  });
}

export async function getLeaderboard(courseId: string): Promise<CourseLeaderboardEntry[]> {
  const normalizedCourseId = courseId.trim();
  if (!normalizedCourseId) return [];

  const typedSupabase = createServiceRoleClient();
  if (!typedSupabase) return [];
  const supabase = typedSupabase as unknown as UntypedSupabaseClient;

  const roundsQuery = await supabase
    .from("golf_rounds")
    .select("player_name, total_score, to_par, rounds_played, created_at")
    .eq("course_id", normalizedCourseId)
    .limit(500);

  if (roundsQuery.error) {
    if (isMissingSchemaError(roundsQuery.error)) {
      return aggregateLeaderboardRows(await loadLegacyLeaderboardRows(supabase, normalizedCourseId));
    }
    return [];
  }

  const rows = (roundsQuery.data ?? [])
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => row !== null);
  return aggregateLeaderboardRows(rows);
}
