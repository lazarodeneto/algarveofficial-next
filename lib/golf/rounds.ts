import { createClient } from "@/lib/supabase/server";
import {
  isGolfTeeColor,
  type GolfHoleDefinition,
  type GolfRound,
  type GolfRoundCourseRef,
  type GolfRoundHole,
  type GolfTeeColor,
} from "@/lib/golf/round-shared";

export {
  formatVsParLabel,
  isGolfTeeColor,
  type GolfHoleDefinition,
  type GolfRound,
  type GolfRoundCourseRef,
  type GolfRoundHole,
  type GolfTeeColor,
} from "@/lib/golf/round-shared";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface BaseRoundRecord {
  id: string;
  userId: string;
  listingId: string;
  teeColor: GolfTeeColor;
  totalScore: number | null;
  totalVsPar: number | null;
  startedAt: string;
  finishedAt: string | null;
  course: GolfRoundCourseRef;
}

interface RoundTotalsSummary {
  enteredHoles: number;
  totalScore: number | null;
  totalVsPar: number | null;
}

export interface GolfScorecardView {
  round: GolfRound;
  frontNine: GolfRoundHole[];
  backNine: GolfRoundHole[];
  frontParTotal: number;
  backParTotal: number;
  totalPar: number;
  frontScoreTotal: number;
  backScoreTotal: number;
  totalScore: number;
  totalVsPar: number;
}

export interface GolfRoundWithData {
  round: GolfRound;
  holes: GolfRoundHole[];
  scores: Record<number, number>;
}

type PostgrestErrorLike = { code?: string; message?: string } | null | undefined;

export class GolfRoundsError extends Error {
  readonly code:
    | "INVALID_INPUT"
    | "UNAUTHORIZED"
    | "MISSING_SCHEMA"
    | "NOT_GOLF_LISTING"
    | "NO_HOLES_CONFIGURED"
    | "DB_ERROR";
  readonly status: number;

  constructor(
    code: GolfRoundsError["code"],
    message: string,
    status: number,
  ) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapRelation(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    return asRecord(value[0]);
  }
  return asRecord(value);
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

function toInteger(value: unknown): number | null {
  const parsed = toNullableNumber(value);
  if (parsed === null) return null;
  return Number.isInteger(parsed) ? parsed : null;
}

function normalizeTeeColor(value: unknown): GolfTeeColor {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (isGolfTeeColor(normalized)) {
    return normalized;
  }
  return "yellow";
}

function isMissingRelationError(error: PostgrestErrorLike) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function isMissingColumnError(error: PostgrestErrorLike) {
  return error?.code === "42703";
}

function normalizeMissingSchema(error: PostgrestErrorLike) {
  if (!isMissingRelationError(error)) return null;
  return new GolfRoundsError(
    "MISSING_SCHEMA",
    "Golf round tables are not available yet. Please run the golf round SQL first.",
    503,
  );
}

function normalizeRlsPolicyError(error: PostgrestErrorLike) {
  if (error?.code !== "42501") return null;
  return new GolfRoundsError(
    "DB_ERROR",
    "Database policy blocked this action. Confirm RLS allows users to manage their own golf rounds.",
    403,
  );
}

function toGolfHoleDefinition(row: Record<string, unknown>): GolfHoleDefinition | null {
  const holeNumber = toInteger(row.hole_number);
  const par = toInteger(row.par);

  if (!holeNumber || !par) return null;

  return {
    holeNumber,
    par,
    strokeIndex: toInteger(row.stroke_index),
    distanceWhite: toNullableNumber(row.distance_white),
    distanceYellow: toNullableNumber(row.distance_yellow),
    distanceRed: toNullableNumber(row.distance_red),
  };
}

function toGolfHoleDefinitionFromCategoryData(
  row: Record<string, unknown>,
): GolfHoleDefinition | null {
  const holeNumber = toInteger(row.hole_number) ?? toInteger(row.holeNumber);
  const par = toInteger(row.par);

  if (!holeNumber || !par) return null;

  return {
    holeNumber,
    par,
    strokeIndex: toInteger(row.stroke_index) ?? toInteger(row.strokeIndex),
    distanceWhite: toNullableNumber(row.distance_white) ?? toNullableNumber(row.distanceWhite),
    distanceYellow: toNullableNumber(row.distance_yellow) ?? toNullableNumber(row.distanceYellow),
    distanceRed: toNullableNumber(row.distance_red) ?? toNullableNumber(row.distanceRed),
  };
}

async function loadHoleDefinitionsFromCategoryData(
  listingId: string,
  supabaseClient: SupabaseServerClient,
): Promise<GolfHoleDefinition[]> {
  const listingQuery = await supabaseClient
    .from("listings")
    .select("category_data")
    .eq("id", listingId)
    .maybeSingle();

  if (listingQuery.error) {
    const rlsError = normalizeRlsPolicyError(listingQuery.error);
    if (rlsError) throw rlsError;
    return [];
  }

  const listing = asRecord(listingQuery.data);
  const categoryData = asRecord(listing?.category_data);
  const scorecardHoles = Array.isArray(categoryData?.scorecard_holes)
    ? categoryData?.scorecard_holes
    : [];

  return scorecardHoles
    .map((raw) => toGolfHoleDefinitionFromCategoryData(asRecord(raw) ?? {}))
    .filter((row): row is GolfHoleDefinition => row !== null)
    .sort((a, b) => a.holeNumber - b.holeNumber);
}

function validateUuidInput(value: string, fieldName: string) {
  if (!value || typeof value !== "string") {
    throw new GolfRoundsError(
      "INVALID_INPUT",
      `${fieldName} is required.`,
      400,
    );
  }
}

async function loadBaseRoundRecord(
  roundId: string,
  userId: string,
): Promise<BaseRoundRecord | null> {
  const supabase: SupabaseServerClient = await createClient();
  const { data, error } = await supabase
    .from("golf_rounds")
    .select(
      "id, user_id, listing_id, tee_color, total_score, total_vs_par, started_at, finished_at, listing:listings(id, slug, name)",
    )
    .eq("id", roundId)
    .eq("user_id", userId)
    .maybeSingle();

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to load round.",
      500,
    );
  }

  if (!data) return null;

  const row = asRecord(data);
  const listing = unwrapRelation(row?.listing);

  const id = toNullableString(row?.id);
  const listingId = toNullableString(row?.listing_id);
  const recordUserId = toNullableString(row?.user_id);
  const startedAt = toNullableString(row?.started_at);
  const courseId = toNullableString(listing?.id);
  const courseSlug = toNullableString(listing?.slug);
  const courseName = toNullableString(listing?.name);

  if (
    !id ||
    !listingId ||
    !recordUserId ||
    !startedAt ||
    !courseId ||
    !courseSlug ||
    !courseName
  ) {
    throw new GolfRoundsError("DB_ERROR", "Round data is malformed.", 500);
  }

  return {
    id,
    userId: recordUserId,
    listingId,
    teeColor: normalizeTeeColor(row?.tee_color),
    totalScore: toNullableNumber(row?.total_score),
    totalVsPar: toNullableNumber(row?.total_vs_par),
    startedAt,
    finishedAt: toNullableString(row?.finished_at),
    course: {
      id: courseId,
      slug: courseSlug,
      name: courseName,
    },
  };
}

async function loadHoleDefinitions(
  listingId: string,
  supabaseClient?: SupabaseServerClient,
): Promise<GolfHoleDefinition[]> {
  const supabase = supabaseClient ?? (await createClient());
  const legacyQuery = await supabase
    .from("golf_holes")
    .select(
      "hole_number, par, stroke_index, distance_white, distance_yellow, distance_red",
    )
    .eq("listing_id", listingId)
    .order("hole_number", { ascending: true });

  if (legacyQuery.error) {
    const missingSchemaError = normalizeMissingSchema(legacyQuery.error);
    if (missingSchemaError) throw missingSchemaError;
    const rlsError = normalizeRlsPolicyError(legacyQuery.error);
    if (rlsError) throw rlsError;

    if (!isMissingColumnError(legacyQuery.error)) {
      throw new GolfRoundsError(
        "DB_ERROR",
        legacyQuery.error.message ?? "Failed to load golf holes.",
        500,
      );
    }
  }

  const legacyRows = (legacyQuery.data ?? [])
    .map((row) => toGolfHoleDefinition(asRecord(row) ?? {}))
    .filter((row): row is GolfHoleDefinition => row !== null);

  if (legacyRows.length > 0) {
    return legacyRows;
  }

  const courseQuery = await supabase
    .from("golf_courses")
    .select("id, is_default")
    .eq("listing_id", listingId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true })
    .limit(1);

  if (courseQuery.error) {
    if (isMissingRelationError(courseQuery.error) || isMissingColumnError(courseQuery.error)) {
      const categoryDataRows = await loadHoleDefinitionsFromCategoryData(listingId, supabase);
      if (categoryDataRows.length > 0) {
        return categoryDataRows;
      }
      return legacyRows;
    }
    const rlsError = normalizeRlsPolicyError(courseQuery.error);
    if (rlsError) throw rlsError;
    throw new GolfRoundsError(
      "DB_ERROR",
      courseQuery.error.message ?? "Failed to load golf courses.",
      500,
    );
  }

  const defaultCourse = asRecord(courseQuery.data?.[0]);
  const defaultCourseId = toNullableString(defaultCourse?.id);
  if (!defaultCourseId) {
    const categoryDataRows = await loadHoleDefinitionsFromCategoryData(listingId, supabase);
    if (categoryDataRows.length > 0) {
      return categoryDataRows;
    }
    return legacyRows;
  }

  const holesByCourseQuery = await supabase
    .from("golf_holes")
    .select(
      "hole_number, par, stroke_index, distance_white, distance_yellow, distance_red",
    )
    .eq("course_id", defaultCourseId)
    .order("hole_number", { ascending: true });

  if (holesByCourseQuery.error) {
    const missingSchemaError = normalizeMissingSchema(holesByCourseQuery.error);
    if (missingSchemaError) throw missingSchemaError;
    const rlsError = normalizeRlsPolicyError(holesByCourseQuery.error);
    if (rlsError) throw rlsError;

    if (isMissingColumnError(holesByCourseQuery.error)) {
      const categoryDataRows = await loadHoleDefinitionsFromCategoryData(listingId, supabase);
      if (categoryDataRows.length > 0) {
        return categoryDataRows;
      }
      return legacyRows;
    }

    throw new GolfRoundsError(
      "DB_ERROR",
      holesByCourseQuery.error.message ?? "Failed to load golf holes.",
      500,
    );
  }

  const nextRows = (holesByCourseQuery.data ?? [])
    .map((row) => toGolfHoleDefinition(asRecord(row) ?? {}))
    .filter((row): row is GolfHoleDefinition => row !== null);

  if (nextRows.length > 0) {
    return nextRows;
  }

  const categoryDataRows = await loadHoleDefinitionsFromCategoryData(listingId, supabase);
  if (categoryDataRows.length > 0) {
    return categoryDataRows;
  }

  return legacyRows;
}

async function loadRoundScores(roundId: string): Promise<Map<number, number>> {
  const supabase: SupabaseServerClient = await createClient();
  const { data, error } = await supabase
    .from("golf_round_holes")
    .select("hole_number, strokes")
    .eq("round_id", roundId);

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to load round scores.",
      500,
    );
  }

  const scoreMap = new Map<number, number>();

  for (const rawRow of data ?? []) {
    const row = asRecord(rawRow);
    const holeNumber = toInteger(row?.hole_number);
    const strokes = toInteger(row?.strokes);
    if (!holeNumber || !strokes) continue;
    scoreMap.set(holeNumber, strokes);
  }

  return scoreMap;
}

function computeRoundTotals(
  holes: GolfHoleDefinition[],
  scoresByHole: Map<number, number>,
): RoundTotalsSummary {
  let totalScore = 0;
  let parForEnteredHoles = 0;
  let enteredHoles = 0;

  for (const hole of holes) {
    const strokes = scoresByHole.get(hole.holeNumber);
    if (typeof strokes !== "number") continue;
    enteredHoles += 1;
    totalScore += strokes;
    parForEnteredHoles += hole.par;
  }

  if (enteredHoles === 0) {
    return {
      enteredHoles: 0,
      totalScore: null,
      totalVsPar: null,
    };
  }

  return {
    enteredHoles,
    totalScore,
    totalVsPar: totalScore - parForEnteredHoles,
  };
}

async function persistRoundTotals(
  roundId: string,
  totals: RoundTotalsSummary,
  finishedAt: string | null,
) {
  const supabase: SupabaseServerClient = await createClient();
  const { error } = await supabase
    .from("golf_rounds")
    .update({
      total_score: totals.totalScore,
      total_vs_par: totals.totalVsPar,
      finished_at: finishedAt,
    })
    .eq("id", roundId);

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to persist round totals.",
      500,
    );
  }
}

async function ensureGolfListing(
  listingId: string,
  supabaseClient?: SupabaseServerClient,
) {
  const supabase = supabaseClient ?? (await createClient());
  const { data, error } = await supabase
    .from("listings")
    .select("id, status, category_data, category:categories(slug)")
    .eq("id", listingId)
    .maybeSingle();

  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to load listing.",
      500,
    );
  }

  const listing = asRecord(data);
  const category = unwrapRelation(listing?.category);
  const categoryData = asRecord(listing?.category_data);
  const categorySlug =
    toNullableString(category?.slug)?.toLowerCase() ??
    toNullableString(categoryData?.slug)?.toLowerCase();

  if (categorySlug !== "golf") {
    throw new GolfRoundsError(
      "NOT_GOLF_LISTING",
      "The selected listing is not a golf course.",
      400,
    );
  }
}

function mergeRoundData(
  baseRound: BaseRoundRecord,
  holes: GolfHoleDefinition[],
  scoresByHole: Map<number, number>,
): GolfRound {
  const golfHoles: GolfRoundHole[] = holes.map((hole) => ({
    ...hole,
    strokes: scoresByHole.get(hole.holeNumber) ?? null,
  }));
  const totals = computeRoundTotals(holes, scoresByHole);

  return {
    ...baseRound,
    totalScore: totals.totalScore,
    totalVsPar: totals.totalVsPar,
    holes: golfHoles,
    enteredHoles: totals.enteredHoles,
  };
}

async function createRoundWithUser(
  supabase: SupabaseServerClient,
  input: {
    listingId: string;
    userId: string;
    teeColor?: GolfTeeColor;
  },
) {
  validateUuidInput(input.listingId, "listingId");
  validateUuidInput(input.userId, "userId");

  await ensureGolfListing(input.listingId, supabase);

  const holes = await loadHoleDefinitions(input.listingId, supabase);
  if (holes.length === 0) {
    throw new GolfRoundsError(
      "NO_HOLES_CONFIGURED",
      "This golf course does not have hole data configured yet.",
      409,
    );
  }

  const { data, error } = await supabase
    .from("golf_rounds")
    .insert({
      user_id: input.userId,
      listing_id: input.listingId,
      tee_color: normalizeTeeColor(input.teeColor),
      started_at: new Date().toISOString(),
      finished_at: null,
    })
    .select("id")
    .single();

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to create round.",
      500,
    );
  }

  const id = toNullableString(asRecord(data)?.id);
  if (!id) {
    throw new GolfRoundsError("DB_ERROR", "Failed to resolve round id.", 500);
  }

  return { roundId: id };
}

export async function createRound(input: {
  listingId: string;
  userId: string;
  teeColor?: GolfTeeColor;
}) {
  const supabase = await createClient();
  return createRoundWithUser(supabase, input);
}

export async function createRoundForSession(
  supabase: SupabaseServerClient,
  input: { listingId: string; teeColor?: GolfTeeColor },
) {
  validateUuidInput(input.listingId, "listingId");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new GolfRoundsError("UNAUTHORIZED", "Authentication required.", 401);
  }

  return createRoundWithUser(supabase, {
    listingId: input.listingId,
    userId: user.id,
    teeColor: input.teeColor,
  });
}

export async function getGolfHoles(listingId: string) {
  validateUuidInput(listingId, "listingId");
  return loadHoleDefinitions(listingId);
}

export async function getRoundScores(roundId: string) {
  validateUuidInput(roundId, "roundId");
  return loadRoundScores(roundId);
}

export async function getRoundWithData(input: { roundId: string; userId: string }) {
  const round = await getRound(input);
  if (!round) return null;

  const scores = Object.fromEntries(
    round.holes.flatMap((hole) =>
      typeof hole.strokes === "number" ? [[hole.holeNumber, hole.strokes]] : [],
    ),
  );

  const view: GolfRoundWithData = {
    round,
    holes: round.holes,
    scores,
  };

  return view;
}

export async function getRoundScorecard(input: { roundId: string; userId: string }) {
  const roundWithData = await getRoundWithData(input);
  if (!roundWithData) return null;

  const { round, holes, scores } = roundWithData;

  const frontNine = holes.slice(0, 9);
  const backNine = holes.slice(9, 18);

  const sumPar = (holes: GolfRoundHole[]) =>
    holes.reduce((total, hole) => total + hole.par, 0);
  const sumScoreForDisplay = (holes: GolfRoundHole[]) =>
    holes.reduce((total, hole) => total + (scores[hole.holeNumber] ?? hole.par), 0);

  const frontParTotal = sumPar(frontNine);
  const backParTotal = sumPar(backNine);
  const totalPar = frontParTotal + backParTotal;
  const frontScoreTotal = sumScoreForDisplay(frontNine);
  const backScoreTotal = sumScoreForDisplay(backNine);
  const totalScore = frontScoreTotal + backScoreTotal;

  const view: GolfScorecardView = {
    round,
    frontNine,
    backNine,
    frontParTotal,
    backParTotal,
    totalPar,
    frontScoreTotal,
    backScoreTotal,
    totalScore,
    totalVsPar: totalScore - totalPar,
  };

  return view;
}

export async function getRound(input: { roundId: string; userId: string }) {
  validateUuidInput(input.roundId, "roundId");
  validateUuidInput(input.userId, "userId");

  const baseRound = await loadBaseRoundRecord(input.roundId, input.userId);
  if (!baseRound) return null;

  const holes = await loadHoleDefinitions(baseRound.listingId);
  if (holes.length === 0) {
    throw new GolfRoundsError(
      "NO_HOLES_CONFIGURED",
      "This golf course does not have hole data configured yet.",
      409,
    );
  }

  const scoresByHole = await loadRoundScores(baseRound.id);
  return mergeRoundData(baseRound, holes, scoresByHole);
}

export async function updateRoundTeeColor(input: {
  roundId: string;
  userId: string;
  teeColor: GolfTeeColor;
}) {
  validateUuidInput(input.roundId, "roundId");
  validateUuidInput(input.userId, "userId");

  const baseRound = await loadBaseRoundRecord(input.roundId, input.userId);
  if (!baseRound) return null;

  const teeColor = normalizeTeeColor(input.teeColor);
  const supabase = await createClient();
  const { error } = await supabase
    .from("golf_rounds")
    .update({ tee_color: teeColor })
    .eq("id", input.roundId)
    .eq("user_id", input.userId);

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to update tee color.",
      500,
    );
  }

  return getRound({ roundId: input.roundId, userId: input.userId });
}

export async function updateHoleScore(input: {
  roundId: string;
  userId: string;
  holeNumber: number;
  strokes: number;
}) {
  validateUuidInput(input.roundId, "roundId");
  validateUuidInput(input.userId, "userId");

  if (!Number.isInteger(input.holeNumber) || input.holeNumber < 1 || input.holeNumber > 36) {
    throw new GolfRoundsError(
      "INVALID_INPUT",
      "holeNumber must be an integer between 1 and 36.",
      400,
    );
  }

  if (!Number.isInteger(input.strokes) || input.strokes < 1 || input.strokes > 20) {
    throw new GolfRoundsError(
      "INVALID_INPUT",
      "strokes must be an integer between 1 and 20.",
      400,
    );
  }

  const baseRound = await loadBaseRoundRecord(input.roundId, input.userId);
  if (!baseRound) return null;

  const holes = await loadHoleDefinitions(baseRound.listingId);
  const selectedHole = holes.find((hole) => hole.holeNumber === input.holeNumber);
  if (!selectedHole) {
    throw new GolfRoundsError(
      "INVALID_INPUT",
      "This hole is not configured for the selected course.",
      400,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("golf_round_holes").upsert(
    {
      round_id: input.roundId,
      hole_number: input.holeNumber,
      strokes: input.strokes,
    },
    { onConflict: "round_id,hole_number" },
  );

  const missingSchemaError = normalizeMissingSchema(error);
  if (missingSchemaError) throw missingSchemaError;
  const rlsError = normalizeRlsPolicyError(error);
  if (rlsError) throw rlsError;

  if (error) {
    throw new GolfRoundsError(
      "DB_ERROR",
      error.message ?? "Failed to save hole score.",
      500,
    );
  }

  const scoresByHole = await loadRoundScores(input.roundId);
  const totals = computeRoundTotals(holes, scoresByHole);

  await persistRoundTotals(input.roundId, totals, baseRound.finishedAt);

  return mergeRoundData(
    {
      ...baseRound,
      totalScore: totals.totalScore,
      totalVsPar: totals.totalVsPar,
    },
    holes,
    scoresByHole,
  );
}

export async function completeRound(input: { roundId: string; userId: string }) {
  validateUuidInput(input.roundId, "roundId");
  validateUuidInput(input.userId, "userId");

  const baseRound = await loadBaseRoundRecord(input.roundId, input.userId);
  if (!baseRound) return null;

  const holes = await loadHoleDefinitions(baseRound.listingId);
  if (holes.length === 0) {
    throw new GolfRoundsError(
      "NO_HOLES_CONFIGURED",
      "This golf course does not have hole data configured yet.",
      409,
    );
  }

  const scoresByHole = await loadRoundScores(input.roundId);
  const totals = computeRoundTotals(holes, scoresByHole);
  const finishedAt = new Date().toISOString();

  await persistRoundTotals(input.roundId, totals, finishedAt);

  return mergeRoundData(
    {
      ...baseRound,
      finishedAt,
      totalScore: totals.totalScore,
      totalVsPar: totals.totalVsPar,
    },
    holes,
    scoresByHole,
  );
}
