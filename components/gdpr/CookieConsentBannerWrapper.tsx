"use client";

import { useEffect, useState, type ComponentType } from "react";

import { useLocalePath } from "@/hooks/useLocalePath";
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  CURRENT_COOKIE_CONSENT_VERSION,
} from "@/lib/cookieConsent";

interface CookieConsentBannerWrapperProps {
  deferInitialPrompt?: boolean;
}

interface CookieConsentDrawerProps {
  privacyUrl: string;
  cookieUrl: string;
  version: string;
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
  const [Drawer, setDrawer] = useState<ComponentType<CookieConsentDrawerProps> | null>(null);

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

  useEffect(() => {
    if (!enabled || Drawer) return undefined;

    let disposed = false;
    void import("@/components/gdpr/CookieConsentDrawer").then((module) => {
      if (!disposed) {
        setDrawer(() => module.CookieConsentDrawer);
      }
    });

    return () => {
      disposed = true;
    };
  }, [Drawer, enabled]);

  if (!enabled || !Drawer) return null;

  return (
    <Drawer
      privacyUrl={l("/privacy-policy")}
      cookieUrl={l("/cookie-policy")}
      version={CURRENT_COOKIE_CONSENT_VERSION}
      deferInitialPrompt={deferInitialPrompt}
    />
  );
}
