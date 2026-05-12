import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { Database, Json } from "@/integrations/supabase/types";
import {
  LISTING_CHANGE_REQUESTS_SETUP_MESSAGE,
  isMissingListingChangeRequestsSchemaError,
} from "@/lib/admin/listing-change-requests/queries";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const editableFieldSchema = z.enum([
  "name",
  "short_description",
  "description",
  "contact_phone",
  "contact_email",
  "website_url",
  "address",
  "opening_hours",
  "instagram_url",
  "facebook_url",
  "twitter_url",
  "youtube_url",
  "linkedin_url",
  "tiktok_url",
  "featured_image_url",
]);

const submitChangeRequestsSchema = z.object({
  listingId: z.string().uuid(),
  changes: z
    .array(
      z.object({
        fieldName: editableFieldSchema,
        requestedValue: z.union([z.string().trim().max(5000), z.null()]),
      }),
    )
    .min(1)
    .max(20),
});

type EditableField = z.infer<typeof editableFieldSchema>;
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const LISTING_SELECT = `
  id,
  owner_id,
  claim_status,
  name,
  short_description,
  description,
  contact_phone,
  contact_email,
  website_url,
  address,
  instagram_url,
  facebook_url,
  twitter_url,
  youtube_url,
  linkedin_url,
  tiktok_url,
  featured_image_url,
  category_data
`;

function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details: details ?? null,
      },
    },
    { status },
  );
}

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOpeningHours(categoryData: Json | null) {
  if (!isRecord(categoryData)) return null;

  const direct = categoryData.opening_hours;
  if (typeof direct === "string") return direct;
  if (direct !== undefined && direct !== null) return direct;

  const businessDetails = categoryData.business_details;
  if (isRecord(businessDetails)) {
    const nested = businessDetails.opening_hours;
    if (typeof nested === "string") return nested;
    if (nested !== undefined && nested !== null) return nested;
  }

  return null;
}

function getOldValue(listing: Pick<
  ListingRow,
  | "name"
  | "short_description"
  | "description"
  | "contact_phone"
  | "contact_email"
  | "website_url"
  | "address"
  | "instagram_url"
  | "facebook_url"
  | "twitter_url"
  | "youtube_url"
  | "linkedin_url"
  | "tiktok_url"
  | "featured_image_url"
  | "category_data"
>, fieldName: EditableField): Json {
  if (fieldName === "opening_hours") {
    return readOpeningHours(listing.category_data) as Json;
  }

  return listing[fieldName] ?? null;
}

function normalizeRequestedValue(value: string | null): Json {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function jsonValuesEqual(left: Json, right: Json) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse(401, "AUTH_REQUIRED", "Sign in to view listing change requests.");
  }

  const listingId = request.nextUrl.searchParams.get("listingId");
  const parsedListingId = z.string().uuid().safeParse(listingId);
  if (!parsedListingId.success) {
    return errorResponse(400, "LISTING_ID_INVALID", "A valid listingId query parameter is required.");
  }

  const serviceClient = createServiceRoleClient();
  const readClient = serviceClient ?? (await createServerClient());

  const { data: listing, error: listingError } = await readClient
    .from("listings")
    .select("id, owner_id")
    .eq("id", parsedListingId.data)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (listingError) {
    return errorResponse(500, "LISTING_LOOKUP_FAILED", listingError.message);
  }

  if (!listing) {
    return errorResponse(404, "LISTING_NOT_FOUND", "This listing is not assigned to your owner account.");
  }

  const { data, error } = await readClient
    .from("listing_change_requests")
    .select("id, listing_id, owner_id, field_name, old_value, requested_value, status, reviewed_at, admin_note, created_at, updated_at")
    .eq("listing_id", parsedListingId.data)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingListingChangeRequestsSchemaError(error)) {
      return NextResponse.json(
        { ok: true, data: [], setupRequired: true, setupMessage: LISTING_CHANGE_REQUESTS_SETUP_MESSAGE },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return errorResponse(500, "CHANGE_REQUESTS_LOOKUP_FAILED", error.message);
  }

  return NextResponse.json(
    { ok: true, data: data ?? [] },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse(401, "AUTH_REQUIRED", "Sign in before submitting listing change requests.");
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsed = submitChangeRequestsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "CHANGE_REQUEST_VALIDATION_ERROR",
      "Invalid listing change request payload.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const serviceClient = createServiceRoleClient();
  const writeClient = serviceClient ?? (await createServerClient());
  const payload = parsed.data;

  const { data: listing, error: listingError } = await writeClient
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", payload.listingId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (listingError) {
    return errorResponse(500, "LISTING_LOOKUP_FAILED", listingError.message);
  }

  if (!listing) {
    return errorResponse(404, "LISTING_NOT_FOUND", "This listing is not assigned to your owner account.");
  }

  if (listing.claim_status !== "claimed") {
    return errorResponse(
      403,
      "LISTING_NOT_CLAIMED",
      "Only claimed listings can receive owner change requests.",
    );
  }

  const normalizedChanges = payload.changes
    .map((change) => {
      const requestedValue = normalizeRequestedValue(change.requestedValue);
      const oldValue = getOldValue(listing, change.fieldName);
      return {
        fieldName: change.fieldName,
        oldValue,
        requestedValue,
      };
    })
    .filter((change) => !jsonValuesEqual(change.oldValue, change.requestedValue));

  if (normalizedChanges.length === 0) {
    return errorResponse(400, "NO_CHANGES", "No changed fields were submitted.");
  }

  const fieldNames = normalizedChanges.map((change) => change.fieldName);
  const { data: existingPending, error: pendingError } = await writeClient
    .from("listing_change_requests")
    .select("field_name")
    .eq("listing_id", listing.id)
    .eq("owner_id", user.id)
    .eq("status", "pending")
    .in("field_name", fieldNames);

  if (pendingError) {
    if (isMissingListingChangeRequestsSchemaError(pendingError)) {
      return errorResponse(503, "CHANGE_REQUESTS_SETUP_REQUIRED", LISTING_CHANGE_REQUESTS_SETUP_MESSAGE);
    }

    return errorResponse(500, "PENDING_CHANGE_LOOKUP_FAILED", pendingError.message);
  }

  if (existingPending && existingPending.length > 0) {
    return errorResponse(
      409,
      "PENDING_CHANGE_EXISTS",
      "One or more selected fields already has a pending request.",
      existingPending.map((row) => row.field_name),
    );
  }

  const { data: inserted, error: insertError } = await writeClient
    .from("listing_change_requests")
    .insert(
      normalizedChanges.map((change) => ({
        listing_id: listing.id,
        owner_id: user.id,
        field_name: change.fieldName,
        old_value: change.oldValue,
        requested_value: change.requestedValue,
        status: "pending" as const,
      })),
    )
    .select("id, field_name, status, created_at");

  if (insertError) {
    if (isMissingListingChangeRequestsSchemaError(insertError)) {
      return errorResponse(503, "CHANGE_REQUESTS_SETUP_REQUIRED", LISTING_CHANGE_REQUESTS_SETUP_MESSAGE);
    }

    if (insertError.code === "23505") {
      return errorResponse(
        409,
        "PENDING_CHANGE_EXISTS",
        "One or more selected fields already has a pending request.",
      );
    }

    return errorResponse(500, "CHANGE_REQUEST_INSERT_FAILED", insertError.message);
  }

  return NextResponse.json({ ok: true, data: inserted ?? [] }, { status: 201 });
}
