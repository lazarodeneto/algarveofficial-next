export function homepageSettingsQueryKey(locale: string) {
  return ["homepage-settings", locale] as const;
}

export function homepageSettingsTranslationQueryKey(
  settingsId: string | null | undefined,
  locale: string,
) {
  return ["homepage-settings-translation", settingsId ?? null, locale] as const;
}

export function globalSettingsQueryKey(
  keys: string[] | undefined,
  locale: string,
) {
  return ["global-settings", keys?.length ? [...new Set(keys)].sort() : "all", locale] as const;
}

export function citiesQueryKey(locale: string) {
  return ["cities", locale] as const;
}

export function regionsQueryKey(locale: string) {
  return ["regions", locale] as const;
}

export function categoriesQueryKey(locale: string) {
  return ["categories", locale] as const;
}

export function regionListingCountsQueryKey() {
  return ["reference-data", "region-listing-counts"] as const;
}

export function cityListingCountsQueryKey() {
  return ["reference-data", "city-listing-counts"] as const;
}

export function curatedAssignmentsQueryKey(
  contextType: string,
  contextId: string | null,
  limit: number,
) {
  return ["curated-assignments", contextType, contextId, limit] as const;
}

export function publishedListingsQueryKey(
  filters: Record<string, unknown>,
  locale: string,
) {
  return ["listings", "published", filters, locale] as const;
}

export function signatureListingsQueryKey(locale: string) {
  return ["listings", "signature", locale] as const;
}

export function homepageListingSplitQueryKey(
  segment: "editors" | "premium",
  locale: string,
) {
  return ["homepage-listings", segment, locale] as const;
}
