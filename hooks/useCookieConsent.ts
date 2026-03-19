import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  type CookieConsentCategory,
  type CookieConsentRecord,
  getStoredCookieConsent,
  hasCookieConsentForCategory,
  openCookiePreferences,
} from "@/lib/cookieConsent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => getStoredCookieConsent());
  const isLoaded = typeof window !== "undefined";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncConsent = () => {
      setConsent(getStoredCookieConsent());
    };

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
    window.addEventListener("storage", syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  const canUseCategory = useCallback(
    (category: CookieConsentCategory) => hasCookieConsentForCategory(consent, category),
    [consent],
  );

  const hasDecided = useMemo(() => Boolean(consent), [consent]);

  return {
    consent,
    hasDecided,
    isLoaded,
    canUseCategory,
    openPreferences: openCookiePreferences,
  };
}
