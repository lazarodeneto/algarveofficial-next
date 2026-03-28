"use client";

import { CookieConsentBanner } from "@/components/gdpr/CookieConsentBanner";
import { CookieConsentDrawer } from "@/components/gdpr/CookieConsentDrawer";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CURRENT_COOKIE_CONSENT_VERSION } from "@/lib/cookieConsent";

export function CookieConsentBannerWrapper() {
  const l = useLocalePath();

  return (
    <>
      <CookieConsentBanner />
      <CookieConsentDrawer
        privacyUrl={l("/privacy-policy")}
        cookieUrl={l("/cookie-policy")}
        version={CURRENT_COOKIE_CONSENT_VERSION}
      />
    </>
  );
}
