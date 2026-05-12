import type { Json } from "@/integrations/supabase/types";
import {
  getDisallowedSlugInputError,
  getSlugValidationError,
  normalizeSlug,
  slugifyEntityName,
} from "@/lib/slugify";
import { optionalNullableNumber } from "@/lib/validation/helpers";

export type ImportVertical = "none" | "golf" | "property" | "service";

export type ImportPreviewRow = {
  index: number;
  name: string;
  slug: string;
  city: string;
  normalizedCategory: string;
  vertical: ImportVertical;
  estimatedAction: "create" | "update" | "invalid";
  holes?: number;
  par?: number;
  tier?: string;
  subcategory?: string;
  scorecardRows?: number;
  warnings: string[];
  errors: string[];
};

export type NormalizedImportListing = ImportPreviewRow & {
  base: {
    id?: string;
    name: string;
    slug: string;
    cityName: string;
    regionName?: string;
    country: string;
    categorySlug: string;
    description?: string;
    shortDescription?: string;
    websiteUrl?: string;
    featuredImageUrl?: string | null;
    phone?: string;
    email?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    metaTitle?: string;
    metaDescription?: string;
    tier?: "unverified" | "verified" | "signature";
    tags?: string[];
    photos?: string[];
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    youtubeUrl?: string | null;
    tiktokUrl?: string | null;
    googleBusinessUrl?: string | null;
    googleRating?: number | null;
    googleReviewCount?: number | null;
  };
  listingPrice?: {
    priceFrom?: number;
    currency?: string;
  };
  categoryDataPatch: Record<string, Json>;
  golfHoles: GolfHoleImport[];
  scorecardProvided: boolean;
};

export type GolfHoleImport = {
  hole_number: number;
  par: number;
  stroke_index: number | null;
  distance_white: number | null;
  distance_yellow: number | null;
  distance_red: number | null;
  description?: string;
};

const CATEGORY_ALIASES: Record<string, string> = {
  accommodation: "accommodation",
  accommodations: "accommodation",
  "places-to-stay": "accommodation",
  "places to stay": "accommodation",
  stay: "accommodation",
  stays: "accommodation",
  hotel: "accommodation",
  hotels: "accommodation",
  villa: "accommodation",
  villas: "accommodation",
  apartment: "accommodation",
  apartments: "accommodation",
  restaurant: "restaurants",
  restaurants: "restaurants",
  "eat-drink": "restaurants",
  "eat & drink": "restaurants",
  experiences: "experiences",
  experience: "experiences",
  services: "concierge-services",
  service: "concierge-services",
  "concierge-services": "concierge-services",
  "concierge services": "concierge-services",
  concierge: "concierge-services",
  "premium-services": "concierge-services",
  "premium services": "concierge-services",
  "local-services": "concierge-services",
  "local services": "concierge-services",
  wellness: "wellness-spas",
  spa: "wellness-spas",
  spas: "wellness-spas",
  shopping: "shopping",
  shop: "shopping",
  events: "events",
  event: "events",
  nightlife: "nightlife",
  beach: "beaches",
  beaches: "beaches",
  "algarve beaches": "beaches",
  "beach club": "beach-clubs",
  "beach clubs": "beach-clubs",
  "beach-club": "beach-clubs",
  "beach-clubs": "beach-clubs",
  transport: "transportation",
  transportation: "transportation",
  golf: "golf",
  "golf course": "golf",
  "golf-course": "golf",
  "golf courses": "golf",
  "golf-courses": "golf",
  property: "real-estate",
  properties: "real-estate",
  "real estate": "real-estate",
  "real-estate": "real-estate",
  "luxury properties": "real-estate",
};

const GOLF_ALIAS_MAP: Record<string, string> = {
  Golf_Course_Type: "course_type",
  Holes: "holes",
  Holes_Count: "holes",
  holes_count: "holes",
  holesCount: "holes",
  Par: "par",
  Length_Meters: "length_meters",
  Length_Yards: "length_yards",
  Designer: "designer",
  Opened_Year: "opened_year",
  Year_Opened: "year_opened",
  Green_Fee_From: "green_fee_from",
  Booking_URL: "booking_url",
  Hole_Data: "hole_data",
};

const PROPERTY_ALIAS_MAP: Record<string, string> = {
  Property_Type: "property_type",
  Transaction_Type: "transaction_type",
  Price: "price",
  Currency: "currency",
  Bedrooms: "bedrooms",
  Bathrooms: "bathrooms",
  Built_Area_m2: "built_area_m2",
  Plot_Area_m2: "plot_area_m2",
  Energy_Certificate: "energy_certificate",
  Pool: "pool",
  Garden: "garden",
  Garage: "garage",
  Sea_View: "sea_view",
  Agent_Name: "agent_name",
  Agent_Email: "agent_email",
  Property_URL: "property_url",
};

const GOLF_FIELDS = new Set([
  "course_type",
  "holes",
  "par",
  "length_meters",
  "length_yards",
  "designer",
  "opened_year",
  "handicap_required",
  "driving_range",
  "putting_green",
  "chipping_area",
  "clubhouse",
  "pro_shop",
  "buggy_available",
  "trolley_available",
  "rental_clubs",
  "lessons_available",
  "restaurant",
  "bar",
  "spa",
  "hotel_on_site",
  "booking_url",
  "green_fee_from",
  "green_fee_to",
  "green_fee_currency",
  "phone_booking",
  "email_booking",
  "hole_data",
]);

const PROPERTY_FIELDS = new Set([
  "property_type",
  "transaction_type",
  "price",
  "currency",
  "price_period",
  "bedrooms",
  "bathrooms",
  "built_area_m2",
  "plot_area_m2",
  "living_area_m2",
  "terrace_area_m2",
  "year_built",
  "renovation_year",
  "energy_certificate",
  "pool",
  "private_pool",
  "communal_pool",
  "garden",
  "garage",
  "parking_spaces",
  "sea_view",
  "golf_view",
  "marina_view",
  "gated_community",
  "furnished",
  "heating",
  "air_conditioning",
  "fireplace",
  "elevator",
  "floor",
  "total_floors",
  "agent_name",
  "agent_phone",
  "agent_email",
  "agency_name",
  "property_url",
  "reference_code",
  "availability_status",
]);

const BOOLEAN_FIELDS = new Set([
  "handicap_required",
  "driving_range",
  "putting_green",
  "chipping_area",
  "clubhouse",
  "pro_shop",
  "buggy_available",
  "trolley_available",
  "rental_clubs",
  "lessons_available",
  "restaurant",
  "bar",
  "spa",
  "hotel_on_site",
  "pool",
  "private_pool",
  "communal_pool",
  "garden",
  "garage",
  "sea_view",
  "golf_view",
  "marina_view",
  "gated_community",
  "furnished",
  "heating",
  "air_conditioning",
  "fireplace",
  "elevator",
  "is_tournament_course",
  "is_signature",
  "short_game_area",
  "academy",
  "buggy",
  "caddie",
  "locker_room",
  "allows_visitors",
  "membership_required",
]);

const NUMERIC_FIELDS = new Set([
  "holes",
  "par",
  "length_meters",
  "length_yards",
  "opened_year",
  "green_fee_from",
  "green_fee_to",
  "price",
  "bedrooms",
  "bathrooms",
  "built_area_m2",
  "plot_area_m2",
  "living_area_m2",
  "terrace_area_m2",
  "year_built",
  "renovation_year",
  "parking_spaces",
  "floor",
  "total_floors",
  "last_renovation",
  "white",
  "yellow",
  "red",
  "hcp",
  "slope",
  "course_rating",
]);

const VALID_LISTING_TIERS = new Set(["unverified", "verified", "signature"]);
const VALID_SERVICE_PRICE_RANGES = new Set(["low", "medium", "high", "luxury"]);

const VALID_TRANSACTION_TYPES = new Set(["sale", "rent", "short-term-rental", "investment", "development"]);
const VALID_PROPERTY_TYPES = new Set([
  "villa",
  "apartment",
  "townhouse",
  "plot",
  "land",
  "commercial",
  "farm",
  "estate",
  "development",
  "penthouse",
  "other",
]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function nullableString(record: Record<string, unknown>, key: string): string | null | undefined {
  if (!hasOwn(record, key)) return undefined;
  if (record[key] === null) return null;
  return asString(record[key]);
}

function firstNullableString(...values: Array<string | null | undefined>): string | null | undefined {
  return values.find((value) => value !== undefined);
}

function nullableNumber(record: Record<string, unknown>, key: string): number | null | undefined {
  if (!hasOwn(record, key)) return undefined;
  if (record[key] === null) return null;
  return toNumber(record[key]);
}

function firstNullableNumber(...values: Array<number | null | undefined>): number | null | undefined {
  return values.find((value) => value !== undefined);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readNumericArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toNumber(item))
    .filter((item): item is number => item !== undefined);
}

function normalizeOptionalNumber(value: unknown): { ok: true; value: number | null } | { ok: false } {
  const parsed = optionalNullableNumber.safeParse(value);
  if (parsed.success) return { ok: true, value: parsed.data ?? null };
  return { ok: false };
}

function readOptionalNumber(
  value: unknown,
  path: string,
  errors: string[],
): number | null | undefined {
  const normalized = normalizeOptionalNumber(value);
  if (normalized.ok) return normalized.value;
  errors.push(`${path} must be numeric if present.`);
  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y", "1", "sim"].includes(normalized)) return true;
    if (["false", "no", "n", "0", "nao", "não"].includes(normalized)) return false;
  }
  return undefined;
}

function normalizeKey(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

export function normalizeImportCategory(value: unknown, fallback?: string) {
  const raw = asString(value) ?? asString(fallback) ?? "";
  const key = raw.trim().toLowerCase().replace(/_/g, "-");
  const spaced = raw.trim().toLowerCase().replace(/[_-]+/g, " ");
  return CATEGORY_ALIASES[key] ?? CATEGORY_ALIASES[spaced] ?? slugifyEntityName(raw, { entityType: "taxonomy" });
}

export function getImportCategoryInput(row: Record<string, unknown>, fallback?: string) {
  const categoryData = asRecord(row.category_data ?? row.categoryData);
  return (
    asString(row.category) ??
    asString(row.Category) ??
    asString(row.category_slug) ??
    asString(row.categorySlug) ??
    asString(categoryData.vertical) ??
    asString(categoryData.category) ??
    asString(categoryData.category_slug) ??
    asString(fallback)
  );
}

export function normalizeImportCategoryForRow(row: Record<string, unknown>, fallback?: string) {
  return normalizeImportCategory(getImportCategoryInput(row, fallback));
}

function normalizeTransactionType(value: unknown) {
  const raw = asString(value);
  if (!raw) return undefined;
  const normalized = raw.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  if (["short-term", "holiday-rental", "short-term-rent"].includes(normalized)) return "short-term-rental";
  return VALID_TRANSACTION_TYPES.has(normalized) ? normalized : undefined;
}

function normalizePropertyType(value: unknown) {
  const raw = asString(value);
  if (!raw) return undefined;
  const normalized = raw.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  return VALID_PROPERTY_TYPES.has(normalized) ? normalized : "other";
}

function toJsonRecord(record: Record<string, unknown>): Record<string, Json> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  ) as Record<string, Json>;
}

function assignJson(target: Record<string, Json>, key: string, value: unknown) {
  if (value !== undefined) target[key] = value as Json;
}

function normalizeOptionalNumericRecord(
  value: unknown,
  path: string,
  errors: string[],
): Json | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string" && value.trim() === "") return null;

  if (typeof value !== "object" || Array.isArray(value)) {
    const numeric = readOptionalNumber(value, path, errors);
    return numeric === undefined ? undefined : numeric;
  }

  const source = asRecord(value);
  const result: Record<string, Json> = {};
  for (const tee of ["white", "yellow", "red"] as const) {
    if (source[tee] === undefined) continue;
    const numeric = readOptionalNumber(source[tee], `${path}.${tee}`, errors);
    if (numeric === undefined) {
      continue;
    } else {
      result[tee] = numeric;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

function readArrayOfStrings(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter((item): item is string => Boolean(item));
  }
  const single = asString(value);
  return single ? single.split(",").map((item) => item.trim()).filter(Boolean) : undefined;
}

function readRequiredArrayOfStrings(
  value: unknown,
  path: string,
  errors: string[],
): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return undefined;
  }
  const strings: string[] = [];
  for (const item of value) {
    const text = asString(item);
    if (!text) {
      errors.push(`${path} must contain only strings.`);
      continue;
    }
    strings.push(text);
  }
  return strings;
}

function collectVerticalObject(
  row: Record<string, unknown>,
  key: "golf" | "property",
  aliases: Record<string, string>,
): Record<string, unknown> {
  const nested = asRecord(row[key]);
  const collected: Record<string, unknown> = { ...nested };
  for (const [alias, target] of Object.entries(aliases)) {
    if (row[alias] !== undefined) collected[target] = row[alias];
  }
  return collected;
}

function categoryDataIsGolf(categoryData: Record<string, unknown>) {
  return normalizeImportCategory(categoryData.vertical) === "golf";
}

function categoryDataHasGolfFields(categoryData: Record<string, unknown>) {
  return (
    categoryData.holes !== undefined ||
    categoryData.holes_count !== undefined ||
    categoryData.holesCount !== undefined ||
    categoryData.par !== undefined ||
    Object.keys(asRecord(categoryData.golf)).length > 0
  );
}

function normalizeGolfImportObject(raw: Record<string, unknown>) {
  const normalized: Record<string, unknown> = { ...raw };
  normalized.holes ??= raw.holes_count ?? raw.holesCount ?? raw.Holes_Count ?? raw.Holes;
  normalized.par ??= raw.Par;
  normalized.length_meters ??= raw.Length_Meters;
  normalized.length_yards ??= raw.Length_Yards;
  normalized.designer ??= raw.Designer;
  normalized.opened_year ??= raw.Opened_Year;
  normalized.year_opened ??= raw.Year_Opened;
  normalized.green_fee_from ??= raw.Green_Fee_From;
  normalized.booking_url ??= raw.Booking_URL;
  normalized.hole_data ??= raw.Hole_Data ?? raw.scorecard;
  return normalized;
}

export function resolveImportGolfObject(row: Record<string, unknown>) {
  const topLevelGolf = collectVerticalObject(row, "golf", GOLF_ALIAS_MAP);
  const categoryData = asRecord(row.category_data ?? row.categoryData);
  const nestedCategoryDataGolf = asRecord(categoryData.golf);
  const categoryDataGolf =
    categoryDataIsGolf(categoryData) || normalizeImportCategoryForRow(row) === "golf" || categoryDataHasGolfFields(categoryData)
      ? Object.keys(nestedCategoryDataGolf).length > 0
        ? nestedCategoryDataGolf
        : categoryData
      : {};

  if (Object.keys(topLevelGolf).length > 0) {
    return normalizeGolfImportObject({ ...categoryDataGolf, ...topLevelGolf });
  }

  if (Object.keys(categoryDataGolf).length === 0) {
    return {};
  }

  return normalizeGolfImportObject(categoryDataGolf);
}

export function hasImportGolfObject(row: Record<string, unknown>) {
  return Object.keys(resolveImportGolfObject(row)).length > 0;
}

function normalizeVerticalFields(
  raw: Record<string, unknown>,
  allowed: Set<string>,
  warnings: string[],
): Record<string, Json> {
  const result: Record<string, Json> = {};

  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const key = normalizeKey(rawKey);
    if (!allowed.has(key)) {
      warnings.push(`Unsupported nested field ignored: ${rawKey}.`);
      continue;
    }

    if (BOOLEAN_FIELDS.has(key)) {
      const bool = toBoolean(rawValue);
      if (bool !== undefined) result[key] = bool;
      continue;
    }

    if (NUMERIC_FIELDS.has(key)) {
      const num = toNumber(rawValue);
      if (num !== undefined) result[key] = num;
      continue;
    }

    if (key !== "hole_data") {
      const str = asString(rawValue);
      if (str) result[key] = str;
    }
  }

  return result;
}

function normalizeGolfHoles(
  rawHoleData: unknown,
  declaredHoles: number | undefined,
  warnings: string[],
  errors: string[],
): GolfHoleImport[] {
  if (rawHoleData === undefined) return [];
  if (!Array.isArray(rawHoleData)) {
    errors.push("scorecard must be an array.");
    return [];
  }

  const seen = new Set<number>();
  const holes: GolfHoleImport[] = [];
  for (const rawHole of rawHoleData) {
    const hole = asRecord(rawHole);
    const holeNumber = toNumber(hole.hole ?? hole.hole_number);
    const par = toNumber(hole.par);
    if (!holeNumber || !Number.isInteger(holeNumber) || holeNumber < 1) {
      errors.push("scorecard row has an invalid hole number.");
      continue;
    }
    if (seen.has(holeNumber)) {
      errors.push(`scorecard has duplicate hole number ${holeNumber}.`);
      continue;
    }
    if (!par || !Number.isInteger(par) || par < 2 || par > 6) {
      warnings.push(`Golf hole ${holeNumber} has an invalid par and was ignored.`);
      continue;
    }
    const strokeIndex = toNumber(hole.hcp ?? hole.stroke_index ?? hole.hcp_10_27 ?? hole.hcp_19_9);
    if (strokeIndex !== undefined && (strokeIndex < 1 || strokeIndex > Math.max(declaredHoles ?? 18, 18))) {
      warnings.push(`Golf hole ${holeNumber} has an unusual stroke_index.`);
    }
    const distances = readNumericArray(hole.distances_meters);
    const firstDistance = distances[0];
    const secondDistance = distances[1];
    const finalDistance = distances.length > 0 ? distances[distances.length - 1] : undefined;
    seen.add(holeNumber);
    holes.push({
      hole_number: holeNumber,
      par,
      stroke_index: strokeIndex && Number.isInteger(strokeIndex) ? strokeIndex : null,
      distance_white: toNumber(hole.white ?? hole.distance_white ?? hole.meters) ?? firstDistance ?? null,
      distance_yellow: toNumber(hole.yellow ?? hole.distance_yellow ?? hole.meters) ?? secondDistance ?? firstDistance ?? null,
      distance_red: toNumber(hole.red ?? hole.distance_red) ?? finalDistance ?? null,
      description: asString(hole.description),
    });
  }

  if (declaredHoles && holes.length > 0 && holes.length !== declaredHoles) {
    warnings.push(`Scorecard has ${holes.length} row${holes.length === 1 ? "" : "s"} but golf.holes is ${declaredHoles}.`);
  }

  return holes.sort((a, b) => a.hole_number - b.hole_number);
}

function normalizeTier(value: unknown): "unverified" | "verified" | "signature" | undefined {
  const raw = asString(value)?.toLowerCase();
  if (!raw) return undefined;
  return VALID_LISTING_TIERS.has(raw) ? raw as "unverified" | "verified" | "signature" : undefined;
}

export function normalizeImportListing(
  value: unknown,
  index: number,
  options: { fallbackCategory?: string; existingSlugs?: Set<string> } = {},
): NormalizedImportListing {
  const row = asRecord(value);
  const warnings: string[] = [];
  const errors: string[] = [];
  const name = asString(row.Nome ?? row.Name ?? row.name) ?? "";
  const explicitSlug = asString(row.URL_slug ?? row.slug ?? row.Slug);
  const explicitSlugInputError = explicitSlug ? getDisallowedSlugInputError(explicitSlug) : null;
  const location = asRecord(row.location);
  const categoryData = asRecord(row.category_data ?? row.categoryData);
  const cityName = asString(row.City ?? row.city) ?? asString(location.city) ?? "";
  const hasTopLevelGolf = Object.keys(asRecord(row.golf)).length > 0;
  const golfRaw = resolveImportGolfObject(row);
  const hasResolvedGolf = Object.keys(golfRaw).length > 0;
  const categorySlug = hasResolvedGolf ? "golf" : normalizeImportCategoryForRow(row, options.fallbackCategory);
  const nameSlug = name ? slugifyEntityName(name, { entityType: "listing" }) : "";
  const sourceSlug = explicitSlug
    ? normalizeSlug(explicitSlug, { entityType: "listing" })
    : nameSlug;
  const slug = categorySlug === "golf" && nameSlug ? nameSlug : sourceSlug;
  const media = asRecord(row.media);
  const seo = asRecord(row.seo);
  const contact = asRecord(row.contact);
  const socials = asRecord(row.socials);
  const businessDetails = asRecord(row.business_details);
  const content = asRecord(row.content);
  const address = asRecord(row.address);
  const positioningRaw = asRecord(row.positioning);
  const serviceListingRaw = asRecord(row.listing);
  const serviceDetailsRaw = asRecord(row.details);
  const serviceRelationsRaw = asRecord(row.relations);
  const country = asString(row.Country ?? row.country) ?? "Portugal";

  if (!name) errors.push("Name is required.");
  if (!explicitSlug && name) warnings.push("URL_slug missing; slug will be generated from Nome.");
  if (explicitSlug && explicitSlugInputError) errors.push(`URL_slug is invalid: ${explicitSlugInputError}`);
  if (explicitSlug && !explicitSlugInputError && explicitSlug !== sourceSlug) {
    warnings.push(`URL_slug normalized from "${explicitSlug}" to "${sourceSlug}".`);
  }
  if (categorySlug === "golf" && explicitSlug && !explicitSlugInputError && sourceSlug && sourceSlug !== slug) {
    warnings.push(`Golf URL_slug "${sourceSlug}" will use canonical course-name slug "${slug}".`);
  }
  const slugValidationError = getSlugValidationError(slug, { entityType: "listing" });
  if (slugValidationError) errors.push(`URL_slug is invalid: ${slugValidationError}`);
  if (!cityName) errors.push("City is required.");
  if (!categorySlug) errors.push("Category is required.");
  if (!asString(row.Country ?? row.country)) warnings.push("Country missing; defaulting to Portugal.");

  const propertyRaw = collectVerticalObject(row, "property", PROPERTY_ALIAS_MAP);
  const hasServiceStructuredData =
    Object.keys(serviceListingRaw).length > 0 ||
    Object.keys(serviceDetailsRaw).length > 0 ||
    row.features !== undefined ||
    Object.keys(serviceRelationsRaw).length > 0;
  const vertical: ImportVertical =
    categorySlug === "golf" || Object.keys(golfRaw).length > 0
      ? "golf"
      : categorySlug === "real-estate" || Object.keys(propertyRaw).length > 0
        ? "property"
        : categorySlug === "concierge-services" && hasServiceStructuredData
          ? "service"
          : "none";

  const categoryDataPatch: Record<string, Json> = {};
  let listingPrice: NormalizedImportListing["listingPrice"];
  let golfHoles: GolfHoleImport[] = [];
  let scorecardProvided = false;
  let previewHoles: number | undefined;
  let previewPar: number | undefined;
  let previewTier = normalizeTier(positioningRaw.tier);
  let previewSubcategory: string | undefined;

  if (Object.keys(categoryData).length > 0) {
    Object.assign(categoryDataPatch, toJsonRecord(categoryData));
  }

  if (categorySlug === "beaches") {
    const beachRaw = asRecord(row.beach ?? row.beaches ?? row.beach_details ?? row.beachDetails);
    const beachValue = (key: string, ...values: unknown[]) => {
      const value = values.find((candidate) => candidate !== undefined);
      if (value !== undefined) assignJson(categoryDataPatch, key, value);
    };
    beachValue("highlights", row.highlights, beachRaw.highlights);
    beachValue("full_description", row.full_description, beachRaw.full_description, content.full_description);
    beachValue("includes", row.includes, beachRaw.includes);
    beachValue("excludes", row.excludes ?? row.not_included, beachRaw.excludes ?? beachRaw.not_included);
    beachValue("not_suitable_for", row.not_suitable_for, beachRaw.not_suitable_for);
    beachValue("meeting_point", row.meeting_point, beachRaw.meeting_point);
    beachValue("meeting_point_google_maps_url", row.meeting_point_google_maps_url, beachRaw.meeting_point_google_maps_url);
    beachValue("what_to_bring", row.what_to_bring, beachRaw.what_to_bring);
    beachValue("not_allowed", row.not_allowed, beachRaw.not_allowed);
    beachValue("know_before_you_go", row.know_before_you_go, beachRaw.know_before_you_go);
    beachValue("testimonials", row.testimonials, beachRaw.testimonials);
    beachValue("seo_link_groups", row.seo_link_groups, beachRaw.seo_link_groups);
    beachValue("related_tag_groups", row.related_tag_groups, beachRaw.related_tag_groups);
  }

  if (vertical === "golf") {
    if (hasTopLevelGolf) warnings.push("Golf schema detected from top-level golf object.");
    if (!hasTopLevelGolf && hasResolvedGolf) warnings.push("Golf schema detected from category_data.");
    const holes = toNumber(golfRaw.holes);
    const par = toNumber(golfRaw.par);
    previewHoles = holes;
    previewPar = par;
    if (!holes || holes <= 0) {
      errors.push("golf.holes must be a positive number.");
    }
    if (!par || par < 27 || par > 180) {
      errors.push("golf.par must be a reasonable golf course par.");
    }

    const slope = normalizeOptionalNumericRecord(golfRaw.slope, "golf.slope", errors);
    const courseRating = normalizeOptionalNumericRecord(golfRaw.course_rating, "golf.course_rating", errors);
    const lengthMeters = normalizeOptionalNumericRecord(golfRaw.length_meters, "golf.length_meters", errors);
    const yearOpened = readOptionalNumber(golfRaw.year_opened ?? golfRaw.opened_year, "golf.year_opened", errors);
    const lastRenovation = readOptionalNumber(golfRaw.last_renovation, "golf.last_renovation", errors);

    const isSignature = toBoolean(golfRaw.is_signature);
    if (!previewTier && isSignature === true) {
      previewTier = "signature";
      warnings.push("golf.is_signature=true; tier will default to signature on create.");
    }
    if (positioningRaw.tier !== undefined && !previewTier) {
      warnings.push("positioning.tier ignored because value is not valid.");
    }

    const golf = toJsonRecord({
      course_type: asString(golfRaw.course_type),
      holes,
      par,
      slope,
      course_rating: courseRating,
      length_meters: lengthMeters,
      designer: asString(golfRaw.designer),
      year_opened: yearOpened ?? null,
      last_renovation: lastRenovation ?? null,
      layout_type: asString(golfRaw.layout_type),
      difficulty: asString(golfRaw.difficulty),
      is_tournament_course: toBoolean(golfRaw.is_tournament_course),
      is_signature: isSignature,
    });
    const facilitiesRaw = asRecord(row.facilities);
    const facilities = toJsonRecord({
      driving_range: toBoolean(facilitiesRaw.driving_range ?? golfRaw.driving_range),
      short_game_area: toBoolean(facilitiesRaw.short_game_area ?? golfRaw.short_game_area),
      putting_green: toBoolean(facilitiesRaw.putting_green ?? golfRaw.putting_green),
      academy: toBoolean(facilitiesRaw.academy),
      clubhouse: toBoolean(facilitiesRaw.clubhouse ?? golfRaw.clubhouse),
      restaurant: toBoolean(facilitiesRaw.restaurant ?? golfRaw.restaurant),
      pro_shop: toBoolean(facilitiesRaw.pro_shop ?? golfRaw.pro_shop),
      buggy: toBoolean(facilitiesRaw.buggy ?? golfRaw.buggy_available),
      caddie: toBoolean(facilitiesRaw.caddie),
      locker_room: toBoolean(facilitiesRaw.locker_room),
    });
    const accessRaw = asRecord(row.access);
    const access = toJsonRecord({
      type: asString(accessRaw.type),
      allows_visitors: toBoolean(accessRaw.allows_visitors),
      membership_required: toBoolean(accessRaw.membership_required),
    });
    const positioning = toJsonRecord({
      tier: previewTier,
      target: asString(positioningRaw.target),
      price_range: asString(positioningRaw.price_range),
    });
    const mediaPatch = toJsonRecord({
      featured_image: asString(media.featured_image),
      gallery: Array.isArray(media.gallery) ? media.gallery.filter((item) => typeof item === "string") : undefined,
    });
    const seoPatch = toJsonRecord({
      meta_title: asString(seo.meta_title),
      meta_description: asString(seo.meta_description),
    });
    scorecardProvided = row.scorecard !== undefined || golfRaw.hole_data !== undefined || golfRaw.scorecard !== undefined;
    golfHoles = normalizeGolfHoles(row.scorecard ?? golfRaw.hole_data ?? golfRaw.scorecard, holes, warnings, errors);
    if (golfHoles.length > 0) {
      categoryDataPatch.scorecard = Array.isArray(row.scorecard)
        ? row.scorecard as Json
        : golfHoles.map((hole) => ({
          hole: hole.hole_number,
          par: hole.par,
          hcp: hole.stroke_index,
          white: hole.distance_white,
          yellow: hole.distance_yellow,
          red: hole.distance_red,
        })) as unknown as Json;
      categoryDataPatch.scorecard_holes = golfHoles as unknown as Json;
    }
    categoryDataPatch.golf = golf;
    categoryDataPatch.facilities = facilities;
    categoryDataPatch.access = access;
    categoryDataPatch.positioning = positioning;
    categoryDataPatch.media = mediaPatch;
    categoryDataPatch.seo = seoPatch;
    categoryDataPatch.country = country;
    categoryDataPatch.holes = holes ?? null;
    categoryDataPatch.holes_count = holes ?? null;
    categoryDataPatch.par = par ?? null;
    categoryDataPatch.designer = golf.designer ?? null;
    categoryDataPatch.architect = golf.designer ?? null;
    categoryDataPatch.length_meters = lengthMeters ?? null;
    categoryDataPatch.course_rating = courseRating ?? null;
    categoryDataPatch.slope = slope ?? null;
    categoryDataPatch.slope_rating = readOptionalNumber(golfRaw.slope_rating, "category_data.slope_rating", errors) ?? null;
    categoryDataPatch.booking_url = asString(golfRaw.booking_url ?? categoryData.booking_url) ?? null;
    categoryDataPatch.scorecard_pdf_url = asString(categoryData.scorecard_url ?? golfRaw.scorecard_url) ?? null;
    categoryDataPatch.map_image_url = asString(categoryData.course_map_url ?? golfRaw.course_map_url) ?? null;
    if (Object.keys(businessDetails).length > 0) categoryDataPatch.business_details = businessDetails as Json;
    if (Object.keys(contact).length > 0) categoryDataPatch.contact = contact as Json;
    if (Object.keys(socials).length > 0) categoryDataPatch.socials = socials as Json;
    if (Object.keys(content).length > 0) categoryDataPatch.content = content as Json;
    if (Object.keys(address).length > 0) categoryDataPatch.address = address as Json;
    if (Object.keys(categoryData).length > 0) {
      assignJson(categoryDataPatch, "official_sources", categoryData.official_sources);
      assignJson(categoryDataPatch, "facilities_list", categoryData.facilities);
      assignJson(categoryDataPatch, "course_map_url", categoryData.course_map_url);
      assignJson(categoryDataPatch, "scorecard_url", categoryData.scorecard_url);
    }
    if (Array.isArray(row.sources)) categoryDataPatch.sources = row.sources as Json;
    if (Array.isArray(row.missing_or_unverified_fields)) {
      categoryDataPatch.missing_or_unverified_fields = row.missing_or_unverified_fields as Json;
    }
    categoryDataPatch.algarve_status = asString(row.algarve_status) ?? null;
    categoryDataPatch.verification_confidence = asString(row.verification_confidence) ?? null;
    categoryDataPatch.verification_notes = asString(row.verification_notes) ?? null;
    categoryDataPatch.opening_hours = asString(businessDetails.opening_hours) ?? null;
    if (Array.isArray(businessDetails.services)) categoryDataPatch.services = businessDetails.services as Json;
    if (Array.isArray(businessDetails.amenities)) categoryDataPatch.amenities = businessDetails.amenities as Json;
  }

  if (vertical === "property") {
    const property = normalizeVerticalFields(propertyRaw, PROPERTY_FIELDS, warnings);
    const transactionType = normalizeTransactionType(propertyRaw.transaction_type);
    if (propertyRaw.transaction_type !== undefined && !transactionType) {
      errors.push("Property transaction_type must normalize to sale, rent, short-term-rental, investment, or development.");
    }
    if (transactionType) property.transaction_type = transactionType;
    property.property_type = normalizePropertyType(propertyRaw.property_type) ?? property.property_type ?? "other";
    if (property.currency === undefined) property.currency = "EUR";
    if (propertyRaw.price !== undefined && typeof property.price !== "number") {
      errors.push("Property price must be numeric if present.");
    }
    if (property.price === undefined) {
      warnings.push("Property price is missing.");
    }
    categoryDataPatch.property = property;
    for (const [key, propValue] of Object.entries(property)) {
      categoryDataPatch[key] = propValue;
    }
    listingPrice = {
      priceFrom: typeof property.price === "number" ? property.price : undefined,
      currency: typeof property.currency === "string" ? property.currency : "EUR",
    };
  }

  if (vertical === "service") {
    warnings.push("Concierge Services structured data detected.");

    if (row.listing !== undefined && Object.keys(serviceListingRaw).length === 0) {
      errors.push("listing must be an object.");
    }
    if (row.details !== undefined && Object.keys(serviceDetailsRaw).length === 0) {
      errors.push("details must be an object.");
    }
    if (row.relations !== undefined && Object.keys(serviceRelationsRaw).length === 0) {
      errors.push("relations must be an object.");
    }

    const listingType = asString(serviceListingRaw.type) ?? "service";
    previewSubcategory = asString(serviceListingRaw.subcategory);
    if (!previewSubcategory) {
      warnings.push("listing.subcategory missing; service will be imported without subcategory.");
    }

    const detailsTitle = asString(serviceDetailsRaw.title);
    const detailsDescription = asString(serviceDetailsRaw.description);
    if (!detailsTitle) warnings.push("details.title missing; service listing may be less descriptive.");
    if (!detailsDescription) warnings.push("details.description missing; service listing may be less descriptive.");

    const target =
      serviceDetailsRaw.target === undefined
        ? undefined
        : asString(serviceDetailsRaw.target);
    if (serviceDetailsRaw.target !== undefined && !target) {
      errors.push("details.target must be a string if present.");
    }

    const priceRangeRaw = asString(serviceDetailsRaw.price_range);
    let priceRange: string | undefined;
    if (priceRangeRaw) {
      const normalizedPriceRange = priceRangeRaw.toLowerCase().replace(/[_\s]+/g, "-");
      if (VALID_SERVICE_PRICE_RANGES.has(normalizedPriceRange)) {
        priceRange = normalizedPriceRange;
      } else {
        errors.push("details.price_range must be one of: low, medium, high, luxury.");
      }
    }

    const features = readRequiredArrayOfStrings(row.features, "features", errors);
    if (features === undefined) warnings.push("features missing; service listing may be less filterable.");

    const nearbyCourses = readRequiredArrayOfStrings(serviceRelationsRaw.nearby_courses, "relations.nearby_courses", errors);
    const relations = toJsonRecord({
      nearby_courses: nearbyCourses,
    });

    const service = toJsonRecord({
      listing: toJsonRecord({
        type: listingType,
        subcategory: previewSubcategory,
      }),
      details: toJsonRecord({
        title: detailsTitle,
        description: detailsDescription,
        target,
        price_range: priceRange,
      }),
      features,
      relations,
    });

    categoryDataPatch.service = service;
  }

  const photos = readArrayOfStrings(row.Photos ?? row.photos);
  const gallery = readArrayOfStrings(media.gallery);
  const featuredImage = asString(media.featured_image) ?? asString(row.Featured_Image_URL ?? row.featured_image_url ?? photos?.[0]);
  const googleRating = businessDetails.google_rating === undefined
    ? undefined
    : readOptionalNumber(businessDetails.google_rating, "business_details.google_rating", errors);
  const googleReviewCount = businessDetails.google_review_count === undefined
    ? undefined
    : readOptionalNumber(businessDetails.google_review_count, "business_details.google_review_count", errors);

  return {
    index,
    name,
    slug,
    city: cityName,
    normalizedCategory: categorySlug,
    vertical,
    estimatedAction: errors.length > 0 ? "invalid" : options.existingSlugs?.has(slug) ? "update" : "create",
    holes: previewHoles,
    par: previewPar,
    tier: previewTier,
    subcategory: previewSubcategory,
    scorecardRows: golfHoles.length,
    warnings,
    errors,
    base: {
      id: asString(row.id ?? row.ID),
      name,
      slug,
      cityName,
      regionName: asString(row.Region ?? row.region) ?? asString(location.region),
      country,
      categorySlug,
      description: asString(row.Description ?? row["Full Description"] ?? content.full_description ?? row.description),
      shortDescription: asString(row["Short Description"] ?? content.short_description ?? row.short_description),
      websiteUrl: asString(row.Website ?? contact.website ?? row.website_url),
      featuredImageUrl: featuredImage,
      phone: asString(row.Phone ?? contact.phone ?? row.contact_phone),
      email: asString(row.Email ?? contact.email ?? row.contact_email),
      address: asString(location.address ?? address.full_address ?? row["Full Address"] ?? row.Address ?? row.address),
      latitude: firstNullableNumber(nullableNumber(location, "latitude"), nullableNumber(row, "Latitude"), nullableNumber(row, "latitude")),
      longitude: firstNullableNumber(nullableNumber(location, "longitude"), nullableNumber(row, "Longitude"), nullableNumber(row, "longitude")),
      metaTitle: asString(seo.meta_title),
      metaDescription: asString(seo.meta_description),
      tier: previewTier ?? normalizeTier(row.tier),
      tags: readArrayOfStrings(row.Tags ?? row.tags),
      photos: gallery ?? photos,
      instagramUrl: firstNullableString(nullableString(socials, "instagram"), nullableString(row, "instagram_url")),
      facebookUrl: firstNullableString(nullableString(socials, "facebook"), nullableString(row, "facebook_url")),
      linkedinUrl: firstNullableString(nullableString(socials, "linkedin"), nullableString(row, "linkedin_url")),
      twitterUrl: firstNullableString(nullableString(socials, "x_twitter"), nullableString(socials, "twitter"), nullableString(row, "twitter_url")),
      youtubeUrl: firstNullableString(nullableString(socials, "youtube"), nullableString(row, "youtube_url")),
      tiktokUrl: firstNullableString(nullableString(socials, "tiktok"), nullableString(row, "tiktok_url")),
      googleBusinessUrl: firstNullableString(
        nullableString(businessDetails, "google_business_url"),
        nullableString(socials, "google_business"),
        nullableString(row, "google_business_url"),
      ),
      googleRating,
      googleReviewCount,
    },
    listingPrice,
    categoryDataPatch,
    golfHoles,
    scorecardProvided,
  };
}

export function normalizeImportListings(
  listings: unknown[],
  options: { fallbackCategory?: string; existingSlugs?: Set<string> } = {},
) {
  return listings.map((listing, index) => normalizeImportListing(listing, index, options));
}
