const LOCALE_KEY_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

const LOCALIZED_CONTENT_KEYS = ["localized_content", "localizedContent", "i18n_content", "translations"] as const;

const VERIFIED_BEACH_DETAIL_KEYS = [
  "last_verified_at",
  "lastVerifiedAt",
  "verification_sources",
  "verificationSources",
  "verification_notes",
  "verificationNotes",
  "parking_info",
  "parkingInfo",
  "accessibility_info",
  "accessibilityInfo",
  "lifeguard_info",
  "lifeguardInfo",
  "blue_flag_info",
  "blueFlagInfo",
  "blue_flag_year",
  "blueFlagYear",
  "nearby_beaches",
  "nearbyBeaches",
  "nearby_restaurants",
  "nearbyRestaurants",
  "nearby_attractions",
  "nearbyAttractions",
  "faq_items",
  "faqItems",
  "google_maps_url",
  "googleMapsUrl",
] as const;

export function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed || !["[", "{"].includes(trimmed[0])) return value;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  const parsed = parseJsonValue(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {};
}

function stringFrom(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function hasSubstantiveValue(value: unknown): boolean {
  const parsed = parseJsonValue(value);
  if (parsed === null || parsed === undefined) return false;
  if (typeof parsed === "string") return parsed.trim().length > 0;
  if (typeof parsed === "number") return Number.isFinite(parsed);
  if (typeof parsed === "boolean") return true;
  if (Array.isArray(parsed)) return parsed.length > 0;
  if (typeof parsed === "object") return Object.keys(parsed as Record<string, unknown>).length > 0;
  return false;
}

function hasVerifiedBeachDetailKeys(details: Record<string, unknown>): boolean {
  return VERIFIED_BEACH_DETAIL_KEYS.some((key) => hasSubstantiveValue(details[key]));
}

function buildLocaleCandidates(locale?: string): string[] {
  const normalized = (locale ?? "en").trim().toLowerCase();
  const [language] = normalized.split("-");
  return Array.from(new Set([normalized, language, "en"].filter(Boolean)));
}

function getLocalizedSource(details: Record<string, unknown>): unknown {
  for (const key of LOCALIZED_CONTENT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(details, key)) return details[key];
  }
  return undefined;
}

function resolveLocalizedValue(value: unknown, locale?: string): unknown {
  const record = asRecord(value);
  const keys = Object.keys(record);
  if (keys.length === 0) return undefined;
  if (!keys.every((key) => LOCALE_KEY_PATTERN.test(key))) return undefined;

  for (const candidate of buildLocaleCandidates(locale)) {
    if (record[candidate] !== undefined) return record[candidate];
  }

  return undefined;
}

export function hasVerifiedBeachBaseContent(details: unknown): boolean {
  return hasVerifiedBeachDetailKeys(asRecord(details));
}

export function shouldUseBeachBaseContent(details: unknown): boolean {
  return hasVerifiedBeachBaseContent(details);
}

export function isCurrentBeachLocalizedContent(
  baseDetails: Record<string, unknown>,
  localizedDetails: Record<string, unknown>,
): boolean {
  if (Object.keys(localizedDetails).length === 0) return false;

  const baseVerifiedAt = stringFrom(baseDetails.last_verified_at ?? baseDetails.lastVerifiedAt);
  if (baseVerifiedAt) {
    return stringFrom(localizedDetails.last_verified_at ?? localizedDetails.lastVerifiedAt) === baseVerifiedAt;
  }

  if (hasVerifiedBeachDetailKeys(baseDetails)) {
    return hasVerifiedBeachDetailKeys(localizedDetails);
  }

  return true;
}

export function resolveBeachDetails(details: unknown, locale?: string): Record<string, unknown> {
  const baseDetails = asRecord(details);
  const localizedDetails = asRecord(resolveLocalizedValue(getLocalizedSource(baseDetails), locale));

  if (!isCurrentBeachLocalizedContent(baseDetails, localizedDetails)) {
    return baseDetails;
  }

  return { ...baseDetails, ...localizedDetails };
}
