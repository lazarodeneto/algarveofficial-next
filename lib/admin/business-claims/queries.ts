import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  BUSINESS_CLAIM_STATUSES,
  BUSINESS_CLAIM_TIERS,
  type AdminBusinessClaimListItem,
  type AdminBusinessClaimsFilters,
  type AdminBusinessClaimsListResponse,
  type AdminBusinessClaimsPagination,
  type BusinessClaimStatus,
  type BusinessClaimTier,
} from "./types";

type AdminClient = SupabaseClient<Database>;

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const ADMIN_BUSINESS_CLAIMS_SELECT = `
  id,
  listing_id,
  claimant_name,
  claimant_email,
  claimant_phone,
  claimant_role,
  business_email,
  company_website,
  selected_tier,
  verification_method,
  proof_url,
  proof_notes,
  message,
  status,
  confidence_score,
  reviewed_by,
  reviewed_at,
  review_note,
  rejection_reason,
  created_at,
  updated_at,
  listing:listings!business_claims_listing_id_fkey (
    id,
    name,
    slug,
    address,
    website_url,
    contact_phone,
    contact_email,
    owner_id,
    claim_status,
    city:cities(id, name),
    category:categories(id, name)
  )
`;

function getAdminClient(): AdminClient {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY for admin business claim reads.");
  }
  return client;
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

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
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

function normalizeClaimRow(row: Record<string, unknown>): AdminBusinessClaimListItem {
  const listing = one(toRecord(row.listing) as Record<string, unknown> | Record<string, unknown>[] | null);
  const city = one(toRecord(listing?.city) as Record<string, unknown> | Record<string, unknown>[] | null);
  const category = one(toRecord(listing?.category) as Record<string, unknown> | Record<string, unknown>[] | null);

  return {
    id: String(row.id),
    listingId: String(row.listing_id),
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
        }
      : null,
    claimantName: readString(row.claimant_name) ?? "Unknown claimant",
    claimantEmail: readString(row.claimant_email) ?? "",
    claimantPhone: readString(row.claimant_phone),
    claimantRole: readString(row.claimant_role),
    businessEmail: readString(row.business_email),
    companyWebsite: readString(row.company_website),
    selectedTier: String(row.selected_tier) as BusinessClaimTier,
    verificationMethod: readString(row.verification_method) ?? "manual_review",
    proofUrl: readString(row.proof_url),
    proofNotes: readString(row.proof_notes),
    message: readString(row.message),
    status: String(row.status) as BusinessClaimStatus,
    confidenceScore: readNumber(row.confidence_score),
    reviewNote: readString(row.review_note),
    reviewedBy: readString(row.reviewed_by),
    reviewedAt: readString(row.reviewed_at),
    rejectionReason: readString(row.rejection_reason),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function parseBusinessClaimsPagination(
  searchParams: URLSearchParams,
): AdminBusinessClaimsPagination {
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawPageSize = Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));

  return {
    page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1,
    pageSize: Number.isFinite(rawPageSize)
      ? Math.min(MAX_PAGE_SIZE, Math.max(10, Math.floor(rawPageSize)))
      : DEFAULT_PAGE_SIZE,
  };
}

export function parseBusinessClaimsFilters(searchParams: URLSearchParams): AdminBusinessClaimsFilters {
  const status = searchParams.get("status") ?? "pending";
  const selectedTier = searchParams.get("selectedTier") ?? "all";
  const verificationMethod = searchParams.get("verificationMethod") ?? "all";

  return {
    status:
      status === "all" || BUSINESS_CLAIM_STATUSES.includes(status as BusinessClaimStatus)
        ? (status as BusinessClaimStatus | "all")
        : "pending",
    selectedTier:
      selectedTier === "all" || BUSINESS_CLAIM_TIERS.includes(selectedTier as BusinessClaimTier)
        ? (selectedTier as BusinessClaimTier | "all")
        : "all",
    verificationMethod: verificationMethod.trim() ? verificationMethod : "all",
  };
}

export async function listAdminBusinessClaims({
  filters,
  pagination,
}: {
  filters: AdminBusinessClaimsFilters;
  pagination: AdminBusinessClaimsPagination;
}): Promise<AdminBusinessClaimsListResponse> {
  const client = getAdminClient();
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;

  let query = client
    .from("business_claims")
    .select(ADMIN_BUSINESS_CLAIMS_SELECT, { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.selectedTier && filters.selectedTier !== "all") {
    query = query.eq("selected_tier", filters.selectedTier);
  }
  if (filters.verificationMethod && filters.verificationMethod !== "all") {
    query = query.eq("verification_method", filters.verificationMethod);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message || "Failed to load business claims.");
  }

  const total = count ?? 0;

  return {
    items: (data ?? []).map((row) => normalizeClaimRow(row as Record<string, unknown>)),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
  };
}

export async function getAdminBusinessClaimById(
  claimId: string,
): Promise<AdminBusinessClaimListItem | null> {
  const client = getAdminClient();
  const { data, error } = await client
    .from("business_claims")
    .select(ADMIN_BUSINESS_CLAIMS_SELECT)
    .eq("id", claimId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load business claim.");
  }

  return data ? normalizeClaimRow(data as Record<string, unknown>) : null;
}
