import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"];

type ListingImageInput = {
  url: string;
  alt_text?: string | null;
  is_featured?: boolean;
  display_order?: number;
};

interface CreateListingBody {
  listing?: unknown;
  images?: unknown;
}

function parseListingImages(raw: unknown): ListingImageInput[] {
  if (!Array.isArray(raw)) return [];
  const rows: ListingImageInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;
    rows.push({
      url,
      alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
      is_featured: row.is_featured === true,
      display_order: typeof row.display_order === "number" ? row.display_order : 0,
    });
  }
  return rows;
}

function parseListingInsert(raw: unknown): ListingInsert | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const listing = { ...(raw as Record<string, unknown>) } as ListingInsert;
  delete (listing as Record<string, unknown>).id;
  delete (listing as Record<string, unknown>).created_at;
  delete (listing as Record<string, unknown>).updated_at;
  return listing;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can manage listings.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin listings writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: CreateListingBody;
  try {
    body = (await request.json()) as CreateListingBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const listing = parseListingInsert(body.listing);
  if (!listing) {
    return adminErrorResponse(400, "INVALID_LISTING", "Invalid listing payload.");
  }

  const images = parseListingImages(body.images);

  const { data: created, error: createError } = await auth.writeClient
    .from("listings")
    .insert(listing)
    .select("*")
    .single();

  if (createError || !created) {
    return adminErrorResponse(
      400,
      "LISTING_CREATE_FAILED",
      createError?.message || "Failed to create listing.",
    );
  }

  if (images.length > 0) {
    const imageRows = images.map((img) => ({
      listing_id: created.id,
      image_url: img.url,
      alt_text: img.alt_text ?? null,
      is_featured: img.is_featured === true,
      display_order: img.display_order ?? 0,
    }));

    const { error: imageError } = await auth.writeClient.from("listing_images").insert(imageRows);
    if (imageError) {
      return adminErrorResponse(400, "LISTING_IMAGE_CREATE_FAILED", imageError.message);
    }

    const featuredImage = images.find((img) => img.is_featured) ?? images[0];
    if (featuredImage?.url) {
      const { error: featuredError } = await auth.writeClient
        .from("listings")
        .update({ featured_image_url: featuredImage.url })
        .eq("id", created.id);

      if (featuredError) {
        return adminErrorResponse(400, "LISTING_FEATURED_IMAGE_FAILED", featuredError.message);
      }
    }
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.listings.create",
    payload: {
      listingId: created.id,
      status: created.status ?? null,
      tier: created.tier ?? null,
      images: images.length,
    },
  });

  return NextResponse.json({ ok: true, data: created });
}

interface BulkListingBody {
  action?: unknown;
  ids?: unknown;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can manage listings.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin listings writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: BulkListingBody;
  try {
    body = (await request.json()) as BulkListingBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const action = typeof body.action === "string" ? body.action : "";
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : [];
  if (ids.length === 0) {
    return adminErrorResponse(400, "INVALID_IDS", "At least one listing id is required.");
  }

  if (action === "bulk-publish") {
    const { error } = await auth.writeClient
      .from("listings")
      .update({ status: "published", published_at: new Date().toISOString() } satisfies ListingUpdate)
      .in("id", ids);

    if (error) {
      return adminErrorResponse(400, "LISTING_BULK_PUBLISH_FAILED", error.message);
    }

    logAdminMutation({
      userId: auth.userId,
      action: "admin.listings.bulk-publish",
      payload: { count: ids.length },
    });

    return NextResponse.json({ ok: true, count: ids.length });
  }

  if (action === "bulk-delete") {
    const { error } = await auth.writeClient.rpc("admin_delete_listings", {
      listing_ids: ids,
    });

    if (error) {
      return adminErrorResponse(400, "LISTING_BULK_DELETE_FAILED", error.message);
    }

    logAdminMutation({
      userId: auth.userId,
      action: "admin.listings.bulk-delete",
      payload: { count: ids.length },
    });

    return NextResponse.json({ ok: true, count: ids.length });
  }

  return adminErrorResponse(400, "INVALID_ACTION", "Unsupported bulk action.");
}
