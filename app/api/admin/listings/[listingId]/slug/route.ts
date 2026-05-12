import { NextRequest, NextResponse } from "next/server";

import {
  isMissingCanonicalSlugRpcError,
  type ListingCanonicalSlugUpdateResult,
  updateListingCanonicalSlugDirect,
} from "@/lib/admin/listings/canonical-slug-update";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { getDisallowedSlugInputError, getSlugValidationError, normalizeSlug } from "@/lib/slugify";

interface SlugUpdateBody {
  slug?: unknown;
  new_slug?: unknown;
}

function normalizeRequestedSlug(value: unknown) {
  if (typeof value !== "string") return null;
  return getDisallowedSlugInputError(value)
    ? value.trim()
    : normalizeSlug(value, { entityType: "listing" });
}

function mapSlugRpcError(error: { code?: string; message?: string }) {
  if (error.code === "23505" || /already used|already reserved|duplicate/i.test(error.message ?? "")) {
    return adminErrorResponse(409, "DUPLICATE_SLUG", error.message || "Slug is already used or reserved.");
  }

  if (error.code === "P0002" || /not found/i.test(error.message ?? "")) {
    return adminErrorResponse(404, "LISTING_NOT_FOUND", error.message || "Listing was not found.");
  }

  if (error.code === "42501") {
    return adminErrorResponse(403, "AUTH_FORBIDDEN", error.message || "Only admins can update listing URLs.");
  }

  if (/FAILED$/.test(error.code ?? "") || /read failed|update failed|insert failed|check failed/i.test(error.message ?? "")) {
    return adminErrorResponse(400, "SLUG_UPDATE_FAILED", error.message || "Unable to update listing URL.");
  }

  if (error.code === "22023" || /slug/i.test(error.message ?? "")) {
    return adminErrorResponse(400, "VALIDATION_ERROR", error.message || "Invalid slug.");
  }

  return adminErrorResponse(400, "SLUG_UPDATE_FAILED", error.message || "Unable to update listing URL.");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> },
) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update listing URLs.",
    {
      allowedRoles: ["admin"],
      auditAction: "admin.listings.slug.update",
    },
  );
  if ("error" in auth) return auth.error;

  const { listingId: rawListingId } = await context.params;
  const listingId = rawListingId?.trim();
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  let body: SlugUpdateBody;
  try {
    body = (await request.json()) as SlugUpdateBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const requestedSlug = normalizeRequestedSlug(body.slug ?? body.new_slug);
  if (!requestedSlug) {
    return adminErrorResponse(400, "VALIDATION_ERROR", "Slug is required.");
  }

  const validationError = getSlugValidationError(requestedSlug, { entityType: "listing" });
  if (validationError) {
    return adminErrorResponse(400, "VALIDATION_ERROR", validationError);
  }

  const { data, error } = await auth.userClient.rpc("update_listing_canonical_slug" as never, {
    p_listing_id: listingId,
    p_new_slug: requestedSlug,
  } as never);

  if (error) {
    if (isMissingCanonicalSlugRpcError(error)) {
      const fallback = await updateListingCanonicalSlugDirect(auth.writeClient, listingId, requestedSlug);
      if (fallback.error) {
        return mapSlugRpcError(fallback.error);
      }

      return NextResponse.json({
        ok: true,
        data: fallback.data,
      });
    }

    return mapSlugRpcError(error);
  }

  const row = (Array.isArray(data) ? data[0] : data) as ListingCanonicalSlugUpdateResult | null;
  return NextResponse.json({
    ok: true,
    data: {
      old_slug: row?.old_slug ?? null,
      new_slug: row?.new_slug ?? requestedSlug,
    },
  });
}
