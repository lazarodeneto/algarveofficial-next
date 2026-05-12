import type { Database } from "@/integrations/supabase/types";

export type BusinessClaimStatus = Database["public"]["Enums"]["business_claim_status"];
export type BusinessClaimTier = Database["public"]["Enums"]["business_claim_tier"];

export const BUSINESS_CLAIM_STATUSES: BusinessClaimStatus[] = [
  "pending",
  "needs_more_info",
  "approved",
  "rejected",
  "cancelled",
  "disputed",
];

export const BUSINESS_CLAIM_TIERS: BusinessClaimTier[] = [
  "free",
  "verified",
  "signature",
];

export const BUSINESS_CLAIM_VERIFICATION_METHODS = [
  "business_email_domain",
  "phone_verification",
  "website_contact_match",
  "official_social_account",
  "document_upload",
  "manual_review",
] as const;

export type BusinessClaimVerificationMethod =
  (typeof BUSINESS_CLAIM_VERIFICATION_METHODS)[number];

export interface AdminBusinessClaimListingSummary {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  category: string | null;
  claimStatus: string | null;
  ownerId: string | null;
  websiteUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface AdminBusinessClaimListItem {
  id: string;
  listingId: string;
  listing: AdminBusinessClaimListingSummary | null;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string | null;
  claimantRole: string | null;
  businessEmail: string | null;
  companyWebsite: string | null;
  selectedTier: BusinessClaimTier;
  verificationMethod: string;
  proofUrl: string | null;
  proofNotes: string | null;
  message: string | null;
  status: BusinessClaimStatus;
  confidenceScore: number | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBusinessClaimsFilters {
  status?: BusinessClaimStatus | "all";
  selectedTier?: BusinessClaimTier | "all";
  verificationMethod?: string | "all";
}

export interface AdminBusinessClaimsPagination {
  page: number;
  pageSize: number;
}

export interface AdminBusinessClaimsListResponse {
  items: AdminBusinessClaimListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
