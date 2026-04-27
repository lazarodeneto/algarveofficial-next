import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminRequest, logAdminError, createRequestId } from "@/lib/server/observability";
import { listingFormSchema } from "@/lib/forms/schema";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";

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

export async function GET(request: NextRequest) {
  logAdminRequest(request);
  const requestId = createRequestId();

  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const includeRefData = request.nextUrl.searchParams.get("include_ref_data") === "true";

  if (includeRefData) {
    const [{ data: cities, error: citiesErr }, { data: categories, error: catsErr }] = await Promise.all([
      auth.userClient.from("cities").select("id, name").order("name"),
      auth.userClient.from("categories").select("id, name").order("name"),
    ]);

    if (citiesErr || catsErr) {
      const errMsg = citiesErr?.message || catsErr?.message || "Unknown error";
      logAdminError("REF_DATA_FETCH_FAILED", errMsg, { requestId });
      return NextResponse.json(
        { ok: false, error: { message: errMsg, requestId } },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, data: [], cities, categories });
  }

  const { data, error } = await auth.userClient
    .from("listings")
    .select(`
      id, name, tier, status, is_curated, description, slug, featured_rank,
      city:cities(id, name),
      category:categories(id, name),
      region:regions(id, name)
    `)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    logAdminError("LISTINGS_FETCH_FAILED", error, { requestId });
    return NextResponse.json({ ok: false, error: { message: error.message, requestId } }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
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

  const images = parseListingImages(body.images);

  const parsed = listingFormSchema.safeParse(body.listing);
  if (!parsed.success) {
    return adminErrorResponse(
      400,
      "VALIDATION_ERROR",
      JSON.stringify(parsed.error.flatten().fieldErrors),
    );
  }

  const validated = parsed.data;
  const maxTierImages = getListingTierMaxGalleryImages(validated.tier);
  const tierScopedImages = images.slice(0, maxTierImages);

  // ✅ FIX: remove full_description before insert
  const {
    full_description, // removed (not in DB)
    published_status,
    ...safeValidated
  } = validated;

  const insertData = {
    ...safeValidated,
    status: published_status,
    owner_id: auth.userId,
  } as Database["public"]["Tables"]["listings"]["Insert"];

  const { data: created, error: createError } = await auth.writeClient
    .from("listings")
    .insert(insertData)
    .select("*")
    .single();

  if (createError || !created) {
    return adminErrorResponse(
      400,
      "LISTING_CREATE_FAILED",
      createError?.message || "Failed to create listing.",
    );
  }

  if (tierScopedImages.length > 0) {
    const imageRows = tierScopedImages.map((img) => ({
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

    const featuredImage = tierScopedImages.find((img) => img.is_featured) ?? tierScopedImages[0];
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
      images: tierScopedImages.length,
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
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : [];

  if (ids.length === 0) {
    return adminErrorResponse(400, "INVALID_IDS", "At least one listing id is required.");
  }

  if (action === "bulk-publish") {
    // Use requester-scoped client so DB triggers relying on auth.uid()
    // correctly detect the acting admin user.
    const { error } = await auth.userClient
      .from("listings")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      } as Database["public"]["Tables"]["listings"]["Update"])
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
    // Use the requester-scoped client so auth.uid() inside the RPC resolves
    // to the acting admin user (service-role calls would surface auth.uid() = null).
    const { error } = await auth.userClient.rpc("admin_delete_listings", {
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
