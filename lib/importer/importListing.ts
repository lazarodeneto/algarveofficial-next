import type { Database, Json } from "@/integrations/supabase/types";
import type { ImportPreviewRow, NormalizedImportListing, GolfHoleImport } from "@/lib/admin/listing-json-import";
import { normalizeImportCategory, resolveImportGolfObject } from "@/lib/admin/listing-json-import";
import { detectImporterType, type ImporterType } from "./detectType";
import { normalizeImportObject } from "./normalize";
import { conciergeImportSchema } from "./schemas/concierge";
import { golfImportSchema } from "./schemas/golf";
import { propertyImportSchema } from "./schemas/property";
import { flattenZodErrors } from "./schemas/shared";
import { transformImportListing } from "./transform";
import { getDisallowedSlugInputError, normalizeSlug, slugifyEntityName } from "@/lib/slugify";

export type ImportListingType = "golf" | "property" | "concierge-services" | "standard";

export type ImportListingResult = {
  ok: boolean;
  type: ImportListingType;
  listingId?: string;
  preview: ImportPreviewRow;
  normalized?: NormalizedImportListing;
  warnings: string[];
  errors: Array<{ path: string; message: string }>;
  changed: {
    listing: "inserted" | "updated" | "unchanged";
    vertical: "inserted" | "updated" | "skipped";
    children: number;
  };
};

type LooseSupabaseError = { code?: string; message: string };
type LooseSupabaseResult = {
  data?: unknown;
  error?: LooseSupabaseError | null;
};
type LooseSupabaseQuery = PromiseLike<LooseSupabaseResult> & LooseSupabaseResult & {
  select: (...args: unknown[]) => LooseSupabaseQuery;
  eq: (...args: unknown[]) => LooseSupabaseQuery;
  in: (...args: unknown[]) => LooseSupabaseQuery;
  maybeSingle: () => LooseSupabaseQuery;
  single: () => LooseSupabaseQuery;
  insert: (...args: unknown[]) => LooseSupabaseQuery;
  update: (...args: unknown[]) => LooseSupabaseQuery;
  delete: () => LooseSupabaseQuery;
};
export type ImporterSupabaseClient = {
  from: (table: string) => LooseSupabaseQuery;
};

const DEFAULT_IMPORT_OWNER_ID = "280be9b4-c0fe-48f3-b371-f490d8cccfd5";

type ImportReferenceData = {
  categoryBySlug: Map<string, string>;
  cityByNameOrSlug: Map<string, string>;
  regionByNameOrSlug: Map<string, string>;
};

type ExistingImportListing = {
  id?: string;
  slug?: string | null;
  name?: string | null;
  address?: string | null;
  city_id?: string | null;
  category_data?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asFiniteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBooleanOrFalse(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStableText(value: unknown): string {
  return typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    : "";
}

function isStableListingMatch(
  existing: ExistingImportListing,
  listing: NormalizedImportListing,
  cityId: string | undefined,
) {
  if (listing.base.id && existing.id === listing.base.id) return true;

  const namesMatch = normalizeStableText(existing.name) === normalizeStableText(listing.base.name);
  if (!namesMatch) return false;

  const existingAddress = normalizeStableText(existing.address);
  const nextAddress = normalizeStableText(listing.base.address);
  const addressMatches = Boolean(existingAddress && nextAddress && existingAddress === nextAddress);
  const cityMatches = Boolean(cityId && existing.city_id === cityId);

  return cityMatches || addressMatches;
}

async function readImportListingById(
  writeClient: ImporterSupabaseClient,
  listingId: string,
): Promise<{ existing: ExistingImportListing | null; error?: string }> {
  const result = await writeClient
    .from("listings")
    .select("id, slug, name, address, city_id, category_data")
    .eq("id", listingId)
    .maybeSingle();

  if (result.error) return { existing: null, error: result.error.message };
  return { existing: asRecord(result.data) as ExistingImportListing };
}

async function resolveExistingImportListing(
  writeClient: ImporterSupabaseClient,
  listing: NormalizedImportListing,
  cityId: string | undefined,
): Promise<{ existing: ExistingImportListing | null; warnings: string[]; errors: Array<{ path: string; message: string }> }> {
  const warnings: string[] = [];
  const errors: Array<{ path: string; message: string }> = [];
  const candidates = new Map<string, ExistingImportListing>();

  const addCandidate = (candidate: ExistingImportListing | null) => {
    if (candidate?.id) candidates.set(candidate.id, candidate);
  };

  if (listing.base.id) {
    const byId = await readImportListingById(writeClient, listing.base.id);
    if (byId.error) {
      errors.push({ path: "listing.id", message: byId.error });
    } else {
      addCandidate(byId.existing);
    }
  }

  const bySlug = await writeClient
    .from("listings")
    .select("id, slug, name, address, city_id, category_data")
    .eq("slug", listing.base.slug)
    .maybeSingle();

  if (bySlug.error) {
    errors.push({ path: "URL_slug", message: bySlug.error.message });
  } else {
    addCandidate(asRecord(bySlug.data) as ExistingImportListing);
  }

  const slugAliasesTable = writeClient.from("listing_slugs") as Partial<LooseSupabaseQuery>;
  if (typeof slugAliasesTable.select === "function") {
    const aliasResult = await slugAliasesTable
      .select("listing_id")
      .eq("slug", listing.base.slug)
      .maybeSingle();

    if (aliasResult.error) {
      errors.push({ path: "URL_slug", message: aliasResult.error.message });
    } else {
      const aliasListingId = asStringOrNull(asRecord(aliasResult.data)?.listing_id);
      if (aliasListingId) {
        const byAlias = await readImportListingById(writeClient, aliasListingId);
        if (byAlias.error) {
          errors.push({ path: "URL_slug", message: byAlias.error });
        } else {
          addCandidate(byAlias.existing);
        }
      }
    }
  }

  if (candidates.size === 0 && listing.base.name && cityId) {
    const byStableFields = await writeClient
      .from("listings")
      .select("id, slug, name, address, city_id, category_data")
      .eq("name", listing.base.name)
      .maybeSingle();

    if (byStableFields.error) {
      errors.push({ path: "name", message: byStableFields.error.message });
    } else {
      addCandidate(asRecord(byStableFields.data) as ExistingImportListing);
    }
  }

  if (errors.length > 0) return { existing: null, warnings, errors };
  if (candidates.size === 0) return { existing: null, warnings, errors };

  const candidateList = Array.from(candidates.values());
  if (candidateList.length > 1) {
    return {
      existing: null,
      warnings,
      errors: [{
        path: "URL_slug",
        message: `URL_slug "${listing.base.slug}" resolves to multiple existing listings; import aborted to avoid changing the wrong listing.`,
      }],
    };
  }

  const existing = candidateList[0];
  if (!existing?.id) return { existing: null, warnings, errors };

  if (!isStableListingMatch(existing, listing, cityId)) {
    return {
      existing: null,
      warnings,
      errors: [{
        path: "URL_slug",
        message: `URL_slug "${listing.base.slug}" is already associated with an existing listing, but name/address/city do not match. Include a stable listing id or correct the source data.`,
      }],
    };
  }

  if (existing.slug && existing.slug !== listing.base.slug) {
    warnings.push(`Existing listing "${existing.slug}" will be updated to canonical slug "${listing.base.slug}".`);
  }

  return { existing, warnings, errors };
}

function asJsonOrNull(value: unknown): Json | null {
  return value === undefined ? null : value as Json;
}

export function buildGolfCoursePersistencePayload(
  listingId: string,
  listing: NormalizedImportListing,
) {
  const golf = asRecord(listing.categoryDataPatch.golf);
  const holesCount = asFiniteNumberOrNull(listing.categoryDataPatch.holes) ?? asFiniteNumberOrNull(golf.holes) ?? 18;

  return {
    listing_id: listingId,
    name: listing.name,
    holes_count: holesCount,
    is_default: true,
    holes: asFiniteNumberOrNull(listing.categoryDataPatch.holes) ?? asFiniteNumberOrNull(golf.holes),
    par: asFiniteNumberOrNull(listing.categoryDataPatch.par) ?? asFiniteNumberOrNull(golf.par),
    slope: asJsonOrNull(listing.categoryDataPatch.slope ?? golf.slope),
    course_rating: asJsonOrNull(listing.categoryDataPatch.course_rating ?? golf.course_rating),
    length_meters: asJsonOrNull(listing.categoryDataPatch.length_meters ?? golf.length_meters),
    designer: asStringOrNull(listing.categoryDataPatch.designer ?? golf.designer),
    year_opened: asFiniteNumberOrNull(golf.year_opened),
    last_renovation: asFiniteNumberOrNull(golf.last_renovation),
    layout_type: asStringOrNull(golf.layout_type),
    difficulty: asStringOrNull(golf.difficulty),
    is_tournament_course: asBooleanOrFalse(golf.is_tournament_course),
    is_signature: asBooleanOrFalse(golf.is_signature),
  };
}

function buildInvalidPreview(
  index: number,
  raw: Record<string, unknown>,
  type: ImportListingType,
  category: string,
  errors: Array<{ path: string; message: string }>,
): ImportPreviewRow {
  const name = typeof raw.Nome === "string" ? raw.Nome : typeof raw.name === "string" ? raw.name : "";
  const rawSlug = typeof raw.URL_slug === "string" ? raw.URL_slug : typeof raw.slug === "string" ? raw.slug : "";
  const slug = rawSlug && !getDisallowedSlugInputError(rawSlug)
    ? normalizeSlug(rawSlug, { entityType: "listing" })
    : name
      ? slugifyEntityName(name, { entityType: "listing" })
      : "";
  const city = typeof raw.City === "string" ? raw.City : typeof raw.city === "string" ? raw.city : "";
  const golf = type === "golf" ? resolveImportGolfObject(raw) : {};
  const holes = typeof golf.holes === "number" ? golf.holes : undefined;
  const par = typeof golf.par === "number" ? golf.par : undefined;
  return {
    index,
    name,
    slug,
    city,
    normalizedCategory: category,
    vertical: type === "concierge-services" ? "service" : type === "standard" ? "none" : type,
    estimatedAction: "invalid",
    holes,
    par,
    warnings: [],
    errors: errors.map((error) => error.path ? `${error.path}: ${error.message}` : error.message),
  };
}

function schemaForType(type: ImporterType) {
  if (type === "golf") return golfImportSchema;
  if (type === "property") return propertyImportSchema;
  if (type === "concierge-services") return conciergeImportSchema;
  return null;
}

function buildSchemaCandidate(raw: Record<string, unknown>, type: ImporterType, category: string) {
  const candidate: Record<string, unknown> = { ...raw, category };
  if (type === "golf") {
    const golf = resolveImportGolfObject(raw);
    if (Object.keys(golf).length > 0) candidate.golf = golf;
  }
  return candidate;
}

function normalizeSchemaErrors(
  errors: Array<{ path: string; message: string }>,
  type: ImporterType,
) {
  if (type !== "golf") return errors;

  return errors.map((error) => {
    if (error.path === "golf.holes") {
      return { ...error, message: "golf.holes must be a positive number." };
    }
    if (error.path === "golf.par") {
      return { ...error, message: "golf.par must be a positive number." };
    }
    return error;
  });
}

function toLegacyType(type: ImporterType): ImportListingType {
  return type;
}

function mergeCategoryData(
  current: unknown,
  patch: Record<string, Json>,
  nextType: ImportListingType,
) {
  const currentRecord = asRecord(current) as Record<string, Json>;
  const mergeObject = (key: string) =>
    patch[key] && typeof currentRecord[key] === "object" && currentRecord[key] !== null && !Array.isArray(currentRecord[key])
      ? { ...(currentRecord[key] as Record<string, Json>), ...(patch[key] as Record<string, Json>) }
      : patch[key] ?? currentRecord[key];

  const next: Record<string, Json | undefined> = {
    ...currentRecord,
    ...patch,
    golf: mergeObject("golf"),
    property: mergeObject("property"),
    service: mergeObject("service"),
    facilities: mergeObject("facilities"),
    access: mergeObject("access"),
    positioning: mergeObject("positioning"),
    media: mergeObject("media"),
    seo: mergeObject("seo"),
    scorecard: patch.scorecard ?? currentRecord.scorecard,
    scorecard_holes: patch.scorecard_holes ?? currentRecord.scorecard_holes,
  };

  if (nextType === "golf") {
    delete next.property;
    delete next.service;
  } else if (nextType === "property") {
    delete next.golf;
    delete next.facilities;
    delete next.access;
    delete next.scorecard;
    delete next.scorecard_holes;
    delete next.service;
  } else if (nextType === "concierge-services") {
    delete next.golf;
    delete next.facilities;
    delete next.access;
    delete next.scorecard;
    delete next.scorecard_holes;
    delete next.property;
  }

  return next;
}

async function loadReferenceData(writeClient: ImporterSupabaseClient): Promise<ImportReferenceData | { error: string }> {
  const [categoriesResult, citiesResult, regionsResult] = await Promise.all([
    writeClient.from("categories").select("id, slug"),
    writeClient.from("cities").select("id, name, slug"),
    writeClient.from("regions").select("id, name, slug"),
  ]);

  const errors = [categoriesResult.error, citiesResult.error, regionsResult.error].filter(Boolean);
  if (errors.length > 0) {
    return { error: errors[0]?.message ?? "Reference data read failed." };
  }

  const categoryBySlug = new Map((Array.isArray(categoriesResult.data) ? categoriesResult.data : []).map((category) => {
    const row = category as { id: string; slug: string };
    return [row.slug, row.id] as const;
  }));
  const cityByNameOrSlug = new Map<string, string>();
  for (const city of (Array.isArray(citiesResult.data) ? citiesResult.data : []) as Array<{ id: string; name: string; slug: string }>) {
    cityByNameOrSlug.set(city.name.trim().toLowerCase(), city.id);
    cityByNameOrSlug.set(city.slug.trim().toLowerCase(), city.id);
  }
  const regionByNameOrSlug = new Map<string, string>();
  for (const region of (Array.isArray(regionsResult.data) ? regionsResult.data : []) as Array<{ id: string; name: string; slug: string }>) {
    regionByNameOrSlug.set(region.name.trim().toLowerCase(), region.id);
    regionByNameOrSlug.set(region.slug.trim().toLowerCase(), region.id);
  }

  return { categoryBySlug, cityByNameOrSlug, regionByNameOrSlug };
}

function validateListingReferences(
  listing: NormalizedImportListing,
  refs: ImportReferenceData,
): Array<{ path: string; message: string }> {
  const categoryId = refs.categoryBySlug.get(listing.base.categorySlug);
  const cityId = refs.cityByNameOrSlug.get(listing.base.cityName.trim().toLowerCase());

  if (!categoryId) {
    return [{ path: "category", message: `Category "${listing.base.categorySlug}" was not found.` }];
  }

  if (!cityId) {
    return [{ path: "city", message: `City "${listing.base.cityName}" was not found.` }];
  }

  return [];
}

async function cleanupStaleVerticalRows(writeClient: ImporterSupabaseClient, listingId: string, nextType: ImportListingType) {
  if (nextType === "golf") return;
  await writeClient.from("golf_holes").delete().eq("listing_id", listingId);
  await writeClient.from("golf_courses").delete().eq("listing_id", listingId);
}

async function persistGolfData(
  writeClient: ImporterSupabaseClient,
  listingId: string,
  listing: NormalizedImportListing,
): Promise<{ children: number; warnings: string[]; error?: string }> {
  if (listing.vertical !== "golf") return { children: 0, warnings: [] };
  const holesCount = Number(listing.categoryDataPatch.holes);
  if (!Number.isInteger(holesCount) || holesCount < 1 || holesCount > 18) {
    return {
      children: 0,
      warnings: ["Golf table scorecard persistence supports 1-18 holes in the current schema; full data was preserved in category_data."],
    };
  }
  const coursePayload = buildGolfCoursePersistencePayload(listingId, listing);

  const coursesQuery = await writeClient
    .from("golf_courses")
    .select("id")
    .eq("listing_id", listingId)
    .eq("is_default", true)
    .maybeSingle();

  if (coursesQuery.error && coursesQuery.error.code !== "42P01" && coursesQuery.error.code !== "PGRST205") {
    return { children: 0, warnings: [], error: coursesQuery.error.message };
  }

  let courseId = asRecord(coursesQuery.data).id as string | undefined;
  if (!courseId) {
    const inserted = await writeClient
      .from("golf_courses")
      .insert(coursePayload)
      .select("id")
      .single();

    if (inserted.error) return { children: 0, warnings: [], error: inserted.error.message };
    courseId = asRecord(inserted.data).id as string | undefined;
  } else {
    const updated = await writeClient
      .from("golf_courses")
      .update(coursePayload)
      .eq("id", courseId);
    if (updated.error) return { children: 0, warnings: [], error: updated.error.message };
  }

  if (listing.golfHoles.length === 0) return { children: 0, warnings: [] };

  const deleted = await writeClient.from("golf_holes").delete().eq("course_id", courseId);
  if (deleted.error && deleted.error.code !== "42P01" && deleted.error.code !== "42703" && deleted.error.code !== "PGRST205") {
    return { children: 0, warnings: [], error: deleted.error.message };
  }

  const rows = listing.golfHoles.map((hole: GolfHoleImport) => ({
    listing_id: listingId,
    course_id: courseId,
    hole_number: hole.hole_number,
    par: hole.par,
    stroke_index: hole.stroke_index,
    distance_white: hole.distance_white,
    distance_yellow: hole.distance_yellow,
    distance_red: hole.distance_red,
  }));

  const inserted = await writeClient.from("golf_holes").insert(rows);
  if (inserted.error) return { children: 0, warnings: [], error: inserted.error.message };

  return { children: rows.length, warnings: [] };
}

export async function importListing(
  rawJson: unknown,
  options: {
    index?: number;
    dryRun?: boolean;
    writeClient?: ImporterSupabaseClient;
    fallbackCategory?: string;
    existingSlugs?: Set<string>;
  } = {},
): Promise<ImportListingResult> {
  const index = options.index ?? 0;
  const normalizedRaw = normalizeImportObject(rawJson);
  const detected = detectImporterType(normalizedRaw);
  const type = toLegacyType(detected.type);
  const category = detected.category || normalizeImportCategory(options.fallbackCategory);
  const schema = schemaForType(detected.type);
  const schemaErrors = schema ? (() => {
    const candidate = buildSchemaCandidate(normalizedRaw, detected.type, category);
    const parsed = schema.safeParse(candidate);
    return parsed.success ? [] : normalizeSchemaErrors(flattenZodErrors(parsed.error), detected.type);
  })() : [];
  const validationErrors = [...detected.errors, ...schemaErrors];

  if (validationErrors.length > 0) {
    return {
      ok: false,
      type,
      preview: buildInvalidPreview(index, normalizedRaw, type, category, validationErrors),
      warnings: [],
      errors: validationErrors,
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const transformed = transformImportListing(normalizedRaw, index, {
    fallbackCategory: category,
    existingSlugs: options.existingSlugs,
  });
  const row = transformed.normalized;
  const rowErrors = row.errors.map((message) => ({ path: "", message }));

  if (rowErrors.length > 0) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: rowErrors,
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  let refs: ImportReferenceData | null = null;
  if (options.writeClient) {
    const referenceData = await loadReferenceData(options.writeClient);
    if ("error" in referenceData) {
      return {
        ok: false,
        type,
        preview: row,
        normalized: row,
        warnings: row.warnings,
        errors: [{ path: "reference_data", message: referenceData.error }],
        changed: { listing: "unchanged", vertical: "skipped", children: 0 },
      };
    }

    refs = referenceData;
    const referenceErrors = validateListingReferences(row, refs);
    if (referenceErrors.length > 0) {
      return {
        ok: false,
        type,
        preview: row,
        normalized: row,
        warnings: row.warnings,
        errors: referenceErrors,
        changed: { listing: "unchanged", vertical: "skipped", children: 0 },
      };
    }
  }

  if (options.dryRun || !options.writeClient) {
    return {
      ok: true,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [],
      changed: { listing: "unchanged", vertical: "skipped", children: row.golfHoles.length },
    };
  }

  if (!refs) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [{ path: "reference_data", message: "Reference data read failed." }],
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const categoryId = refs.categoryBySlug.get(row.base.categorySlug);
  const cityId = refs.cityByNameOrSlug.get(row.base.cityName.trim().toLowerCase());

  const existingResolution = await resolveExistingImportListing(options.writeClient, row, cityId);
  if (existingResolution.errors.length > 0) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: existingResolution.errors,
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const existing = existingResolution.existing ?? {};
  const regionId = row.base.regionName ? refs.regionByNameOrSlug.get(row.base.regionName.trim().toLowerCase()) : undefined;
  const categoryData = mergeCategoryData(existing.category_data, row.categoryDataPatch, type);
  const basePayload = {
    name: row.base.name,
    slug: row.base.slug,
    category_id: categoryId,
    city_id: cityId,
    region_id: regionId,
    description: row.base.description,
    short_description: row.base.shortDescription,
    website_url: row.base.websiteUrl,
    featured_image_url: row.base.featuredImageUrl ?? null,
    contact_phone: row.base.phone,
    contact_email: row.base.email,
    address: row.base.address,
    latitude: row.base.latitude,
    longitude: row.base.longitude,
    tags: row.base.tags,
    category_data: categoryData as Json,
    meta_title: row.base.metaTitle,
    meta_description: row.base.metaDescription,
    price_from: row.listingPrice?.priceFrom,
    price_currency: row.listingPrice?.currency,
  } satisfies Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
  const payload = Object.fromEntries(
    Object.entries(basePayload).filter(([, value]) => value !== undefined),
  ) as Partial<Database["public"]["Tables"]["listings"]["Insert"]>;

  const writeResult = existing.id
    ? await options.writeClient
        .from("listings")
        .update(payload as Database["public"]["Tables"]["listings"]["Update"])
        .eq("id", existing.id)
        .select("id, slug, name")
        .single()
    : await options.writeClient
        .from("listings")
        .insert({
          ...payload,
          owner_id: DEFAULT_IMPORT_OWNER_ID,
          status: "published",
          tier: row.base.tier ?? "unverified",
        } as Database["public"]["Tables"]["listings"]["Insert"])
        .select("id, slug, name")
        .single();

  if (writeResult.error || !writeResult.data) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [{ path: "listing", message: writeResult.error?.message ?? "Listing write failed." }],
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const listingId = asRecord(writeResult.data).id as string;
  await cleanupStaleVerticalRows(options.writeClient, listingId, type);

  let children = 0;
  const warnings = [...row.warnings, ...existingResolution.warnings];
  if (type === "golf") {
    const golfResult = await persistGolfData(options.writeClient, listingId, row);
    warnings.push(...golfResult.warnings);
    if (golfResult.error) {
      if (!existing.id) {
        await options.writeClient.from("listings").delete().eq("id", listingId);
      }
      return {
        ok: false,
        type,
        listingId,
        preview: row,
        normalized: row,
        warnings,
        errors: [{ path: "golf", message: golfResult.error }],
        changed: { listing: existing.id ? "updated" : "inserted", vertical: "skipped", children: 0 },
      };
    }
    children = golfResult.children;
  }

  return {
    ok: true,
    type,
    listingId,
    preview: row,
    normalized: row,
    warnings,
    errors: [],
    changed: {
      listing: existing.id ? "updated" : "inserted",
      vertical: type === "standard" ? "skipped" : existing.id ? "updated" : "inserted",
      children,
    },
  };
}
