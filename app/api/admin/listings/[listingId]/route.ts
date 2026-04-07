import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"];

type ListingImageInput = {
  url: string;
  alt_text?: string | null;
  is_featured?: boolean;
  display_order?: number;
};

interface UpdateListingBody {
  listing?: unknown;
  status?: unknown;
  rejection_reason?: unknown;
  admin_notes?: unknown;
  is_curated?: unknown;
  sync_featured_image?: unknown;
  images?: unknown;
}

function parseListingImages(raw: unknown): ListingImageInput[] | undefined {
  if (raw === undefined) return undefined;
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

function parseListingUpdate(raw: unknown): ListingUpdate {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const updates = { ...(raw as Record<string, unknown>) } as ListingUpdate;
  delete (updates as Record<string, unknown>).id;
  delete (updates as Record<string, unknown>).created_at;
  delete (updates as Record<string, unknown>).updated_at;
  return updates;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> },
) {
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

  const { listingId: rawListingId } = await context.params;
  const listingId = rawListingId?.trim();
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  let body: UpdateListingBody;
  try {
    body = (await request.json()) as UpdateListingBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const updates = parseListingUpdate(body.listing);
  if (typeof body.status === "string") {
    updates.status = body.status as ListingUpdate["status"];
    if (body.status === "published" && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }
  if (typeof body.rejection_reason === "string") {
    updates.rejection_reason = body.rejection_reason;
  }
  if (typeof body.admin_notes === "string") {
    updates.admin_notes = body.admin_notes;
  }
  if (typeof body.is_curated === "boolean") {
    updates.is_curated = body.is_curated;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await auth.writeClient
      .from("listings")
      .update(updates)
      .eq("id", listingId);

    if (updateError) {
      return adminErrorResponse(400, "LISTING_UPDATE_FAILED", updateError.message);
    }
  }

  const parsedImages = parseListingImages(body.images);
  if (parsedImages !== undefined) {
    const { error: deleteError } = await auth.writeClient
      .from("listing_images")
      .delete()
      .eq("listing_id", listingId);
    if (deleteError) {
      return adminErrorResponse(400, "LISTING_IMAGES_DELETE_FAILED", deleteError.message);
    }

    if (parsedImages.length > 0) {
      const imageRows = parsedImages.map((img) => ({
        listing_id: listingId,
        image_url: img.url,
        alt_text: img.alt_text ?? null,
        is_featured: img.is_featured === true,
        display_order: img.display_order ?? 0,
      }));
      const { error: insertError } = await auth.writeClient.from("listing_images").insert(imageRows);
      if (insertError) {
        return adminErrorResponse(400, "LISTING_IMAGES_INSERT_FAILED", insertError.message);
      }

      const featuredImage = parsedImages.find((img) => img.is_featured) ?? parsedImages[0];
      if (featuredImage?.url) {
        const { error: featuredError } = await auth.writeClient
          .from("listings")
          .update({ featured_image_url: featuredImage.url })
          .eq("id", listingId);
        if (featuredError) {
          return adminErrorResponse(400, "LISTING_FEATURED_IMAGE_FAILED", featuredError.message);
        }
      }
    } else {
      const { error: clearError } = await auth.writeClient
        .from("listings")
        .update({ featured_image_url: null })
        .eq("id", listingId);
      if (clearError) {
        return adminErrorResponse(400, "LISTING_FEATURED_IMAGE_CLEAR_FAILED", clearError.message);
      }
    }
  }

  if (body.sync_featured_image === true) {
    const { data: featuredImg, error: imageError } = await auth.writeClient
      .from("listing_images")
      .select("image_url")
      .eq("listing_id", listingId)
      .eq("is_featured", true)
      .limit(1)
      .maybeSingle();

    if (imageError) {
      return adminErrorResponse(400, "LISTING_FEATURED_IMAGE_SYNC_FAILED", imageError.message);
    }

    if (featuredImg?.image_url) {
      const { error: syncError } = await auth.writeClient
        .from("listings")
        .update({ featured_image_url: featuredImg.image_url })
        .eq("id", listingId);

      if (syncError) {
        return adminErrorResponse(400, "LISTING_FEATURED_IMAGE_SYNC_FAILED", syncError.message);
      }
    }
  }

  const { data: listing, error: readError } = await auth.writeClient
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (readError) {
    return adminErrorResponse(400, "LISTING_READ_FAILED", readError.message);
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.listings.update",
    payload: {
      listingId,
      fields: Object.keys(updates),
      syncedFeaturedImage: body.sync_featured_image === true,
      replacedImages: parsedImages !== undefined ? parsedImages.length : undefined,
    },
  });

  return NextResponse.json({ ok: true, data: listing ?? null });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> },
) {
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

  const { listingId: rawListingId } = await context.params;
  const listingId = rawListingId?.trim();
  if (!listingId) {
    return adminErrorResponse(400, "INVALID_LISTING_ID", "Listing id is required.");
  }

  const { error } = await auth.writeClient.rpc("admin_delete_listings", {
    listing_ids: [listingId],
  });

  if (error) {
    return adminErrorResponse(400, "LISTING_DELETE_FAILED", error.message);
  }

  logAdminMutation({
    userId: auth.userId,
    action: "admin.listings.delete",
    payload: { listingId },
  });

  return NextResponse.json({ ok: true, listingId });
}
