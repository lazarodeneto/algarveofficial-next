export const PUBLIC_LISTING_TRANSLATION_STATUSES = ["auto", "reviewed"] as const;

export type PublicListingTranslationStatus = (typeof PUBLIC_LISTING_TRANSLATION_STATUSES)[number];

export function isPublicListingTranslationStatus(status: unknown): status is PublicListingTranslationStatus {
  return typeof status === "string" && (PUBLIC_LISTING_TRANSLATION_STATUSES as readonly string[]).includes(status);
}

export function publicListingTranslationOrNull<T extends { translation_status?: string | null }>(
  translation: T | null | undefined,
): T | null {
  return translation && isPublicListingTranslationStatus(translation.translation_status) ? translation : null;
}
