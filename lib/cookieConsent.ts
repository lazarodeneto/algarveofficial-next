export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent_preferences";
export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent:changed";
export const COOKIE_PREFERENCES_OPEN_EVENT = "cookie-consent:open-preferences";
export const CURRENT_COOKIE_CONSENT_VERSION = "cookie-consent-v1";

export type CookieConsentVersion = string;
export type CookieConsentCategory = "essential" | "functional" | "analytics" | "marketing";

export interface CookieConsentRecord {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: CookieConsentVersion;
}

export interface CookiePreferenceDraft {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface LegacyCookieConsentRecord {
  essential: true;
  functional: boolean;
  marketing: boolean;
  timestamp: number;
  version: CookieConsentVersion;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferenceDraft = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

export function isCookieConsentRecord(value: unknown): value is CookieConsentRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<CookieConsentRecord>;
  return (
    record.essential === true &&
    isBoolean(record.functional) &&
    isBoolean(record.analytics) &&
    isBoolean(record.marketing) &&
    typeof record.timestamp === "number" &&
    Number.isFinite(record.timestamp) &&
    typeof record.version === "string" &&
    record.version.length > 0
  );
}

function isLegacyCookieConsentRecord(value: unknown): value is LegacyCookieConsentRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<LegacyCookieConsentRecord>;
  return (
    record.essential === true &&
    isBoolean(record.functional) &&
    isBoolean(record.marketing) &&
    typeof record.timestamp === "number" &&
    Number.isFinite(record.timestamp) &&
    typeof record.version === "string" &&
    record.version.length > 0
  );
}

export function parseCookieConsentRecord(rawValue: string | null): CookieConsentRecord | null {
  if (!rawValue) return null;
  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (isCookieConsentRecord(parsed)) {
      return parsed;
    }

    if (isLegacyCookieConsentRecord(parsed)) {
      return {
        ...parsed,
        analytics: parsed.functional ?? parsed.marketing,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function getStoredCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  return parseCookieConsentRecord(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function saveCookieConsent(record: CookieConsentRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT));
}

export function draftFromCookieConsent(
  record: CookieConsentRecord | null,
): CookiePreferenceDraft {
  if (!record) return { ...DEFAULT_COOKIE_PREFERENCES };

  return {
    essential: true,
    functional: record.functional,
    analytics: record.analytics,
    marketing: record.marketing,
  };
}

export function hasCookieConsentForCategory(
  record: CookieConsentRecord | null,
  category: CookieConsentCategory,
): boolean {
  if (!record) return false;
  if (category === "essential") return true;
  return record[category];
}

export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_OPEN_EVENT));
}
