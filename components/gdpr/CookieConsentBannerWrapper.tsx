"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useLocalePath } from "@/hooks/useLocalePath";
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  CURRENT_COOKIE_CONSENT_VERSION,
} from "@/lib/cookieConsent";

const DeferredCookieConsentDrawer = dynamic(
  () =>
    import("@/components/gdpr/CookieConsentDrawer").then(
      (module) => module.CookieConsentDrawer,
    ),
  { ssr: false },
);

interface CookieConsentBannerWrapperProps {
  deferInitialPrompt?: boolean;
}

function scheduleDeferredCookieConsent(callback: () => void) {
  let disposed = false;
  let timeoutId: number | null = null;

  const run = () => {
    if (disposed) return;
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
    callback();
  };

  timeoutId = window.setTimeout(run, 15000);
  window.addEventListener("pointerdown", run, { once: true, passive: true });
  window.addEventListener("keydown", run, { once: true });
  window.addEventListener("scroll", run, { once: true, passive: true });

  return () => {
    disposed = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    window.removeEventListener("pointerdown", run);
    window.removeEventListener("keydown", run);
    window.removeEventListener("scroll", run);
  };
}

export function CookieConsentBannerWrapper({
  deferInitialPrompt = false,
}: CookieConsentBannerWrapperProps) {
  const l = useLocalePath();
  const [enabled, setEnabled] = useState(!deferInitialPrompt);

  useEffect(() => {
    if (!deferInitialPrompt) {
      return undefined;
    }

    const enable = () => setEnabled(true);
    const cancelDeferred = scheduleDeferredCookieConsent(enable);

    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, enable);
    return () => {
      cancelDeferred();
      window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, enable);
    };
  }, [deferInitialPrompt]);

  if (!enabled) return null;

  return (
    <DeferredCookieConsentDrawer
      privacyUrl={l("/privacy-policy")}
      cookieUrl={l("/cookie-policy")}
      version={CURRENT_COOKIE_CONSENT_VERSION}
      deferInitialPrompt={deferInitialPrompt}
    />
  );
}
