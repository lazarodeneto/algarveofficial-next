import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminRequest, logAdminError, createRequestId } from "@/lib/server/observability";
import { listingFormSchema } from "@/lib/forms/schema";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";
import { createServiceRoleClient } from "@/lib/supabase/service";

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

const DEFAULT_ADMIN_LISTINGS_PAGE_SIZE = 50;
const MIN_ADMIN_LISTINGS_PAGE_SIZE = 10;
const MAX_ADMIN_LISTINGS_PAGE_SIZE = 100;
const ADMIN_LISTINGS_SELECT = `
  id, name, tier, status, is_curated, description, slug, featured_rank,
  city_id, category_id, region_id,
  featured_image_url, website_url, contact_phone, contact_email, address, latitude, longitude,
  city:cities(id, name),
  category:categories(id, name),
  region:regions(id, name)
`;

interface AdminListingsFilters {
  search?: string;
  cityId?: string;
  categoryId?: string;
  tier?: string;
  status?: string;
}

interface AdminListingsPagination {
  page: number;
  pageSize: number;
  sortBy: "created_at" | "name" | "tier" | "status" | "featured_rank";
  sortOrder: "asc" | "desc";
}

interface AdminListingsQuery {
  ilike(column: string, pattern: string): AdminListingsQuery;
  eq(column: string, value: string): AdminListingsQuery;
  order(
    column: string,
    options: { ascending: boolean; nullsFirst?: boolean },
  ): AdminListingsQuery;
  range(
    from: number,
    to: number,
  ): Promise<{ data: unknown[] | null; count: number | null; error: { message: string } | null }>;
}

function normalizeAdminFilter(value: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "all" ? trimmed : undefined;
}

function applyAdminListingFilters(query: AdminListingsQuery, filters: AdminListingsFilters) {
  let nextQuery = query;
  if (filters.search) {
    nextQuery = nextQuery.ilike("name", `%${filters.search}%`);
  }
  if (filters.cityId) {
    nextQuery = nextQuery.eq("city_id", filters.cityId);
  }
  if (filters.categoryId) {
    nextQuery = nextQuery.eq("category_id", filters.categoryId);
  }
  if (filters.tier) {
    nextQuery = nextQuery.eq("tier", filters.tier);
  }
  if (filters.status) {
    nextQuery = nextQuery.eq("status", filters.status);
  }
  return nextQuery;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}

function parseAdminListingsPagination(searchParams: URLSearchParams): AdminListingsPagination {
  const page = Math.max(1, parsePositiveInteger(searchParams.get("page"), 1));
  const requestedPageSize = parsePositiveInteger(
    searchParams.get("pageSize"),
    DEFAULT_ADMIN_LISTINGS_PAGE_SIZE,
  );
  const pageSize = Math.min(
    MAX_ADMIN_LISTINGS_PAGE_SIZE,
    Math.max(MIN_ADMIN_LISTINGS_PAGE_SIZE, requestedPageSize),
  );

  const requestedSortBy = searchParams.get("sortBy");
  const sortBy =
    requestedSortBy === "name" ||
    requestedSortBy === "tier" ||
    requestedSortBy === "status" ||
    requestedSortBy === "featured_rank"
      ? requestedSortBy
      : "created_at";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return { page, pageSize, sortBy, sortOrder };
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

async function fetchAdminListingsPage(
  client: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  filters: AdminListingsFilters = {},
  pagination: AdminListingsPagination,
) {
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  const query = client
    .from("listings")
    .select(ADMIN_LISTINGS_SELECT, { count: "exact" }) as unknown as AdminListingsQuery;

  const { data, count, error } = await applyAdminListingFilters(query, filters)
    .order(pagination.sortBy, { ascending: pagination.sortOrder === "asc", nullsFirst: false })
    .order("id", { ascending: pagination.sortOrder === "asc" })
    .range(from, to);

  if (error) return { items: null, total: 0, error };

  return { items: data ?? [], total: count ?? 0, error: null };
}

export async function GET(request: NextRequest) {
  logAdminRequest(request);
  const requestId = createRequestId();

  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const adminClient = createServiceRoleClient();
  if (!adminClient) {
    return adminErrorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin listings reads.",
    );
  }

  const includeRefData = request.nextUrl.searchParams.get("include_ref_data") === "true";

  if (includeRefData) {
    const [{ data: cities, error: citiesErr }, { data: categories, error: catsErr }] = await Promise.all([
      adminClient.from("cities").select("id, name").order("name"),
      adminClient.from("categories").select("id, name").order("name"),
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

  const filters: AdminListingsFilters = {
    search: normalizeAdminFilter(request.nextUrl.searchParams.get("search")),
    cityId: normalizeAdminFilter(request.nextUrl.searchParams.get("city") ?? request.nextUrl.searchParams.get("city_id")),
    categoryId: normalizeAdminFilter(
      request.nextUrl.searchParams.get("category") ?? request.nextUrl.searchParams.get("category_id"),
    ),
    tier: normalizeAdminFilter(request.nextUrl.searchParams.get("tier")),
    status: normalizeAdminFilter(request.nextUrl.searchParams.get("status")),
  };
  const pagination = parseAdminListingsPagination(request.nextUrl.searchParams);

  const { items, total, error } = await fetchAdminListingsPage(adminClient, filters, pagination);

  if (error) {
    logAdminError("LISTINGS_FETCH_FAILED", error, { requestId });
    return NextResponse.json({ ok: false, error: { message: error.message, requestId } }, { status: 500 });
  }

  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  return NextResponse.json({
    ok: true,
    data: items,
    items,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  });
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
