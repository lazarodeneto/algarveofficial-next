import type { Database, Json } from "@/integrations/supabase/types";
import type { ImportPreviewRow, NormalizedImportListing, GolfHoleImport } from "@/lib/admin/listing-json-import";
import { normalizeImportCategory } from "@/lib/admin/listing-json-import";
import { detectImporterType, type ImporterType } from "./detectType";
import { normalizeImportObject } from "./normalize";
import { conciergeImportSchema } from "./schemas/concierge";
import { golfImportSchema } from "./schemas/golf";
import { propertyImportSchema } from "./schemas/property";
import { flattenZodErrors } from "./schemas/shared";
import { transformImportListing } from "./transform";

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
  const slug = typeof raw.URL_slug === "string" ? raw.URL_slug : typeof raw.slug === "string" ? raw.slug : "";
  const city = typeof raw.City === "string" ? raw.City : typeof raw.city === "string" ? raw.city : "";
  return {
    index,
    name,
    slug,
    city,
    normalizedCategory: category,
    vertical: type === "concierge-services" ? "service" : type === "standard" ? "none" : type,
    estimatedAction: "invalid",
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

async function loadReferenceData(writeClient: ImporterSupabaseClient) {
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
    const candidate = { ...normalizedRaw, category };
    const parsed = schema.safeParse(candidate);
    return parsed.success ? [] : flattenZodErrors(parsed.error);
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

  const refs = await loadReferenceData(options.writeClient);
  if ("error" in refs) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [{ path: "reference_data", message: refs.error ?? "Reference data read failed." }],
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const categoryId = refs.categoryBySlug.get(row.base.categorySlug);
  const cityId = refs.cityByNameOrSlug.get(row.base.cityName.trim().toLowerCase());
  if (!categoryId || !cityId) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [{
        path: !categoryId ? "category" : "city",
        message: !categoryId
          ? `Category "${row.base.categorySlug}" was not found.`
          : `City "${row.base.cityName}" was not found.`,
      }],
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const existingResult = await options.writeClient
    .from("listings")
    .select("id, category_data")
    .eq(row.base.id ? "id" : "slug", row.base.id ?? row.base.slug)
    .maybeSingle();

  if (existingResult.error) {
    return {
      ok: false,
      type,
      preview: row,
      normalized: row,
      warnings: row.warnings,
      errors: [{ path: "listing", message: existingResult.error.message }],
      changed: { listing: "unchanged", vertical: "skipped", children: 0 },
    };
  }

  const existing = asRecord(existingResult.data);
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
  const warnings = [...row.warnings];
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
