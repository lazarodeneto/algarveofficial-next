export type ConsentValue = "granted" | "denied";

export type ConsentState = {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  functionality_storage?: ConsentValue;
  security_storage?: ConsentValue;
};

type ConsentWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

const GOOGLE_CONSENT_STORAGE_KEY = "google_consent_mode_v2";
const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent_preferences";

export const DEFAULT_CONSENT: ConsentState = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
};

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isConsentValue(value: unknown): value is ConsentValue {
  return value === "granted" || value === "denied";
}

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ConsentState>;
  return (
    isConsentValue(record.analytics_storage) &&
    isConsentValue(record.ad_storage) &&
    isConsentValue(record.ad_user_data) &&
    isConsentValue(record.ad_personalization) &&
    (record.functionality_storage === undefined || isConsentValue(record.functionality_storage)) &&
    (record.security_storage === undefined || isConsentValue(record.security_storage))
  );
}

function parseConsentState(rawValue: string | null): ConsentState | null {
  if (!rawValue) return null;
  try {
    const parsed: unknown = JSON.parse(rawValue);
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadLegacyCookiePreferences(): ConsentState | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as {
      analytics?: unknown;
      marketing?: unknown;
      functional?: unknown;
    } | null;

    if (!parsed || typeof parsed !== "object") return null;

    const analytics = parsed.analytics === true ? "granted" : "denied";
    const marketing = parsed.marketing === true ? "granted" : "denied";

    return {
      analytics_storage: analytics,
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
      functionality_storage: "granted",
      security_storage: "granted",
    };
  } catch {
    return null;
  }
}

function ensureGtag() {
  if (typeof window === "undefined") return null;

  const consentWindow = window as ConsentWindow;
  consentWindow.dataLayer = consentWindow.dataLayer || [];
  consentWindow.gtag =
    consentWindow.gtag ||
    function gtag(...args: unknown[]) {
      consentWindow.dataLayer?.push(args);
    };

  return consentWindow;
}

export function applyDefaultConsent(): void {
  const consentWindow = ensureGtag();
  if (!consentWindow?.gtag) return;
  consentWindow.gtag("consent", "default", DEFAULT_CONSENT);
}

export function updateGoogleConsent(consent: ConsentState): void {
  const consentWindow = ensureGtag();
  if (!consentWindow?.gtag) return;

  consentWindow.gtag("consent", "update", consent);
  consentWindow.dataLayer?.push({
    event: "consent_update",
    ...consent,
  });
}

export function saveConsent(consent: ConsentState): void {
  if (!canUseBrowserStorage()) return;
  try {
    window.localStorage.setItem(GOOGLE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Ignore storage failures in private or restricted browsing contexts.
  }
}

export function loadConsent(): ConsentState | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const storedConsent = parseConsentState(window.localStorage.getItem(GOOGLE_CONSENT_STORAGE_KEY));
    return storedConsent ?? loadLegacyCookiePreferences();
  } catch {
    return null;
  }
}

export function hasConsentChoice(): boolean {
  return loadConsent() !== null;
}
