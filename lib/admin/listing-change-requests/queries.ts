import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/integrations/supabase/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  LISTING_CHANGE_REQUEST_FIELD_LABELS,
  LISTING_CHANGE_REQUEST_STATUSES,
  isListingChangeRequestField,
  type ListingChangeRequestStatus,
} from "./validation";
import type {
  AdminListingChangeRequestListItem,
  AdminListingChangeRequestsFilters,
  AdminListingChangeRequestsListResponse,
  AdminListingChangeRequestsPagination,
} from "./types";

type AdminClient = SupabaseClient<Database>;

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
export const LISTING_CHANGE_REQUESTS_SETUP_MESSAGE =
  "Listing change request storage is not ready. Apply supabase/migrations/20260511183000_add_listing_change_requests.sql and refresh the Supabase schema cache.";

const ADMIN_LISTING_CHANGE_REQUESTS_SELECT = `
  id,
  listing_id,
  owner_id,
  field_name,
  old_value,
  requested_value,
  status,
  reviewed_by,
  reviewed_at,
  admin_note,
  created_at,
  updated_at,
  listing:listings!listing_change_requests_listing_id_fkey (
    id,
    name,
    slug,
    address,
    website_url,
    contact_phone,
    contact_email,
    owner_id,
    claim_status,
    featured_image_url,
    short_description,
    description,
    instagram_url,
    facebook_url,
    twitter_url,
    youtube_url,
    linkedin_url,
    tiktok_url,
    category_data,
    city:cities(id, name),
    category:categories(id, name)
  ),
  owner:profiles!listing_change_requests_owner_id_fkey (
    id,
    full_name,
    email,
    phone
  ),
  reviewer:profiles!listing_change_requests_reviewed_by_fkey (
    id,
    full_name,
    email,
    phone
  )
`;

function getAdminClient(): AdminClient {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY for admin listing change request reads.");
  }
  return client;
}

export function isMissingListingChangeRequestsSchemaError(error: {
  code?: string | null;
  message?: string | null;
} | null | undefined) {
  const message = error?.message ?? "";
  return (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    /could not find the table ['"]?public\.listing_change_requests['"]? in the schema cache/i.test(message) ||
    /relation ['"]?public\.listing_change_requests['"]? does not exist/i.test(message) ||
    /relation ['"]?listing_change_requests['"]? does not exist/i.test(message)
  );
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readAddress(value: unknown): string | null {
  const direct = readString(value);
  if (direct) return direct;

  const record = toRecord(value);
  if (!record) return null;

  return (
    readString(record.full_address) ??
    readString(record.address) ??
    ([record.street, record.city, record.region, record.country]
      .map(readString)
      .filter(Boolean)
      .join(", ") ||
      null)
  );
}

function readOpeningHours(categoryData: unknown): Json | null {
  const record = toRecord(categoryData);
  if (!record) return null;

  if (Object.prototype.hasOwnProperty.call(record, "opening_hours")) {
    return record.opening_hours as Json;
  }

  const businessDetails = toRecord(record.business_details);
  if (businessDetails && Object.prototype.hasOwnProperty.call(businessDetails, "opening_hours")) {
    return businessDetails.opening_hours as Json;
  }

  return null;
}

function readCurrentValue(
  listing: Record<string, unknown> | null,
  fieldName: string,
): Json | null {
  if (!listing) return null;
  if (fieldName === "opening_hours") return readOpeningHours(listing.category_data);
  if (isListingChangeRequestField(fieldName)) return (listing[fieldName] ?? null) as Json;
  return null;
}

function normalizeProfile(value: unknown) {
  const profile = one(toRecord(value) as Record<string, unknown> | Record<string, unknown>[] | null);
  if (!profile) return null;

  return {
    id: String(profile.id),
    name: readString(profile.full_name),
    email: readString(profile.email),
    phone: readString(profile.phone),
  };
}

function normalizeChangeRequestRow(row: Record<string, unknown>): AdminListingChangeRequestListItem {
  const listing = one(toRecord(row.listing) as Record<string, unknown> | Record<string, unknown>[] | null);
  const city = one(toRecord(listing?.city) as Record<string, unknown> | Record<string, unknown>[] | null);
  const category = one(toRecord(listing?.category) as Record<string, unknown> | Record<string, unknown>[] | null);
  const fieldName = String(row.field_name);
  const fieldLabel = isListingChangeRequestField(fieldName)
    ? LISTING_CHANGE_REQUEST_FIELD_LABELS[fieldName]
    : fieldName.replace(/_/g, " ");

  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    ownerId: String(row.owner_id),
    fieldName,
    fieldLabel,
    oldValue: (row.old_value ?? null) as Json | null,
    requestedValue: (row.requested_value ?? null) as Json | null,
    status: String(row.status) as ListingChangeRequestStatus,
    reviewedBy: readString(row.reviewed_by),
    reviewedAt: readString(row.reviewed_at),
    reviewer: normalizeProfile(row.reviewer),
    adminNote: readString(row.admin_note),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    owner: normalizeProfile(row.owner),
    listing: listing
      ? {
          id: String(listing.id),
          name: readString(listing.name) ?? "Untitled listing",
          slug: readString(listing.slug),
          city: readString(city?.name),
          category: readString(category?.name),
          claimStatus: readString(listing.claim_status),
          ownerId: readString(listing.owner_id),
          websiteUrl: readString(listing.website_url),
          phone: readString(listing.contact_phone),
          email: readString(listing.contact_email),
          address: readAddress(listing.address),
          featuredImageUrl: readString(listing.featured_image_url),
          currentValue: readCurrentValue(listing, fieldName),
        }
      : null,
  };
}

export function parseListingChangeRequestsPagination(
  searchParams: URLSearchParams,
): AdminListingChangeRequestsPagination {
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawPageSize = Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));

  return {
    page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1,
    pageSize: Number.isFinite(rawPageSize)
      ? Math.min(MAX_PAGE_SIZE, Math.max(10, Math.floor(rawPageSize)))
      : DEFAULT_PAGE_SIZE,
  };
}

export function parseListingChangeRequestsFilters(
  searchParams: URLSearchParams,
): AdminListingChangeRequestsFilters {
  const status = searchParams.get("status") ?? "pending";

  return {
    status:
      status === "all" || LISTING_CHANGE_REQUEST_STATUSES.includes(status as ListingChangeRequestStatus)
        ? (status as ListingChangeRequestStatus | "all")
        : "pending",
  };
}

export async function listAdminListingChangeRequests({
  filters,
  pagination,
}: {
  filters: AdminListingChangeRequestsFilters;
  pagination: AdminListingChangeRequestsPagination;
}): Promise<AdminListingChangeRequestsListResponse> {
  const client = getAdminClient();
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  let query = client
    .from("listing_change_requests")
    .select(ADMIN_LISTING_CHANGE_REQUESTS_SELECT, { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (isMissingListingChangeRequestsSchemaError(error)) {
      return {
        items: [],
        total: 0,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: 1,
        setupRequired: true,
        setupMessage: LISTING_CHANGE_REQUESTS_SETUP_MESSAGE,
      };
    }

    throw new Error(error.message || "Failed to load listing change requests.");
  }

  const total = count ?? 0;

  return {
    items: (data ?? []).map((row) => normalizeChangeRequestRow(row as Record<string, unknown>)),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
  };
}

export async function getAdminListingChangeRequestById(
  requestId: string,
): Promise<AdminListingChangeRequestListItem | null> {
  const client = getAdminClient();
  const { data, error } = await client
    .from("listing_change_requests")
    .select(ADMIN_LISTING_CHANGE_REQUESTS_SELECT)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    if (isMissingListingChangeRequestsSchemaError(error)) {
      return null;
    }

    throw new Error(error.message || "Failed to load listing change request.");
  }

  return data ? normalizeChangeRequestRow(data as Record<string, unknown>) : null;
}
