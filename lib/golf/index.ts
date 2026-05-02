import { createPublicServerClient } from "@/lib/supabase/public-server";
import { normalizePublicImageUrl } from "@/lib/imageUrls";

export interface GolfLocationRef {
  id: string;
  name: string;
  slug: string;
}

export interface GolfCourseDetails {
  listingId: string;
  holes: number | null;
  par: number | null;
  slopeRating: number | null;
  courseRating: number | null;
  courseType: string | null;
  difficulty: string | null;
  accessType: string | null;
  priceRange: string | null;
  lengthMeters: number | null;
  architect: string | null;
  yearOpened: number | null;
  practiceFacilities: string | null;
  drivingRange: boolean | null;
  clubhouse: boolean | null;
  restaurant: boolean | null;
  buggyAvailable: boolean | null;
  academy: boolean | null;
  caddyAvailable: boolean | null;
  dressCode: string | null;
  bookingUrl: string | null;
  scorecardImageUrl: string | null;
  scorecardPdfUrl: string | null;
  mapImageUrl: string | null;
}

export interface GolfScorecardHole {
  holeNumber: number;
  par: number;
  hcp: number | null;
  white: number | null;
  yellow: number | null;
  red: number | null;
}

export interface GolfListing {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  tier: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  city: GolfLocationRef | null;
  region: GolfLocationRef | null;
  categorySlug: string | null;
  categoryName: string | null;
  details: GolfCourseDetails | null;
  holeCount: number;
  scorecardHoles: GolfScorecardHole[];
}

export interface GolfLeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  rounds: number | null;
}

const GOLF_LISTING_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  tier,
  status,
  latitude,
  longitude,
  website_url,
  contact_phone,
  contact_email,
  google_rating,
  google_review_count,
  category_data,
  city:cities(id, name, slug),
  region:regions(id, name, slug),
  category:categories(id, name, slug)
`;

export const CANONICAL_GOLF_CATEGORY_SLUG = "golf";

const GOLF_CATEGORY_ALIASES = new Set([
  "golf",
  "golf-course",
  "golf-courses",
  "golf courses",
  "golf-tournaments",
]);

const MOCK_LEADERBOARD: GolfLeaderboardEntry[] = [
  { rank: 1, player: "Joao Silva", score: -6, rounds: 4 },
  { rank: 2, player: "Emma Thompson", score: -4, rounds: 4 },
  { rank: 3, player: "Miguel Santos", score: -3, rounds: 4 },
  { rank: 4, player: "Sofia Costa", score: -2, rounds: 4 },
  { rank: 5, player: "Daniel Reed", score: -1, rounds: 4 },
];

type PostgrestErrorLike = { code?: string } | null | undefined;

function isMissingRelationError(error: PostgrestErrorLike) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function isMissingColumnError(error: PostgrestErrorLike) {
  return error?.code === "42703";
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

function toNullableBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "yes" || normalized === "1") return true;
    if (normalized === "false" || normalized === "no" || normalized === "0") return false;
  }
  return null;
}

function toInteger(value: unknown): number | null {
  const parsed = toNullableNumber(value);
  if (parsed === null) return null;
  return Number.isInteger(parsed) ? parsed : null;
}

function pickTeeNumber(value: unknown): number | null {
  const record = asRecord(value);
  if (record) {
    return (
      toNullableNumber(record.white) ??
      toNullableNumber(record.yellow) ??
      toNullableNumber(record.red)
    );
  }
  return toNullableNumber(value);
}

function pickNullable<T>(primary: T | null | undefined, fallback: T | null | undefined): T | null {
  return primary ?? fallback ?? null;
}

function mapLocationRef(row: Record<string, unknown> | null): GolfLocationRef | null {
  if (!row) return null;

  const id = toNullableString(row.id);
  const name = toNullableString(row.name);
  const slug = toNullableString(row.slug);

  if (!id || !name || !slug) return null;

  return { id, name, slug };
}

function mapScorecardHoles(categoryData: Record<string, unknown> | null): GolfScorecardHole[] {
  if (!categoryData) return [];
  const raw = Array.isArray(categoryData.scorecard_holes)
    ? categoryData.scorecard_holes
    : categoryData.scorecard;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      const row = asRecord(entry);
      const holeNumber = toInteger(row?.hole_number ?? row?.hole);
      const par = toInteger(row?.par);
      if (!holeNumber || !par) return null;
      return {
        holeNumber,
        par,
        hcp: toInteger(row?.stroke_index ?? row?.hcp),
        white: toNullableNumber(row?.distance_white ?? row?.white),
        yellow: toNullableNumber(row?.distance_yellow ?? row?.yellow),
        red: toNullableNumber(row?.distance_red ?? row?.red),
      } as GolfScorecardHole;
    })
    .filter((row): row is GolfScorecardHole => row !== null)
    .sort((a, b) => a.holeNumber - b.holeNumber);
}

function mapCourseDetails(source: Record<string, unknown> | null, listingId: string): GolfCourseDetails | null {
  if (!source) return null;

  const details: GolfCourseDetails = {
    listingId,
    holes: toNullableNumber(source.holes),
    par: toNullableNumber(source.par),
    slopeRating: toNullableNumber(source.slope_rating) ?? toNullableNumber(source.slopeRating),
    courseRating:
      toNullableNumber(source.course_rating) ?? toNullableNumber(source.courseRating),
    courseType: toNullableString(source.course_type) ?? toNullableString(source.courseType),
    difficulty: toNullableString(source.difficulty),
    accessType: toNullableString(source.access_type) ?? toNullableString(source.accessType),
    priceRange: toNullableString(source.price_range) ?? toNullableString(source.priceRange),
    lengthMeters:
      pickTeeNumber(source.length_meters) ??
      toNullableNumber(source.lengthMeters) ??
      toNullableNumber(source.length),
    architect: toNullableString(source.architect) ?? toNullableString(source.designer),
    yearOpened:
      toNullableNumber(source.year_opened) ?? toNullableNumber(source.yearOpened),
    practiceFacilities:
      toNullableString(source.practice_facilities) ??
      toNullableString(source.practiceFacilities),
    drivingRange:
      toNullableBoolean(source.driving_range) ?? toNullableBoolean(source.drivingRange),
    clubhouse: toNullableBoolean(source.clubhouse),
    restaurant: toNullableBoolean(source.restaurant),
    buggyAvailable:
      toNullableBoolean(source.buggy_available) ??
      toNullableBoolean(source.buggyAvailable) ??
      toNullableBoolean(source.equipment_rental),
    academy: toNullableBoolean(source.academy),
    caddyAvailable:
      toNullableBoolean(source.caddy_available) ?? toNullableBoolean(source.caddyAvailable),
    dressCode: toNullableString(source.dress_code) ?? toNullableString(source.dressCode),
    bookingUrl: toNullableString(source.booking_url) ?? toNullableString(source.bookingUrl),
    scorecardImageUrl:
      toNullableString(source.scorecard_image_url) ??
      toNullableString(source.scorecardImageUrl),
    scorecardPdfUrl:
      toNullableString(source.scorecard_pdf_url) ??
      toNullableString(source.scorecardPdfUrl),
    mapImageUrl: toNullableString(source.map_image_url) ?? toNullableString(source.mapImageUrl),
  };

  const hasAtLeastOneDetail = Object.entries(details).some(([key, value]) => {
    if (key === "listingId") return false;
    return value !== null;
  });

  return hasAtLeastOneDetail ? details : null;
}

function mergeCourseDetails(
  listingId: string,
  primary: GolfCourseDetails | null,
  fallback: GolfCourseDetails | null,
): GolfCourseDetails | null {
  if (!primary && !fallback) return null;

  return {
    listingId,
    holes: pickNullable(primary?.holes, fallback?.holes),
    par: pickNullable(primary?.par, fallback?.par),
    slopeRating: pickNullable(primary?.slopeRating, fallback?.slopeRating),
    courseRating: pickNullable(primary?.courseRating, fallback?.courseRating),
    courseType: pickNullable(primary?.courseType, fallback?.courseType),
    difficulty: pickNullable(primary?.difficulty, fallback?.difficulty),
    accessType: pickNullable(primary?.accessType, fallback?.accessType),
    priceRange: pickNullable(primary?.priceRange, fallback?.priceRange),
    lengthMeters: pickNullable(primary?.lengthMeters, fallback?.lengthMeters),
    architect: pickNullable(primary?.architect, fallback?.architect),
    yearOpened: pickNullable(primary?.yearOpened, fallback?.yearOpened),
    practiceFacilities: pickNullable(primary?.practiceFacilities, fallback?.practiceFacilities),
    drivingRange: pickNullable(primary?.drivingRange, fallback?.drivingRange),
    clubhouse: pickNullable(primary?.clubhouse, fallback?.clubhouse),
    restaurant: pickNullable(primary?.restaurant, fallback?.restaurant),
    buggyAvailable: pickNullable(primary?.buggyAvailable, fallback?.buggyAvailable),
    academy: pickNullable(primary?.academy, fallback?.academy),
    caddyAvailable: pickNullable(primary?.caddyAvailable, fallback?.caddyAvailable),
    dressCode: pickNullable(primary?.dressCode, fallback?.dressCode),
    bookingUrl: pickNullable(primary?.bookingUrl, fallback?.bookingUrl),
    scorecardImageUrl: pickNullable(primary?.scorecardImageUrl, fallback?.scorecardImageUrl),
    scorecardPdfUrl: pickNullable(primary?.scorecardPdfUrl, fallback?.scorecardPdfUrl),
    mapImageUrl: pickNullable(primary?.mapImageUrl, fallback?.mapImageUrl),
  };
}

async function getGolfCategoryIds(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .limit(200);

  if (error || !data) return [];

  return (data ?? [])
    .map((row) => row as Record<string, unknown>)
    .filter((row) => isGolfCategoryValue(toNullableString(row.slug)) || isGolfCategoryValue(toNullableString(row.name)))
    .map((row) => toNullableString(row.id))
    .filter((id): id is string => id !== null);
}

async function getGolfDetailsByListingId(
  supabase: ReturnType<typeof createPublicServerClient>,
  listingIds: string[],
): Promise<Map<string, GolfCourseDetails>> {
  const detailsByListingId = new Map<string, GolfCourseDetails>();
  if (listingIds.length === 0) return detailsByListingId;

  const { data, error } = await supabase
    .from("golf_course_details")
    .select("*")
    .in("listing_id", listingIds);

  if (error) {
    if (isMissingRelationError(error)) {
      return detailsByListingId;
    }
    return detailsByListingId;
  }

  for (const row of data ?? []) {
    const raw = asRecord(row);
    const listingId = toNullableString(raw?.listing_id);
    if (!listingId) continue;

    const details = mapCourseDetails(raw, listingId);
    if (details) {
      detailsByListingId.set(listingId, details);
    }
  }

  return detailsByListingId;
}

async function getGolfHoleCountsByListingId(
  supabase: ReturnType<typeof createPublicServerClient>,
  listingIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (listingIds.length === 0) return counts;

  const legacyQuery = await supabase
    .from("golf_holes")
    .select("listing_id")
    .in("listing_id", listingIds);

  if (legacyQuery.error) {
    if (!isMissingRelationError(legacyQuery.error) && !isMissingColumnError(legacyQuery.error)) {
      return counts;
    }
  } else {
    for (const row of legacyQuery.data ?? []) {
      const raw = asRecord(row);
      const listingId = toNullableString(raw?.listing_id);
      if (!listingId) continue;
      counts.set(listingId, (counts.get(listingId) ?? 0) + 1);
    }
  }

  const coursesQuery = await supabase
    .from("golf_courses")
    .select("id, listing_id")
    .in("listing_id", listingIds);

  if (coursesQuery.error) {
    if (isMissingRelationError(coursesQuery.error) || isMissingColumnError(coursesQuery.error)) {
      return counts;
    }
    return counts;
  }

  const courseToListing = new Map<string, string>();
  for (const row of coursesQuery.data ?? []) {
    const raw = asRecord(row);
    const courseId = toNullableString(raw?.id);
    const listingId = toNullableString(raw?.listing_id);
    if (!courseId || !listingId) continue;
    courseToListing.set(courseId, listingId);
  }

  if (courseToListing.size === 0) {
    return counts;
  }

  const holesByCourseQuery = await supabase
    .from("golf_holes")
    .select("course_id")
    .in("course_id", Array.from(courseToListing.keys()));

  if (holesByCourseQuery.error) {
    if (isMissingRelationError(holesByCourseQuery.error) || isMissingColumnError(holesByCourseQuery.error)) {
      return counts;
    }
    return counts;
  }

  const nextCounts = new Map<string, number>();
  for (const row of holesByCourseQuery.data ?? []) {
    const raw = asRecord(row);
    const courseId = toNullableString(raw?.course_id);
    if (!courseId) continue;
    const listingId = courseToListing.get(courseId);
    if (!listingId) continue;
    nextCounts.set(listingId, (nextCounts.get(listingId) ?? 0) + 1);
  }

  for (const [listingId, count] of nextCounts) {
    counts.set(listingId, count);
  }

  return counts;
}

function normalizeFilterValue(value: string | null | undefined): string {
  if (!value) return "";
  return decodeURIComponent(value).trim().toLowerCase();
}

function normalizeGolfCategoryValue(value: string | null | undefined): string {
  if (!value) return "";
  return decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function isGolfCategoryValue(value: string | null | undefined): boolean {
  const normalized = normalizeGolfCategoryValue(value);
  if (!normalized) return false;

  return GOLF_CATEGORY_ALIASES.has(normalized) || GOLF_CATEGORY_ALIASES.has(normalized.replace(/-/g, " "));
}

export function isGolfListingCategory(
  listing: Pick<GolfListing, "categorySlug" | "categoryName">,
): boolean {
  return isGolfCategoryValue(listing.categorySlug) || isGolfCategoryValue(listing.categoryName);
}

export function filterGolfListings<T extends Pick<GolfListing, "categorySlug" | "categoryName">>(
  listings: T[],
): T[] {
  return listings.filter(isGolfListingCategory);
}

function matchesFilter(
  filter: string | null | undefined,
  candidates: Array<string | null | undefined>,
): boolean {
  const normalizedFilter = normalizeFilterValue(filter);
  if (!normalizedFilter) return true;

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeFilterValue(candidate);
    return (
      normalizedCandidate === normalizedFilter ||
      normalizedCandidate.includes(normalizedFilter)
    );
  });
}

function mapGolfListing(
  row: Record<string, unknown>,
  detailsByListingId: Map<string, GolfCourseDetails>,
  holeCountsByListingId: Map<string, number>,
): GolfListing | null {
  const id = toNullableString(row.id);
  const slug = toNullableString(row.slug);
  const name = toNullableString(row.name);

  if (!id || !slug || !name) return null;

  const city = mapLocationRef(unwrapRelation(row.city));
  const region = mapLocationRef(unwrapRelation(row.region));
  const category = unwrapRelation(row.category);
  const categorySlug = toNullableString(category?.slug);
  const categoryName = toNullableString(category?.name);
  const isGolfCategory = isGolfCategoryValue(categorySlug) || isGolfCategoryValue(categoryName);
  const categoryData = asRecord(row.category_data);

  const detailsFromTable = detailsByListingId.get(id) ?? null;
  const categoryGolf = asRecord(categoryData?.golf);
  const categoryFacilities = asRecord(categoryData?.facilities);
  const categoryAccess = asRecord(categoryData?.access);
  const categoryPositioning = asRecord(categoryData?.positioning);
  const categoryDataDetailsSource = categoryData
    ? {
        ...categoryData,
        ...(categoryGolf ?? {}),
        driving_range: categoryFacilities?.driving_range,
        clubhouse: categoryFacilities?.clubhouse,
        restaurant: categoryFacilities?.restaurant,
        buggy_available: categoryFacilities?.buggy,
        academy: categoryFacilities?.academy,
        access_type: categoryAccess?.type,
        price_range: categoryPositioning?.price_range,
      }
    : null;
  const detailsFromCategoryData = mapCourseDetails(categoryDataDetailsSource, id);
  const details = mergeCourseDetails(id, detailsFromTable, detailsFromCategoryData);
  const scorecardHoles = mapScorecardHoles(categoryData);

  return {
    id,
    slug,
    name,
    shortDescription: toNullableString(row.short_description),
    description: toNullableString(row.description),
    featuredImageUrl: normalizePublicImageUrl(toNullableString(row.featured_image_url)),
    tier: toNullableString(row.tier),
    status: toNullableString(row.status),
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
    websiteUrl: toNullableString(row.website_url),
    contactPhone: toNullableString(row.contact_phone),
    contactEmail: toNullableString(row.contact_email),
    googleRating: toNullableNumber(row.google_rating),
    googleReviewCount: toInteger(row.google_review_count),
    city,
    region,
    categorySlug: isGolfCategory ? CANONICAL_GOLF_CATEGORY_SLUG : categorySlug,
    categoryName,
    details,
    holeCount: holeCountsByListingId.get(id) ?? 0,
    scorecardHoles,
  };
}

export async function getGolfListings(options?: {
  region?: string;
  city?: string;
  limit?: number;
}) {
  const supabase = createPublicServerClient();
  const categoryIds = await getGolfCategoryIds(supabase);

  if (categoryIds.length === 0) return [] as GolfListing[];

  let query = supabase
    .from("listings")
    .select(GOLF_LISTING_FIELDS)
    .eq("status", "published")
    .in("category_id", categoryIds)
    .order("is_curated", { ascending: false })
    .order("google_rating", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (options?.limit && Number.isFinite(options.limit) && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [] as GolfListing[];

  const listingRows = (data ?? []) as Array<Record<string, unknown>>;
  const listingIds = listingRows
    .map((row) => toNullableString(row.id))
    .filter((value): value is string => value !== null);

  const detailsByListingId = await getGolfDetailsByListingId(supabase, listingIds);
  const holeCountsByListingId = await getGolfHoleCountsByListingId(supabase, listingIds);

  const mapped = filterGolfListings(listingRows
    .map((row) => mapGolfListing(row, detailsByListingId, holeCountsByListingId))
    .filter((row): row is GolfListing => row !== null));

  return mapped.filter((listing) => {
    const regionMatches = matchesFilter(options?.region, [
      listing.region?.slug,
      listing.region?.name,
    ]);
    const cityMatches = matchesFilter(options?.city, [
      listing.city?.slug,
      listing.city?.name,
    ]);
    return regionMatches && cityMatches;
  });
}

export async function getGolfListingBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const supabase = createPublicServerClient();
  const categoryIds = await getGolfCategoryIds(supabase);
  if (categoryIds.length === 0) return null;

  const { data, error } = await supabase
    .from("listings")
    .select(GOLF_LISTING_FIELDS)
    .eq("status", "published")
    .eq("slug", normalizedSlug)
    .in("category_id", categoryIds)
    .maybeSingle();

  if (error || !data) return null;

  const listingRow = data as Record<string, unknown>;
  const listingId = toNullableString(listingRow.id);
  const detailsByListingId = await getGolfDetailsByListingId(
    supabase,
    listingId ? [listingId] : [],
  );
  const holeCountsByListingId = await getGolfHoleCountsByListingId(
    supabase,
    listingId ? [listingId] : [],
  );

  const listing = mapGolfListing(listingRow, detailsByListingId, holeCountsByListingId);
  return listing && isGolfListingCategory(listing) ? listing : null;
}

export async function getCourses(options?: {
  region?: string;
  city?: string;
  limit?: number;
}) {
  return getGolfListings(options);
}

export async function getLeaderboard() {
  const supabase = createPublicServerClient();
  const candidateTables = ["golf_leaderboard", "golf_leaderboard_entries"] as const;

  for (const table of candidateTables) {
    const { data, error } = await supabase.from(table).select("*").limit(100);

    if (error) {
      if (isMissingRelationError(error)) {
        continue;
      }
      continue;
    }

    const mapped = (data ?? [])
      .map((row, index) => {
        const raw = asRecord(row);
        const player =
          toNullableString(raw?.player) ??
          toNullableString(raw?.player_name) ??
          toNullableString(raw?.full_name);
        if (!player) return null;

        return {
          rank: toNullableNumber(raw?.rank) ?? index + 1,
          player,
          score: toNullableNumber(raw?.score) ?? toNullableNumber(raw?.total_score) ?? 0,
          rounds:
            toNullableNumber(raw?.rounds_played) ?? toNullableNumber(raw?.rounds),
        } as GolfLeaderboardEntry;
      })
      .filter((row): row is GolfLeaderboardEntry => row !== null)
      .sort((a, b) => a.rank - b.rank);

    if (mapped.length > 0) {
      return mapped;
    }
  }

  return MOCK_LEADERBOARD;
}
