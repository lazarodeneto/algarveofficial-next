/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { AdminWriteAuth } from "@/lib/server/admin-auth";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { isEmptyOrValidUrl } from "@/lib/golf/booking-url";
import type {
  GolfCourseStructure,
  GolfHoleDataStatus,
  ListingGolfCourseForm,
  ListingGolfDetailsForm,
  ListingGolfHoleForm,
} from "@/types/listing";

export const runtime = "nodejs";

const MAX_COURSE_HOLES = 54;

const holeRowSchema = z.object({
  hole_number: z.number().int().min(1, "hole_number must be between 1 and 54.").max(MAX_COURSE_HOLES),
  par: z.number().int().min(1).nullable(),
  stroke_index: z.number().int().min(1).max(MAX_COURSE_HOLES).nullable().optional(),
  distance_white: z.number().int().min(0).nullable().optional(),
  distance_yellow: z.number().int().min(0).nullable().optional(),
  distance_red: z.number().int().min(0).nullable().optional(),
});

const golfCourseSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(255),
  holes_count: z.number().int().min(1).max(MAX_COURSE_HOLES),
  is_default: z.boolean().optional(),
  holes: z.array(holeRowSchema).max(MAX_COURSE_HOLES),
});

const golfDetailsSchema = z.object({
  holes_count: z.union([z.number().int().min(1).max(MAX_COURSE_HOLES), z.null()]).optional(),
  architect: z.string().max(255).optional(),
  course_rating: z.number().min(0).nullable().optional(),
  slope_rating: z.number().min(0).nullable().optional(),
  booking_url: z
    .string()
    .max(2048)
    .refine(isEmptyOrValidUrl, "booking_url must be empty or a valid URL.")
    .optional(),
  scorecard_image_url: z.string().max(2048).optional(),
  scorecard_pdf_url: z.string().max(2048).optional(),
  map_image_url: z.string().max(2048).optional(),
});

const golfPatchSchema = z.object({
  structure: z.enum(["single", "multi", "custom"]).optional(),
  details: golfDetailsSchema.optional(),
  courses: z.array(golfCourseSchema).max(10).optional(),
  clear_courses: z.boolean().optional(),
  generate_empty_holes: z.boolean().optional(),
  holes_count: z.union([z.number().int().min(1).max(MAX_COURSE_HOLES), z.null()]).optional(),
});

type ListingContext = {
  categoryData: Record<string, unknown>;
  categorySlug: string | null;
};

type ReadModelResult = {
  details: ListingGolfDetailsForm;
  structure: GolfCourseStructure;
  courses: ListingGolfCourseForm[];
  status: GolfHoleDataStatus;
};

type PersistedCourseRow = {
  id: string;
  name: string;
  holes_count: number;
  is_default: boolean;
};

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

function normalizeMissingRelationError(error: { code?: string } | null | undefined) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function normalizeMissingColumnError(error: { code?: string } | null | undefined) {
  return error?.code === "42703";
}

function toHoleCount(value: unknown): number | null {
  const parsed = toNullableNumber(value);
  if (!parsed || !Number.isInteger(parsed)) return null;
  return parsed;
}

function normalizeStructure(value: unknown, fallback: GolfCourseStructure = "single"): GolfCourseStructure {
  if (value === "single" || value === "multi" || value === "custom") return value;
  return fallback;
}

function buildDefaultGolfDetails(): ListingGolfDetailsForm {
  return {
    holes_count: 18,
    architect: "",
    course_rating: null,
    slope_rating: null,
    booking_url: "",
    scorecard_image_url: "",
    scorecard_pdf_url: "",
    map_image_url: "",
  };
}

function normalizeGolfDetails(
  detailsFromCategoryData: Record<string, unknown>,
  detailsFromTable: Record<string, unknown> | null,
): ListingGolfDetailsForm {
  const defaults = buildDefaultGolfDetails();
  const source = detailsFromTable ?? {};

  return {
    holes_count:
      toHoleCount(source.holes_count) ??
      toHoleCount(source.holes) ??
      toHoleCount(detailsFromCategoryData.holes_count) ??
      toHoleCount(detailsFromCategoryData.holes) ??
      defaults.holes_count,
    architect:
      toNullableString(source.architect) ??
      toNullableString(detailsFromCategoryData.architect) ??
      defaults.architect,
    course_rating:
      toNullableNumber(source.course_rating) ??
      toNullableNumber(detailsFromCategoryData.course_rating) ??
      defaults.course_rating,
    slope_rating:
      toNullableNumber(source.slope_rating) ??
      toNullableNumber(detailsFromCategoryData.slope_rating) ??
      defaults.slope_rating,
    booking_url:
      toNullableString(source.booking_url) ??
      toNullableString(detailsFromCategoryData.booking_url) ??
      defaults.booking_url,
    scorecard_image_url:
      toNullableString(source.scorecard_image_url) ??
      toNullableString(detailsFromCategoryData.scorecard_image_url) ??
      defaults.scorecard_image_url,
    scorecard_pdf_url:
      toNullableString(source.scorecard_pdf_url) ??
      toNullableString(detailsFromCategoryData.scorecard_pdf_url) ??
      defaults.scorecard_pdf_url,
    map_image_url:
      toNullableString(source.map_image_url) ??
      toNullableString(detailsFromCategoryData.map_image_url) ??
      defaults.map_image_url,
  };
}

function buildCategoryDataPatch(
  currentCategoryData: Record<string, unknown>,
  details: ListingGolfDetailsForm,
  structure: GolfCourseStructure,
  scorecardHoles: ListingGolfHoleForm[] | null | undefined = undefined,
) {
  const nextCategoryData: Record<string, unknown> = {
    ...currentCategoryData,
    course_structure: structure,
    holes_count: details.holes_count,
    holes: details.holes_count,
    architect: details.architect || null,
    course_rating: details.course_rating,
    slope_rating: details.slope_rating,
    booking_url: details.booking_url || null,
    scorecard_image_url: details.scorecard_image_url || null,
    scorecard_pdf_url: details.scorecard_pdf_url || null,
    map_image_url: details.map_image_url || null,
  };

  if (scorecardHoles !== undefined) {
    nextCategoryData.scorecard_holes = scorecardHoles;
  }

  return nextCategoryData;
}

function mapHoleRows(rawRows: unknown[]): ListingGolfHoleForm[] {
  return rawRows
    .map((raw) => {
      const row = asRecord(raw);
      const holeNumber = toNullableNumber(row?.hole_number);
      if (!holeNumber || !Number.isInteger(holeNumber)) return null;

      return {
        hole_number: holeNumber,
        par: toNullableNumber(row?.par),
        stroke_index: toNullableNumber(row?.stroke_index),
        distance_white: toNullableNumber(row?.distance_white),
        distance_yellow: toNullableNumber(row?.distance_yellow),
        distance_red: toNullableNumber(row?.distance_red),
      } satisfies ListingGolfHoleForm;
    })
    .filter((row): row is ListingGolfHoleForm => row !== null)
    .sort((a, b) => a.hole_number - b.hole_number);
}

function mapCategoryDataHoles(categoryData: Record<string, unknown>): ListingGolfHoleForm[] {
  const raw = categoryData.scorecard_holes;
  if (!Array.isArray(raw)) return [];
  return mapHoleRows(raw);
}

function buildGeneratedHoleRows(count: number): ListingGolfHoleForm[] {
  return Array.from({ length: count }, (_, index) => {
    const holeNumber = index + 1;
    return {
      hole_number: holeNumber,
      par: 4,
      stroke_index: holeNumber,
      distance_white: null,
      distance_yellow: null,
      distance_red: null,
    } satisfies ListingGolfHoleForm;
  });
}

function computeStatus(structure: GolfCourseStructure, courses: ListingGolfCourseForm[]): GolfHoleDataStatus {
  if (courses.length === 0 || courses.every((course) => course.holes.length === 0)) {
    return "missing";
  }

  if (structure !== "multi" && courses.length !== 1) {
    return "incomplete";
  }

  for (const course of courses) {
    if (course.holes_count > 18 && structure !== "multi") {
      return "incomplete";
    }

    if (course.holes_count > MAX_COURSE_HOLES) {
      return "incomplete";
    }

    if (course.holes.length !== course.holes_count) {
      return "incomplete";
    }

    const seen = new Set<number>();
    for (const hole of course.holes) {
      if (!Number.isInteger(hole.hole_number) || hole.hole_number < 1 || hole.hole_number > MAX_COURSE_HOLES) {
        return "incomplete";
      }

      if (seen.has(hole.hole_number)) {
        return "incomplete";
      }
      seen.add(hole.hole_number);

      if (!Number.isInteger(hole.par ?? null) || (hole.par ?? 0) < 1) {
        return "incomplete";
      }

      if (
        hole.stroke_index !== null &&
        (!Number.isInteger(hole.stroke_index) || hole.stroke_index < 1 || hole.stroke_index > MAX_COURSE_HOLES)
      ) {
        return "incomplete";
      }

      for (const field of ["distance_white", "distance_yellow", "distance_red"] as const) {
        const distance = hole[field];
        if (distance !== null && (!Number.isFinite(distance) || distance < 0)) {
          return "incomplete";
        }
      }
    }
  }

  return "configured";
}

function validateCoursePayload(structure: GolfCourseStructure, courses: ListingGolfCourseForm[]) {
  if (structure !== "multi" && courses.length !== 1) {
    return "Single and custom layouts must contain exactly one course.";
  }

  for (const course of courses) {
    if (!course.name.trim()) {
      return "Each course must have a name.";
    }

    if (!Number.isInteger(course.holes_count) || course.holes_count < 1 || course.holes_count > MAX_COURSE_HOLES) {
      return "Each course must have a valid holes_count.";
    }

    if (course.holes_count > 18 && structure !== "multi") {
      return "Holes above 18 require Multi-Course Resort mode.";
    }

    if (course.holes.length > course.holes_count) {
      return `Course ${course.name} has more holes than holes_count.`;
    }

    const seen = new Set<number>();
    for (const hole of course.holes) {
      if (seen.has(hole.hole_number)) {
        return `Course ${course.name} has duplicate hole numbers.`;
      }
      seen.add(hole.hole_number);

      if (!Number.isInteger(hole.par ?? null) || (hole.par ?? 0) < 1) {
        return `Course ${course.name} has an invalid par value.`;
      }
    }
  }

  return null;
}

async function loadListingContext(
  auth: AdminWriteAuth,
  listingId: string,
): Promise<ListingContext | null | NextResponse> {
  const { data, error } = await auth.userClient
    .from("listings")
    .select("id, category_data, category:categories(slug)")
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    return adminErrorResponse(400, "LISTING_READ_FAILED", error.message);
  }

  if (!data) return null;

  const listing = asRecord(data);
  const category = unwrapRelation(listing?.category);
  const categoryData = asRecord(listing?.category_data) ?? {};
  const categorySlug =
    toNullableString(category?.slug)?.toLowerCase() ??
    toNullableString(categoryData.slug)?.toLowerCase() ??
    null;

  return {
    categoryData,
    categorySlug,
  };
}

async function readDetailsRow(auth: AdminWriteAuth, listingId: string) {
  const detailsQuery = await (auth.writeClient as any)
    .from("golf_course_details")
    .select("*")
    .eq("listing_id", listingId)
    .maybeSingle();

  if (detailsQuery.error && !normalizeMissingRelationError(detailsQuery.error)) {
    return {
      error: adminErrorResponse(400, "GOLF_DETAILS_READ_FAILED", detailsQuery.error.message),
      data: null,
    };
  }

  return {
    error: null,
    data: asRecord(detailsQuery.data),
  };
}

async function readCoursesFromNewModel(auth: AdminWriteAuth, listingId: string) {
  const coursesQuery = await (auth.writeClient as any)
    .from("golf_courses")
    .select("id, name, holes_count, is_default")
    .eq("listing_id", listingId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (coursesQuery.error) {
    if (normalizeMissingRelationError(coursesQuery.error)) {
      return { mode: "legacy" as const, courses: [] as ListingGolfCourseForm[] };
    }

    return { error: adminErrorResponse(400, "GOLF_COURSES_READ_FAILED", coursesQuery.error.message) };
  }

  const rows = (coursesQuery.data ?? []) as Array<Record<string, unknown>>;
  if (rows.length === 0) {
    return { mode: "new" as const, courses: [] as ListingGolfCourseForm[] };
  }

  const courseIds = rows
    .map((row) => toNullableString(row.id))
    .filter((value): value is string => value !== null);

  const holesQuery = await (auth.writeClient as any)
    .from("golf_holes")
    .select("course_id, hole_number, par, stroke_index, distance_white, distance_yellow, distance_red")
    .in("course_id", courseIds)
    .order("hole_number", { ascending: true });

  if (holesQuery.error) {
    if (normalizeMissingRelationError(holesQuery.error) || normalizeMissingColumnError(holesQuery.error)) {
      return { mode: "legacy" as const, courses: [] as ListingGolfCourseForm[] };
    }

    return { error: adminErrorResponse(400, "GOLF_HOLES_READ_FAILED", holesQuery.error.message) };
  }

  const holesByCourseId = new Map<string, ListingGolfHoleForm[]>();
  for (const raw of (holesQuery.data ?? []) as Array<Record<string, unknown>>) {
    const courseId = toNullableString(raw.course_id);
    if (!courseId) continue;

    const holes = holesByCourseId.get(courseId) ?? [];
    holes.push({
      hole_number: toNullableNumber(raw.hole_number) ?? 0,
      par: toNullableNumber(raw.par),
      stroke_index: toNullableNumber(raw.stroke_index),
      distance_white: toNullableNumber(raw.distance_white),
      distance_yellow: toNullableNumber(raw.distance_yellow),
      distance_red: toNullableNumber(raw.distance_red),
    });
    holesByCourseId.set(courseId, holes);
  }

  const courses: ListingGolfCourseForm[] = rows
    .map((row, index) => {
      const courseId = toNullableString(row.id);
      if (!courseId) return null;

      return {
        id: courseId,
        name: toNullableString(row.name) ?? `Course ${index + 1}`,
        holes_count: toNullableNumber(row.holes_count) ?? 18,
        is_default: row.is_default === true,
        holes: (holesByCourseId.get(courseId) ?? []).sort((a, b) => a.hole_number - b.hole_number),
      } satisfies ListingGolfCourseForm;
    })
    .filter((row): row is ListingGolfCourseForm => row !== null);

  return { mode: "new" as const, courses };
}

async function readLegacySingleCourse(
  auth: AdminWriteAuth,
  listingId: string,
  defaultHolesCount: number,
  categoryData: Record<string, unknown>,
) {
  const holesQuery = await (auth.writeClient as any)
    .from("golf_holes")
    .select("hole_number, par, stroke_index, distance_white, distance_yellow, distance_red")
    .eq("listing_id", listingId)
    .order("hole_number", { ascending: true });

  if (holesQuery.error) {
    if (normalizeMissingRelationError(holesQuery.error) || normalizeMissingColumnError(holesQuery.error)) {
      return {
        courses: [
          {
            id: "legacy-default",
            name: "Main Course",
            holes_count: defaultHolesCount,
            is_default: true,
            holes: [],
          },
        ] as ListingGolfCourseForm[],
      };
    }

    return { error: adminErrorResponse(400, "GOLF_HOLES_READ_FAILED", holesQuery.error.message) };
  }

  const holesFromTable = mapHoleRows((holesQuery.data ?? []) as unknown[]);
  const holes = holesFromTable.length > 0 ? holesFromTable : mapCategoryDataHoles(categoryData);
  return {
    courses: [
      {
        id: "legacy-default",
        name: "Main Course",
        holes_count: defaultHolesCount,
        is_default: true,
        holes,
      },
    ] as ListingGolfCourseForm[],
  };
}

async function readGolfSetupData(
  auth: AdminWriteAuth,
  listingId: string,
  context: ListingContext,
) {
  const detailsResult = await readDetailsRow(auth, listingId);
  if (detailsResult.error) return detailsResult.error;

  const details = normalizeGolfDetails(context.categoryData, detailsResult.data);

  const newModel = await readCoursesFromNewModel(auth, listingId);
  if ("error" in newModel) {
    return newModel.error;
  }

  let courses: ListingGolfCourseForm[] = [];
  let structure = normalizeStructure(context.categoryData.course_structure, "single");

  if (newModel.mode === "new" && newModel.courses.length > 0) {
    courses = newModel.courses;
    if (structure !== "multi" && courses.length > 1) {
      structure = "multi";
    }
  } else {
    const defaultCount = details.holes_count ?? 18;
    const legacy = await readLegacySingleCourse(
      auth,
      listingId,
      defaultCount,
      context.categoryData,
    );
    if (legacy.error) return legacy.error;
    courses = legacy.courses;
  }

  if (courses.length === 0) {
    courses = [
      {
        id: "default-course",
        name: "Main Course",
        holes_count: details.holes_count ?? 18,
        is_default: true,
        holes: [],
      },
    ];
  }

  const status = computeStatus(structure, courses);

  return NextResponse.json({
    ok: true,
    data: {
      structure,
      details,
      courses,
      status,
    } satisfies ReadModelResult,
  });
}

async function upsertDetailsAndCategoryData(
  auth: AdminWriteAuth,
  listingId: string,
  listingContext: ListingContext,
  details: ListingGolfDetailsForm,
  structure: GolfCourseStructure,
  scorecardHoles: ListingGolfHoleForm[] | null | undefined = undefined,
) {
  const nextCategoryData = buildCategoryDataPatch(
    listingContext.categoryData,
    details,
    structure,
    scorecardHoles,
  );

  const { error: listingUpdateError } = await auth.writeClient
    .from("listings")
    .update({
      category_data: nextCategoryData as any,
    })
    .eq("id", listingId);

  if (listingUpdateError) {
    return {
      error: adminErrorResponse(400, "LISTING_UPDATE_FAILED", listingUpdateError.message),
      nextCategoryData: null,
    };
  }

  const { error: detailsUpsertError } = await (auth.writeClient as any)
    .from("golf_course_details")
    .upsert(
      {
        listing_id: listingId,
        holes: details.holes_count,
        architect: details.architect || null,
        course_rating: details.course_rating,
        slope_rating: details.slope_rating,
        booking_url: details.booking_url || null,
        scorecard_image_url: details.scorecard_image_url || null,
        scorecard_pdf_url: details.scorecard_pdf_url || null,
        map_image_url: details.map_image_url || null,
      },
      { onConflict: "listing_id" },
    );

  if (
    detailsUpsertError &&
    !normalizeMissingRelationError(detailsUpsertError) &&
    !normalizeMissingColumnError(detailsUpsertError)
  ) {
    return {
      error: adminErrorResponse(400, "GOLF_DETAILS_UPSERT_FAILED", detailsUpsertError.message),
      nextCategoryData: null,
    };
  }

  return {
    error: null,
    nextCategoryData,
  };
}

async function clearAllCourses(auth: AdminWriteAuth, listingId: string) {
  const coursesResult = await readCoursesFromNewModel(auth, listingId);

  if (!("error" in coursesResult) && coursesResult.mode === "new") {
    if (coursesResult.courses.length > 0) {
      const courseIds = coursesResult.courses.map((course) => course.id);
      const { error: deleteHolesError } = await (auth.writeClient as any)
        .from("golf_holes")
        .delete()
        .in("course_id", courseIds);

      if (deleteHolesError && !normalizeMissingRelationError(deleteHolesError)) {
        return adminErrorResponse(400, "GOLF_HOLES_CLEAR_FAILED", deleteHolesError.message);
      }

      const { error: deleteCoursesError } = await (auth.writeClient as any)
        .from("golf_courses")
        .delete()
        .eq("listing_id", listingId);

      if (deleteCoursesError && !normalizeMissingRelationError(deleteCoursesError)) {
        return adminErrorResponse(400, "GOLF_COURSES_CLEAR_FAILED", deleteCoursesError.message);
      }
    }

    return null;
  }

  const { error: clearError } = await (auth.writeClient as any)
    .from("golf_holes")
    .delete()
    .eq("listing_id", listingId);

  if (clearError && !normalizeMissingRelationError(clearError)) {
    return adminErrorResponse(400, "GOLF_HOLES_CLEAR_FAILED", clearError.message);
  }

  return null;
}

async function persistUsingNewModel(
  auth: AdminWriteAuth,
  listingId: string,
  courses: ListingGolfCourseForm[],
) {
  const existingResult = await readCoursesFromNewModel(auth, listingId);
  if ("error" in existingResult) return existingResult.error;
  if (existingResult.mode !== "new") return "LEGACY" as const;

  const existingById = new Map(existingResult.courses.map((course) => [course.id, course]));
  const keptCourseIds = new Set<string>();
  const persisted: PersistedCourseRow[] = [];

  const hasExplicitDefault = courses.some((course) => course.is_default);

  for (const [index, course] of courses.entries()) {
    const shouldBeDefault = hasExplicitDefault ? course.is_default : index === 0;
    const normalizedCourse = {
      name: course.name.trim(),
      holes_count: course.holes_count,
      is_default: shouldBeDefault,
    };

    if (course.id && existingById.has(course.id)) {
      const { error: updateError } = await (auth.writeClient as any)
        .from("golf_courses")
        .update(normalizedCourse)
        .eq("id", course.id)
        .eq("listing_id", listingId);

      if (updateError) {
        return adminErrorResponse(400, "GOLF_COURSE_UPDATE_FAILED", updateError.message);
      }

      keptCourseIds.add(course.id);
      persisted.push({ id: course.id, ...normalizedCourse });
    } else {
      const { data: inserted, error: insertError } = await (auth.writeClient as any)
        .from("golf_courses")
        .insert({
          listing_id: listingId,
          ...normalizedCourse,
        })
        .select("id, name, holes_count, is_default")
        .single();

      if (insertError || !inserted?.id) {
        return adminErrorResponse(
          400,
          "GOLF_COURSE_INSERT_FAILED",
          insertError?.message || "Failed to insert golf course.",
        );
      }

      keptCourseIds.add(inserted.id);
      persisted.push({
        id: inserted.id,
        name: inserted.name,
        holes_count: inserted.holes_count,
        is_default: inserted.is_default === true,
      });
    }
  }

  const toDelete = existingResult.courses
    .map((course) => course.id)
    .filter((courseId) => !keptCourseIds.has(courseId));

  if (toDelete.length > 0) {
    const { error: deleteOldHolesError } = await (auth.writeClient as any)
      .from("golf_holes")
      .delete()
      .in("course_id", toDelete);

    if (deleteOldHolesError && !normalizeMissingRelationError(deleteOldHolesError)) {
      return adminErrorResponse(400, "GOLF_HOLES_CLEANUP_FAILED", deleteOldHolesError.message);
    }

    const { error: deleteOldCoursesError } = await (auth.writeClient as any)
      .from("golf_courses")
      .delete()
      .in("id", toDelete);

    if (deleteOldCoursesError) {
      return adminErrorResponse(400, "GOLF_COURSE_DELETE_FAILED", deleteOldCoursesError.message);
    }
  }

  const persistedByIndex = persisted.map((course, index) => ({
    ...course,
    holes: courses[index].holes,
  }));

  const allPersistedCourseIds = persistedByIndex.map((course) => course.id);
  if (allPersistedCourseIds.length > 0) {
    const { error: wipeError } = await (auth.writeClient as any)
      .from("golf_holes")
      .delete()
      .in("course_id", allPersistedCourseIds);

    if (wipeError && !normalizeMissingRelationError(wipeError)) {
      return adminErrorResponse(400, "GOLF_HOLES_REPLACE_FAILED", wipeError.message);
    }
  }

  const holesRows = persistedByIndex.flatMap((course) =>
    course.holes.map((hole) => ({
      course_id: course.id,
      hole_number: hole.hole_number,
      par: hole.par,
      stroke_index: hole.stroke_index,
      distance_white: hole.distance_white,
      distance_yellow: hole.distance_yellow,
      distance_red: hole.distance_red,
    })),
  );

  if (holesRows.length > 0) {
    const { error: insertHolesError } = await (auth.writeClient as any)
      .from("golf_holes")
      .insert(holesRows);

    if (insertHolesError) {
      return adminErrorResponse(400, "GOLF_HOLES_INSERT_FAILED", insertHolesError.message);
    }
  }

  return null;
}

async function persistUsingLegacyModel(
  auth: AdminWriteAuth,
  listingId: string,
  structure: GolfCourseStructure,
  courses: ListingGolfCourseForm[],
) {
  if (structure === "multi" || courses.length > 1) {
    return adminErrorResponse(
      409,
      "MIGRATION_REQUIRED",
      "Multi-course setup requires the golf_courses migration (course_id-based model).",
    );
  }

  const course = courses[0];

  const { error: clearError } = await (auth.writeClient as any)
    .from("golf_holes")
    .delete()
    .eq("listing_id", listingId);

  if (clearError && !normalizeMissingRelationError(clearError)) {
    return adminErrorResponse(400, "GOLF_HOLES_CLEAR_FAILED", clearError.message);
  }

  const rows = course.holes.map((hole) => ({
    listing_id: listingId,
    hole_number: hole.hole_number,
    par: hole.par,
    stroke_index: hole.stroke_index,
    distance_white: hole.distance_white,
    distance_yellow: hole.distance_yellow,
    distance_red: hole.distance_red,
  }));

  if (rows.length > 0) {
    const { error: insertError } = await (auth.writeClient as any)
      .from("golf_holes")
      .insert(rows);

    if (insertError) {
      return adminErrorResponse(400, "GOLF_HOLES_INSERT_FAILED", insertError.message);
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> },
) {
  const auth = await requireAdminWriteClient(request, "Only admins can manage golf setup.", {
    requireServiceRole: true,
    missingServiceRoleMessage:
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin golf writes.",
  });
  if ("error" in auth) return auth.error;

  const { listingId: rawListingId } = await context.params;
  const listingId = rawListingId?.trim();
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  const listingContext = await loadListingContext(auth, listingId);
  if (listingContext instanceof NextResponse) return listingContext;
  if (!listingContext) {
    return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
  }

  if (listingContext.categorySlug !== "golf") {
    return adminErrorResponse(
      400,
      "NOT_GOLF_LISTING",
      "Golf setup is available only for listings in the golf category.",
    );
  }

  return readGolfSetupData(auth, listingId, listingContext);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> },
) {
  const auth = await requireAdminWriteClient(request, "Only admins can manage golf setup.", {
    requireServiceRole: true,
    missingServiceRoleMessage:
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin golf writes.",
  });
  if ("error" in auth) return auth.error;

  const { listingId: rawListingId } = await context.params;
  const listingId = rawListingId?.trim();
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = golfPatchSchema.safeParse(body);
  if (!parsed.success) {
    return adminErrorResponse(
      400,
      "VALIDATION_ERROR",
      parsed.error.issues.map((issue) => issue.message).join(" "),
    );
  }

  const payload = parsed.data;
  const listingContext = await loadListingContext(auth, listingId);
  if (listingContext instanceof NextResponse) return listingContext;
  if (!listingContext) {
    return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing not found.");
  }

  if (listingContext.categorySlug !== "golf") {
    return adminErrorResponse(
      400,
      "NOT_GOLF_LISTING",
      "Golf setup is available only for listings in the golf category.",
    );
  }

  const detailsResult = await readDetailsRow(auth, listingId);
  if (detailsResult.error) return detailsResult.error;

  const currentDetails = normalizeGolfDetails(listingContext.categoryData, detailsResult.data);

  let structure = normalizeStructure(
    payload.structure ?? listingContext.categoryData.course_structure,
    "single",
  );

  const details: ListingGolfDetailsForm = {
    ...currentDetails,
    ...payload.details,
  };

  if (payload.holes_count !== undefined) {
    details.holes_count = payload.holes_count;
  }

  if (payload.generate_empty_holes && !payload.courses) {
    const count = payload.holes_count ?? 18;
    payload.courses = [
      {
        name: "Main Course",
        holes_count: count,
        is_default: true,
        holes: buildGeneratedHoleRows(count),
      },
    ];
  }

  if (payload.clear_courses) {
    const clearError = await clearAllCourses(auth, listingId);
    if (clearError) return clearError;

    const persisted = await upsertDetailsAndCategoryData(
      auth,
      listingId,
      listingContext,
      {
        ...details,
        holes_count: structure === "multi" ? null : details.holes_count,
      },
      structure,
      null,
    );
    if (persisted.error) return persisted.error;

    logAdminMutation({
      userId: auth.userId,
      action: "admin.listings.golf.clear-courses",
      payload: { listingId },
    });

    return readGolfSetupData(auth, listingId, {
      categoryData: persisted.nextCategoryData ?? listingContext.categoryData,
      categorySlug: "golf",
    });
  }

  const coursesPayload: ListingGolfCourseForm[] | undefined = payload.courses?.map((course, index) => ({
    id: course.id ?? `temp-course-${index + 1}`,
    name: course.name.trim(),
    holes_count: course.holes_count,
    is_default: course.is_default === true,
    holes: course.holes
      .filter((hole) => Number.isInteger(hole.par) && (hole.par ?? 0) > 0)
      .map((hole) => ({
        hole_number: hole.hole_number,
        par: hole.par,
        stroke_index: hole.stroke_index ?? null,
        distance_white: hole.distance_white ?? null,
        distance_yellow: hole.distance_yellow ?? null,
        distance_red: hole.distance_red ?? null,
      })),
  }));

  if (coursesPayload && coursesPayload.length > 0) {
    if (structure !== "multi" && coursesPayload.length > 1) {
      structure = "multi";
    }

    const validationError = validateCoursePayload(structure, coursesPayload);
    if (validationError) {
      return adminErrorResponse(400, "VALIDATION_ERROR", validationError);
    }

    const newModelPersistError = await persistUsingNewModel(auth, listingId, coursesPayload);
    if (newModelPersistError !== null) {
      if (newModelPersistError === "LEGACY") {
        const legacyPersistError = await persistUsingLegacyModel(
          auth,
          listingId,
          structure,
          coursesPayload,
        );
        if (legacyPersistError) return legacyPersistError;
      } else {
        return newModelPersistError;
      }
    }

    if (structure !== "multi") {
      details.holes_count = coursesPayload[0]?.holes_count ?? details.holes_count;
    } else {
      details.holes_count = null;
    }
  }

  const defaultScorecardHoles =
    coursesPayload && coursesPayload.length > 0
      ? [...(coursesPayload.find((course) => course.is_default)?.holes ?? coursesPayload[0].holes)].sort(
          (a, b) => a.hole_number - b.hole_number,
        )
      : undefined;

  const persisted = await upsertDetailsAndCategoryData(
    auth,
    listingId,
    listingContext,
    details,
    structure,
    defaultScorecardHoles,
  );
  if (persisted.error) return persisted.error;

  logAdminMutation({
    userId: auth.userId,
    action: "admin.listings.golf.update",
    payload: {
      listingId,
      structure,
      coursesSubmitted: coursesPayload?.length ?? null,
    },
  });

  return readGolfSetupData(auth, listingId, {
    categoryData: persisted.nextCategoryData ?? listingContext.categoryData,
    categorySlug: "golf",
  });
}
