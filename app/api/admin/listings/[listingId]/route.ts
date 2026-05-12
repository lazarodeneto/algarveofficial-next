import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { listingUpdateSchema } from "@/lib/forms/admin-schemas";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";
import { normalizeExternalUrlForStorage } from "@/lib/url-input";
import { getDisallowedSlugInputError, getSlugValidationError, normalizeSlug } from "@/lib/slugify";

type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"];
type ListingUpdateRecord = Record<string, unknown>;

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

const LISTING_MUTATION_COLUMNS = new Set<string>([
  "name",
  "slug",
  "short_description",
  "description",
  "category_id",
  "city_id",
  "region_id",
  "owner_id",
  "tags",
  "contact_phone",
  "contact_email",
  "website_url",
  "address",
  "latitude",
  "longitude",
  "instagram_url",
  "facebook_url",
  "google_business_url",
  "twitter_url",
  "linkedin_url",
  "youtube_url",
  "tiktok_url",
  "telegram_url",
  "whatsapp_number",
  "featured_image_url",
  "category_data",
  "tier",
  "is_curated",
  "status",
  "published_at",
  "price_from",
  "price_to",
  "price_currency",
  "meta_title",
  "meta_description",
  "admin_notes",
  "google_rating",
  "google_review_count",
]);

const LISTING_FIELD_ALIASES: Record<string, string> = {
  full_description: "description",
  premium_region_id: "region_id",
  phone: "contact_phone",
  email: "contact_email",
  website: "website_url",
  instagram: "instagram_url",
  facebook: "facebook_url",
  google_business: "google_business_url",
  twitter: "twitter_url",
  linkedin: "linkedin_url",
  youtube: "youtube_url",
  tiktok: "tiktok_url",
  telegram: "telegram_url",
  whatsapp: "whatsapp_number",
  lat: "latitude",
  lng: "longitude",
  published_status: "status",
};

const LISTING_URL_COLUMNS = new Set([
  "website_url",
  "instagram_url",
  "facebook_url",
  "google_business_url",
  "twitter_url",
  "linkedin_url",
  "youtube_url",
  "tiktok_url",
  "telegram_url",
]);

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

  const updates: ListingUpdateRecord = {};
  for (const [rawKey, rawValue] of Object.entries(raw as Record<string, unknown>)) {
    if (rawValue === undefined) continue;
    if (rawKey === "id" || rawKey === "created_at" || rawKey === "updated_at") continue;

    const key = LISTING_FIELD_ALIASES[rawKey] ?? rawKey;
    if (!LISTING_MUTATION_COLUMNS.has(key)) continue;

    if (key === "slug" && typeof rawValue === "string") {
      updates[key] = getDisallowedSlugInputError(rawValue)
        ? rawValue.trim()
        : normalizeSlug(rawValue, { entityType: "listing" });
      continue;
    }

    if (LISTING_URL_COLUMNS.has(key) && typeof rawValue === "string") {
      updates[key] = normalizeExternalUrlForStorage(rawValue);
      continue;
    }

    updates[key] = rawValue;
  }

  return updates as ListingUpdate;
}

function isUniqueViolation(error: { code?: string; message?: string } | null | undefined) {
  return error?.code === "23505" || /duplicate key|unique constraint/i.test(error?.message ?? "");
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

  if (body.listing) {
    const validation = validatePayload(listingUpdateSchema, body.listing, "LISTING");
    if (!validation.success) {
      return jsonErrorResponse(400, validation.error.code, validation.error.message);
    }
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

  if (typeof updates.slug === "string") {
    const slugValidationError = getSlugValidationError(updates.slug, { entityType: "listing" });
    if (slugValidationError) {
      return adminErrorResponse(400, "VALIDATION_ERROR", slugValidationError);
    }

    const { data: currentListing, error: currentListingError } = await auth.userClient
      .from("listings")
      .select("id, slug")
      .eq("id", listingId)
      .maybeSingle();

    if (currentListingError) {
      return adminErrorResponse(400, "LISTING_READ_FAILED", currentListingError.message);
    }

    if (!currentListing?.id) {
      return adminErrorResponse(404, "LISTING_NOT_FOUND", "Listing was not found.");
    }

    if (updates.slug !== currentListing.slug) {
      return adminErrorResponse(
        409,
        "DEDICATED_SLUG_UPDATE_REQUIRED",
        "Use the dedicated URL update action to change listing slugs and create redirects.",
      );
    }

    delete updates.slug;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await auth.writeClient
      .from("listings")
      .update(updates)
      .eq("id", listingId);

    if (updateError) {
      if (isUniqueViolation(updateError)) {
        return adminErrorResponse(
          409,
          "DUPLICATE_SLUG",
          typeof updates.slug === "string"
            ? `Slug "${updates.slug}" is already used or reserved.`
            : "Listing update would violate a unique constraint.",
        );
      }
      return adminErrorResponse(400, "LISTING_UPDATE_FAILED", updateError.message);
    }

  }

  const parsedImages = parseListingImages(body.images);
  let tierScopedImages: ListingImageInput[] | undefined = parsedImages;
  if (parsedImages !== undefined) {
    let tierForRules: string | null =
      typeof updates.tier === "string" ? updates.tier : null;

    if (!tierForRules) {
      const { data: tierRow, error: tierError } = await auth.userClient
        .from("listings")
        .select("tier")
        .eq("id", listingId)
        .maybeSingle();

      if (tierError) {
        return adminErrorResponse(400, "LISTING_TIER_READ_FAILED", tierError.message);
      }

      tierForRules = tierRow?.tier ?? "unverified";
    }

    const maxTierImages = getListingTierMaxGalleryImages(tierForRules);
    tierScopedImages = parsedImages.slice(0, maxTierImages);

    const { error: deleteError } = await auth.userClient
      .from("listing_images")
      .delete()
      .eq("listing_id", listingId);
    if (deleteError) {
      return adminErrorResponse(400, "LISTING_IMAGES_DELETE_FAILED", deleteError.message);
    }

    if (tierScopedImages.length > 0) {
      const imageRows = tierScopedImages.map((img) => ({
        listing_id: listingId,
        image_url: img.url,
        alt_text: img.alt_text ?? null,
        is_featured: img.is_featured === true,
        display_order: img.display_order ?? 0,
      }));
      const { error: insertError } = await auth.userClient.from("listing_images").insert(imageRows);
      if (insertError) {
        return adminErrorResponse(400, "LISTING_IMAGES_INSERT_FAILED", insertError.message);
      }

      const featuredImage = tierScopedImages.find((img) => img.is_featured) ?? tierScopedImages[0];
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
    const { data: featuredImg, error: imageError } = await auth.userClient
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

  const { data: listing, error: readError } = await auth.userClient
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
      replacedImages: tierScopedImages !== undefined ? tierScopedImages.length : undefined,
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

  // Use the requester-scoped client so auth.uid() inside the RPC resolves
  // to the acting admin user (service-role calls would surface auth.uid() = null).
  const { error } = await auth.userClient.rpc("admin_delete_listings", {
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
