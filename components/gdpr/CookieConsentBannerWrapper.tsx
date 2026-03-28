"use client";

import { CookieConsentBanner } from "@/components/gdpr/CookieConsentBanner";
import { CookieConsentDrawer } from "@/components/gdpr/CookieConsentDrawer";
import { useCookieBannerSettings } from "@/hooks/useCookieBannerSettings";
import { useLocalePath } from "@/hooks/useLocalePath";

export function CookieConsentBannerWrapper() {
  const { settings } = useCookieBannerSettings();
  const l = useLocalePath();

  return (
    <>
      <CookieConsentBanner />
      <CookieConsentDrawer
        privacyUrl={l("/privacy-policy")}
        cookieUrl={l("/cookie-policy")}
        version={`cookie-consent-${settings.updated_at}`}
      />
    </>
  );
}
