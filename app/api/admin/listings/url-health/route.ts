import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  isMissingCanonicalSlugRpcError,
  updateListingCanonicalSlugDirect,
} from "@/lib/admin/listings/canonical-slug-update";
import {
  buildListingCanonicalPath,
  suggestListingCanonicalSlug,
} from "@/lib/listings/slug-management";

type RelationRef = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
};

type ListingHealthRow = {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
  city?: RelationRef | RelationRef[] | null;
  category?: RelationRef | RelationRef[] | null;
};

type SlugAliasRow = {
  id: string;
  listing_id: string;
  slug: string;
  is_current: boolean;
  created_at?: string | null;
};

type UrlHealthIssue = {
  listing_id: string;
  listing_name: string;
  current_slug: string;
  suggested_slug?: string;
  current_path?: string;
  suggested_path?: string;
  aliases?: SlugAliasRow[];
  conflict_slug?: string;
  conflict_listing_id?: string;
};

function unwrapRelation(value: RelationRef | RelationRef[] | null | undefined): RelationRef | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toListingRows(value: unknown): ListingHealthRow[] {
  return Array.isArray(value) ? (value as ListingHealthRow[]) : [];
}

function toAliasRows(value: unknown): SlugAliasRow[] {
  return Array.isArray(value) ? (value as SlugAliasRow[]) : [];
}

async function buildUrlHealthPayload() {
  const adminClient = createServiceRoleClient();
  if (!adminClient) {
    return {
      error: adminErrorResponse(
        500,
        "SERVER_MISCONFIGURED",
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin URL health reads.",
      ),
    };
  }

  const [{ data: listingsData, error: listingsError }, { data: aliasesData, error: aliasesError }] = await Promise.all([
    adminClient
      .from("listings")
      .select("id, name, slug, status, city:cities(id, name, slug), category:categories(id, name, slug)")
      .order("updated_at", { ascending: false }),
    adminClient
      .from("listing_slugs")
      .select("id, listing_id, slug, is_current, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (listingsError) {
    return { error: adminErrorResponse(400, "LISTINGS_READ_FAILED", listingsError.message) };
  }
  if (aliasesError) {
    return { error: adminErrorResponse(400, "LISTING_SLUGS_READ_FAILED", aliasesError.message) };
  }

  const listings = toListingRows(listingsData);
  const aliases = toAliasRows(aliasesData);
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const listingBySlug = new Map(listings.map((listing) => [listing.slug, listing]));
  const aliasesByListing = new Map<string, SlugAliasRow[]>();

  for (const alias of aliases) {
    const rows = aliasesByListing.get(alias.listing_id) ?? [];
    rows.push(alias);
    aliasesByListing.set(alias.listing_id, rows);
  }

  const suggestedSlugMismatches: UrlHealthIssue[] = [];
  const missingCurrentSlugRows: UrlHealthIssue[] = [];
  const multipleCurrentSlugRows: UrlHealthIssue[] = [];
  const aliasConflicts: UrlHealthIssue[] = [];

  for (const listing of listings) {
    const city = unwrapRelation(listing.city);
    const category = unwrapRelation(listing.category);
    const suggestedSlug = suggestListingCanonicalSlug({
      name: listing.name,
      cityName: city?.name ?? null,
      citySlug: city?.slug ?? null,
      categorySlug: category?.slug ?? null,
    });
    const currentPath = buildListingCanonicalPath({
      slug: listing.slug,
      categorySlug: category?.slug ?? null,
    });
    const suggestedPath = buildListingCanonicalPath({
      slug: suggestedSlug,
      categorySlug: category?.slug ?? null,
    });
    const listingAliases = aliasesByListing.get(listing.id) ?? [];
    const currentAliases = listingAliases.filter((alias) => alias.is_current);
    const hasMatchingCurrentAlias = currentAliases.some((alias) => alias.slug === listing.slug);

    if (suggestedSlug && suggestedSlug !== listing.slug) {
      suggestedSlugMismatches.push({
        listing_id: listing.id,
        listing_name: listing.name,
        current_slug: listing.slug,
        suggested_slug: suggestedSlug,
        current_path: currentPath,
        suggested_path: suggestedPath,
      });
    }

    if (!hasMatchingCurrentAlias) {
      missingCurrentSlugRows.push({
        listing_id: listing.id,
        listing_name: listing.name,
        current_slug: listing.slug,
        current_path: currentPath,
        aliases: currentAliases,
      });
    }

    if (currentAliases.length > 1) {
      multipleCurrentSlugRows.push({
        listing_id: listing.id,
        listing_name: listing.name,
        current_slug: listing.slug,
        current_path: currentPath,
        aliases: currentAliases,
      });
    }
  }

  for (const alias of aliases) {
    const listing = listingById.get(alias.listing_id);
    const conflictingListing = listingBySlug.get(alias.slug);
    if (conflictingListing && conflictingListing.id !== alias.listing_id && listing) {
      aliasConflicts.push({
        listing_id: listing.id,
        listing_name: listing.name,
        current_slug: listing.slug,
        conflict_slug: alias.slug,
        conflict_listing_id: conflictingListing.id,
      });
    }
  }

  return {
    payload: {
      ok: true,
      data: {
        counts: {
          listings: listings.length,
          aliases: aliases.length,
          suggested_slug_mismatches: suggestedSlugMismatches.length,
          missing_current_slug_rows: missingCurrentSlugRows.length,
          multiple_current_slug_rows: multipleCurrentSlugRows.length,
          alias_conflicts: aliasConflicts.length,
        },
        suggested_slug_mismatches: suggestedSlugMismatches,
        missing_current_slug_rows: missingCurrentSlugRows,
        multiple_current_slug_rows: multipleCurrentSlugRows,
        alias_conflicts: aliasConflicts,
      },
    },
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin"]);
  if ("error" in auth) return auth.error;

  const result = await buildUrlHealthPayload();
  if ("error" in result) return result.error;
  return NextResponse.json(result.payload);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can repair listing URL health.",
    {
      allowedRoles: ["admin"],
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin URL health repairs.",
      auditAction: "admin.listings.url-health.repair",
    },
  );
  if ("error" in auth) return auth.error;

  const adminClient = createServiceRoleClient();
  if (!adminClient) {
    return adminErrorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin URL health repairs.",
    );
  }

  let body: { action?: unknown; listing_id?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; listing_id?: unknown };
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const action = typeof body.action === "string" ? body.action : "";
  const listingId = typeof body.listing_id === "string" ? body.listing_id.trim() : "";
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  const { data: listing, error: listingError } = await adminClient
    .from("listings")
    .select("id, name, slug, city:cities(id, name, slug), category:categories(id, name, slug)")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return adminErrorResponse(400, "LISTING_READ_FAILED", listingError.message);
  }
  if (!listing) {
    return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing was not found.");
  }

  const listingRow = listing as ListingHealthRow;

  if (action === "repair-current-alias") {
    const { error: clearError } = await adminClient
      .from("listing_slugs")
      .update({ is_current: false })
      .eq("listing_id", listingId);
    if (clearError) {
      return adminErrorResponse(400, "CURRENT_ALIAS_REPAIR_FAILED", clearError.message);
    }

    const { error: upsertError } = await adminClient
      .from("listing_slugs")
      .upsert(
        {
          listing_id: listingId,
          slug: listingRow.slug,
          is_current: true,
        },
        { onConflict: "slug" },
      );
    if (upsertError) {
      return adminErrorResponse(400, "CURRENT_ALIAS_REPAIR_FAILED", upsertError.message);
    }

    return NextResponse.json({ ok: true, data: { listing_id: listingId, slug: listingRow.slug } });
  }

  if (action === "update-to-suggested") {
    const city = unwrapRelation(listingRow.city);
    const category = unwrapRelation(listingRow.category);
    const suggestedSlug = suggestListingCanonicalSlug({
      name: listingRow.name,
      cityName: city?.name ?? null,
      citySlug: city?.slug ?? null,
      categorySlug: category?.slug ?? null,
    });

    if (!suggestedSlug) {
      return adminErrorResponse(400, "VALIDATION_ERROR", "Unable to suggest a valid slug.");
    }

    const { data, error } = await auth.userClient.rpc("update_listing_canonical_slug" as never, {
      p_listing_id: listingId,
      p_new_slug: suggestedSlug,
    } as never);

    if (error) {
      if (isMissingCanonicalSlugRpcError(error)) {
        const fallback = await updateListingCanonicalSlugDirect(auth.writeClient, listingId, suggestedSlug);
        if (fallback.error) {
          const status = fallback.error.code === "23505" ? 409 : 400;
          return adminErrorResponse(
            status,
            status === 409 ? "DUPLICATE_SLUG" : "SLUG_UPDATE_FAILED",
            fallback.error.message,
          );
        }

        return NextResponse.json({ ok: true, data: fallback.data });
      }

      const status = error.code === "23505" ? 409 : 400;
      return adminErrorResponse(status, status === 409 ? "DUPLICATE_SLUG" : "SLUG_UPDATE_FAILED", error.message);
    }

    return NextResponse.json({ ok: true, data });
  }

  return adminErrorResponse(400, "INVALID_ACTION", "Unsupported URL health repair action.");
}
