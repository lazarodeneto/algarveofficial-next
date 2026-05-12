import type { InvalidateQueryFilters, QueryClient } from "@tanstack/react-query";

import { ADMIN_INBOX_QUERY_KEY } from "@/lib/admin/inbox/types";

type QueryInvalidator = Pick<QueryClient, "invalidateQueries">;
type ListingIdInput = string | string[] | null | undefined;

function normalizeListingIds(listingIds?: ListingIdInput): string[] {
  if (!listingIds) return [];
  const ids = Array.isArray(listingIds) ? listingIds : [listingIds];
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
}

function invalidateAll(
  queryClient: QueryInvalidator,
  filters: InvalidateQueryFilters[],
) {
  return Promise.all(filters.map((filter) => queryClient.invalidateQueries(filter)));
}

export function invalidateAdminInboxQueries(queryClient: QueryInvalidator) {
  return invalidateAll(queryClient, [
    { queryKey: ADMIN_INBOX_QUERY_KEY, exact: false },
    { queryKey: ["admin", "inbox", "urgent-count"], exact: false },
  ]);
}

export function invalidateListingMutationQueries(
  queryClient: QueryInvalidator,
  listingIds?: ListingIdInput,
) {
  const ids = normalizeListingIds(listingIds);
  const filters: InvalidateQueryFilters[] = [
    { queryKey: ADMIN_INBOX_QUERY_KEY, exact: false },
    { queryKey: ["admin", "inbox", "urgent-count"], exact: false },
    { queryKey: ["admin-all-listings"], exact: false },
    { queryKey: ["admin-listings"], exact: false },
    { queryKey: ["admin-listing"], exact: false },
    { queryKey: ["admin-pending-listings"], exact: false },
    { queryKey: ["admin-signature-listings"], exact: false },
    { queryKey: ["admin-listings-for-cms-placement"], exact: false },
    { queryKey: ["published-listings-for-assignment"], exact: false },
    { queryKey: ["public-listings"], exact: false },
    { queryKey: ["listings"], exact: false },
    { queryKey: ["listing-by-slug"], exact: false },
    { queryKey: ["listing-slug"], exact: false },
    { queryKey: ["listing"], exact: false },
    { queryKey: ["listing-related"], exact: false },
    { queryKey: ["similar-listings"], exact: false },
    { queryKey: ["city-listings"], exact: false },
    { queryKey: ["region-listings"], exact: false },
    { queryKey: ["golf-listings"], exact: false },
    { queryKey: ["golf-course"], exact: false },
    { queryKey: ["admin-listing-golf"], exact: false },
    { queryKey: ["real-estate-directory"], exact: false },
    { queryKey: ["real-estate-listings"], exact: false },
    { queryKey: ["properties-listings"], exact: false },
    { queryKey: ["owner-listings"], exact: false },
    { queryKey: ["homepage-listings"], exact: false },
    { queryKey: ["home-city-placement-listings"], exact: false },
    { queryKey: ["home-featured-city-placement-listings"], exact: false },
    { queryKey: ["curated-assignments"], exact: false },
    { queryKey: ["category-listing-counts"], exact: false },
    { queryKey: ["reference-data"], exact: false },
    { queryKey: ["directory", "category-counts"], exact: false },
    { queryKey: ["stay-city-counts"], exact: false },
    { queryKey: ["experiences-city-counts"], exact: false },
  ];

  for (const id of ids) {
    filters.push(
      { queryKey: ["admin-listing", id], exact: true },
      { queryKey: ["listing", "admin", id], exact: true },
      { queryKey: ["admin-listing-golf", id], exact: true },
      { queryKey: ["owner-listing", id], exact: true },
      { queryKey: ["owner-listing-images", id], exact: true },
      { queryKey: ["owner-listing-tier", id], exact: true },
    );
  }

  return invalidateAll(queryClient, filters);
}

export function invalidateCmsPageMutationQueries(queryClient: QueryInvalidator) {
  return invalidateAll(queryClient, [
    { queryKey: ["cms-page"], exact: false },
    { queryKey: ["homepage-config"], exact: false },
    { queryKey: ["public-page"], exact: false },
    { queryKey: ["global-settings"], exact: false },
    { queryKey: ["cms-runtime"], exact: false },
    { queryKey: ["homepage-settings"], exact: false },
    { queryKey: ["homepage-settings-translation"], exact: false },
    { queryKey: ["events-page"], exact: false },
  ]);
}
