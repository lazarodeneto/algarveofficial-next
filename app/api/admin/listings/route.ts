import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { adminErrorResponse, requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminRequest, logAdminError, createRequestId } from "@/lib/server/observability";
import { getListingTierMaxGalleryImages } from "@/lib/listingTierRules";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { normalizeExternalUrlForStorage } from "@/lib/url-input";
import { getDisallowedSlugInputError, getSlugValidationError, normalizeSlug } from "@/lib/slugify";
import { filterVisibleListingCategories } from "@/lib/categoryMerges";

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

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
type AdminWriteContext = Extract<
  Awaited<ReturnType<typeof requireAdminWriteClient>>,
  { writeClient: unknown }
>;
type AdminWriteClient = AdminWriteContext["writeClient"];

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

const LISTING_TIERS = new Set(["unverified", "verified", "signature"]);
const LISTING_STATUSES = new Set(["draft", "pending_review", "published", "rejected", "archived"]);

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

function normalizeListingMutationPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const normalized: Record<string, unknown> = {};
  for (const [rawKey, rawValue] of Object.entries(raw as Record<string, unknown>)) {
    if (rawValue === undefined) continue;
    if (rawKey === "id" || rawKey === "created_at" || rawKey === "updated_at") continue;

    const key = LISTING_FIELD_ALIASES[rawKey] ?? rawKey;
    if (!LISTING_MUTATION_COLUMNS.has(key)) continue;

    if (key === "slug" && typeof rawValue === "string") {
      normalized[key] = getDisallowedSlugInputError(rawValue)
        ? rawValue.trim()
        : normalizeSlug(rawValue, { entityType: "listing" });
      continue;
    }

    if (LISTING_URL_COLUMNS.has(key) && typeof rawValue === "string") {
      normalized[key] = normalizeExternalUrlForStorage(rawValue);
      continue;
    }

    normalized[key] = rawValue;
  }

  return normalized;
}

function validateListingCreatePayload(payload: Record<string, unknown>) {
  const requiredStrings = ["name", "slug", "short_description", "category_id", "city_id"];
  for (const field of requiredStrings) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      return `${field} is required.`;
    }
  }

  const slugError = getSlugValidationError(String(payload.slug), { entityType: "listing" });
  if (slugError) return slugError;

  if (payload.tier !== undefined && typeof payload.tier === "string" && !LISTING_TIERS.has(payload.tier)) {
    return "tier must be unverified, verified, or signature.";
  }

  if (payload.status !== undefined && typeof payload.status === "string" && !LISTING_STATUSES.has(payload.status)) {
    return "status must be draft, pending_review, published, rejected, or archived.";
  }

  if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
    return "tags must be an array.";
  }

  for (const numericField of ["latitude", "longitude", "price_from", "price_to", "google_rating", "google_review_count"]) {
    const value = payload[numericField];
    if (value !== undefined && value !== null && typeof value !== "number") {
      return `${numericField} must be a number or null.`;
    }
  }

  return null;
}

function isUniqueViolation(error: { code?: string; message?: string } | null | undefined) {
  return error?.code === "23505" || /duplicate key|unique constraint/i.test(error?.message ?? "");
}

async function findListingSlugConflict(
  client: AdminWriteClient,
  slug: string,
  currentListingId?: string,
): Promise<string | null> {
  const listingsTable = client.from("listings");
  const aliasesTable = client.from("listing_slugs");

  if (typeof listingsTable.select !== "function" || typeof aliasesTable.select !== "function") {
    return null;
  }

  const [{ data: listing, error: listingError }, { data: alias, error: aliasError }] = await Promise.all([
    listingsTable
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle(),
    aliasesTable
      .select("listing_id")
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (listingError) throw listingError;
  if (aliasError) throw aliasError;

  if (listing?.id && listing.id !== currentListingId) {
    return `Slug "${slug}" is already used by "${listing.name ?? "another listing"}".`;
  }

  if (alias?.listing_id && alias.listing_id !== currentListingId) {
    return `Slug "${slug}" is already reserved as a current or previous listing URL.`;
  }

  return null;
}

async function ensureCurrentListingSlugAlias(client: AdminWriteClient, listingId: string, slug: string) {
  const aliasesTable = client.from("listing_slugs");
  if (typeof aliasesTable.upsert !== "function") return null;

  const { error } = await aliasesTable
    .upsert(
      {
        listing_id: listingId,
        slug,
        is_current: true,
      },
      { onConflict: "slug" },
    );

  return error;
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
      adminClient.from("categories").select("id, name, slug").order("name"),
    ]);

    if (citiesErr || catsErr) {
      const errMsg = citiesErr?.message || catsErr?.message || "Unknown error";
      logAdminError("REF_DATA_FETCH_FAILED", errMsg, { requestId });
      return NextResponse.json(
        { ok: false, error: { message: errMsg, requestId } },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, data: [], cities, categories: filterVisibleListingCategories(categories ?? []) });
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

  const normalizedListing = normalizeListingMutationPayload(body.listing);
  const validationError = validateListingCreatePayload(normalizedListing);
  if (validationError) {
    return adminErrorResponse(400, "VALIDATION_ERROR", validationError);
  }

  try {
    const slugConflict = await findListingSlugConflict(auth.writeClient, String(normalizedListing.slug));
    if (slugConflict) {
      return adminErrorResponse(409, "DUPLICATE_SLUG", slugConflict);
    }
  } catch (error) {
    return adminErrorResponse(
      400,
      "SLUG_CONFLICT_CHECK_FAILED",
      error instanceof Error ? error.message : "Unable to validate slug uniqueness.",
    );
  }

  const maxTierImages = getListingTierMaxGalleryImages(
    typeof normalizedListing.tier === "string" ? normalizedListing.tier : "unverified",
  );
  const tierScopedImages = images.slice(0, maxTierImages);
  const requestedOwnerId =
    typeof normalizedListing.owner_id === "string" && normalizedListing.owner_id.trim()
      ? normalizedListing.owner_id.trim()
      : "";

  const insertData = {
    ...normalizedListing,
    status:
      typeof normalizedListing.status === "string"
        ? normalizedListing.status
        : "draft",
    tier:
      typeof normalizedListing.tier === "string"
        ? normalizedListing.tier
        : "unverified",
    is_curated:
      typeof normalizedListing.is_curated === "boolean"
        ? normalizedListing.is_curated
        : false,
    tags: Array.isArray(normalizedListing.tags) ? normalizedListing.tags : [],
    owner_id: auth.role === "admin" && requestedOwnerId ? requestedOwnerId : auth.userId,
  } as ListingInsert;

  const { data: created, error: createError } = await auth.writeClient
    .from("listings")
    .insert(insertData)
    .select("*")
    .single();

  if (createError || !created) {
    if (isUniqueViolation(createError)) {
      return adminErrorResponse(
        409,
        "DUPLICATE_SLUG",
        `Slug "${String(normalizedListing.slug)}" is already used or reserved.`,
      );
    }

    return adminErrorResponse(
      400,
      "LISTING_CREATE_FAILED",
      createError?.message || "Failed to create listing.",
    );
  }

  if (created.slug) {
    const aliasError = await ensureCurrentListingSlugAlias(auth.writeClient, created.id, created.slug);
    if (aliasError) {
      if (isUniqueViolation(aliasError)) {
        return adminErrorResponse(
          409,
          "DUPLICATE_SLUG",
          `Slug "${created.slug}" is already used or reserved.`,
        );
      }
      return adminErrorResponse(400, "LISTING_SLUG_ALIAS_CREATE_FAILED", aliasError.message);
    }
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
    const { error } = await auth.writeClient
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
