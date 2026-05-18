"use client";

import { CookieConsentDrawer } from "@/components/gdpr/CookieConsentDrawer";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CURRENT_COOKIE_CONSENT_VERSION } from "@/lib/cookieConsent";

interface CookieConsentBannerWrapperProps {
  deferInitialPrompt?: boolean;
}

export function CookieConsentBannerWrapper({
  deferInitialPrompt = false,
}: CookieConsentBannerWrapperProps) {
  const l = useLocalePath();

  return (
    <CookieConsentDrawer
      privacyUrl={l("/privacy-policy")}
      cookieUrl={l("/cookie-policy")}
      version={CURRENT_COOKIE_CONSENT_VERSION}
      deferInitialPrompt={deferInitialPrompt}
    />
  );
}
