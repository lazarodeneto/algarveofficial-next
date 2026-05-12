import type { Database, Json } from "@/integrations/supabase/types";

export const LISTING_VERIFICATION_BATCH_SIZE = 5;

export const LISTING_VERIFICATION_AUDIT_STATUSES = [
  "pending",
  "completed",
  "completed_with_proposals",
  "failed",
  "needs_review",
] as const satisfies readonly Database["public"]["Enums"]["listing_verification_audit_status"][];

export const LISTING_UPDATE_PROPOSAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "applied",
] as const satisfies readonly Database["public"]["Enums"]["listing_update_proposal_status"][];

export const LISTING_VERIFICATION_CONFIDENCE_LABELS = [
  "unknown",
  "low",
  "medium",
  "high",
  "verified",
] as const satisfies readonly Database["public"]["Enums"]["listing_verification_confidence_label"][];

export const LISTING_VERIFICATION_PROPOSABLE_FIELDS = [
  "name",
  "slug",
  "category_id",
  "city_id",
  "region_id",
  "address",
  "latitude",
  "longitude",
  "website_url",
  "contact_phone",
  "contact_email",
  "short_description",
  "description",
  "featured_image_url",
  "instagram_url",
  "facebook_url",
  "twitter_url",
  "youtube_url",
  "linkedin_url",
  "tiktok_url",
  "telegram_url",
  "whatsapp_number",
  "google_business_url",
  "google_rating",
  "google_review_count",
  "price_from",
  "price_to",
  "price_currency",
  "tags",
  "meta_title",
  "meta_description",
  "category_data",
] as const;

export type ListingVerificationAuditStatus =
  Database["public"]["Enums"]["listing_verification_audit_status"];
export type ListingUpdateProposalStatus =
  Database["public"]["Enums"]["listing_update_proposal_status"];
export type ListingVerificationConfidenceLabel =
  Database["public"]["Enums"]["listing_verification_confidence_label"];
export type ListingVerificationProposalField =
  (typeof LISTING_VERIFICATION_PROPOSABLE_FIELDS)[number];

export type ListingVerificationSource = {
  source_url: string;
  source_type?: string | null;
  checked_at?: string | null;
  fields?: string[];
  confidence_label?: ListingVerificationConfidenceLabel;
  notes?: string | null;
};

export type ListingVerificationAuditInsert =
  Database["public"]["Tables"]["listing_verification_audits"]["Insert"];
export type ListingUpdateProposalInsert =
  Database["public"]["Tables"]["listing_update_proposals"]["Insert"];

export function isListingVerificationProposalField(
  fieldName: string,
): fieldName is ListingVerificationProposalField {
  return LISTING_VERIFICATION_PROPOSABLE_FIELDS.includes(
    fieldName as ListingVerificationProposalField,
  );
}

export function normalizeListingVerificationSourceUrls(urls: Iterable<string>) {
  return Array.from(
    new Set(
      Array.from(urls)
        .map((url) => url.trim())
        .filter((url) => /^https?:\/\//i.test(url)),
    ),
  );
}

export function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

export function createListingVerificationBatchId(date = new Date()) {
  return `listing-verification-${date.toISOString().slice(0, 10)}`;
}

export function buildListingVerificationAuditInsert(input: {
  listingId: string;
  batchId: string;
  currentData?: Record<string, unknown>;
  proposedData?: Record<string, unknown>;
  appliedData?: Record<string, unknown>;
  sources?: ListingVerificationSource[];
  confidenceScore?: number | null;
  confidenceLabel?: ListingVerificationConfidenceLabel;
  notes?: string | null;
  needsAdminReview?: boolean;
  status?: ListingVerificationAuditStatus;
}): ListingVerificationAuditInsert {
  return {
    listing_id: input.listingId,
    batch_id: input.batchId,
    current_data: toJson(input.currentData ?? {}),
    proposed_data: toJson(input.proposedData ?? {}),
    applied_data: toJson(input.appliedData ?? {}),
    sources: toJson(input.sources ?? []),
    confidence_score: input.confidenceScore ?? null,
    confidence_label: input.confidenceLabel ?? "unknown",
    notes: input.notes ?? null,
    needs_admin_review: input.needsAdminReview ?? false,
    status: input.status ?? "pending",
  };
}

export function buildListingUpdateProposalInsert(input: {
  listingId: string;
  auditId: string;
  fieldName: ListingVerificationProposalField;
  oldValue?: unknown;
  proposedValue: unknown;
  sourceUrls?: string[];
  sourceType?: string | null;
  confidenceLabel?: ListingVerificationConfidenceLabel;
  status?: ListingUpdateProposalStatus;
}): ListingUpdateProposalInsert {
  return {
    listing_id: input.listingId,
    audit_id: input.auditId,
    field_name: input.fieldName,
    old_value: input.oldValue === undefined ? null : toJson(input.oldValue),
    proposed_value: toJson(input.proposedValue),
    source_urls: toJson(normalizeListingVerificationSourceUrls(input.sourceUrls ?? [])),
    source_type: input.sourceType ?? null,
    confidence_label: input.confidenceLabel ?? "unknown",
    status: input.status ?? "pending",
  };
}
