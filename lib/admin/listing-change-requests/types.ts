import type { Database, Json } from "@/integrations/supabase/types";
import type {
  ListingChangeRequestField,
  ListingChangeRequestStatus,
} from "@/lib/admin/listing-change-requests/validation";

export type AdminListingChangeRequestStatus =
  Database["public"]["Enums"]["listing_change_request_status"];

export interface AdminListingChangeRequestListingSummary {
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
  featuredImageUrl: string | null;
  currentValue: Json | null;
}

export interface AdminListingChangeRequestOwnerSummary {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface AdminListingChangeRequestListItem {
  id: string;
  listingId: string;
  ownerId: string;
  fieldName: ListingChangeRequestField | string;
  fieldLabel: string;
  oldValue: Json | null;
  requestedValue: Json | null;
  status: ListingChangeRequestStatus | AdminListingChangeRequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewer: AdminListingChangeRequestOwnerSummary | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  listing: AdminListingChangeRequestListingSummary | null;
  owner: AdminListingChangeRequestOwnerSummary | null;
}

export interface AdminListingChangeRequestsFilters {
  status?: ListingChangeRequestStatus | "all";
}

export interface AdminListingChangeRequestsPagination {
  page: number;
  pageSize: number;
}

export interface AdminListingChangeRequestsListResponse {
  items: AdminListingChangeRequestListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  setupRequired?: boolean;
  setupMessage?: string | null;
}
