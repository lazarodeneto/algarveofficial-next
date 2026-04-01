"use client";

import { useEffect, useRef, useState } from "react";
import { Cookie } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { stripLocaleFromPathname } from "@/lib/i18n/config";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  getStoredCookieConsent,
  openCookiePreferences,
} from "@/lib/cookieConsent";

const HIDDEN_ROUTE_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function FloatingCookieSettingsButton() {
  const pathname = usePathname() || "/";
  const { t } = useTranslation();
  const mounted = useHydrated();
  const [hasConsent, setHasConsent] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const barePath = stripLocaleFromPathname(pathname);
  const shouldHide = HIDDEN_ROUTE_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsUserScrolling(false);
      }, 180);
    };

    const scrollTarget = document.documentElement;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const syncConsentState = () => {
      setHasConsent(Boolean(getStoredCookieConsent()));
    };

    syncConsentState();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsentState);
    window.addEventListener("storage", syncConsentState);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsentState);
      window.removeEventListener("storage", syncConsentState);
    };
  }, [mounted]);

  if (!mounted || shouldHide || !hasConsent) {
    return null;
  }

  const label = t("footer.cookieSettings", "Cookie Settings");

  return (
    <div className={`pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-4 z-40 lg:left-6 transition-transform duration-200 ease-out ${
      isUserScrolling ? "translate-y-[calc(100%+env(safe-area-inset-bottom))]" : ""
    }`}>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] transition-all hover:scale-[1.03] hover:bg-white/30 dark:hover:bg-white/15"
        aria-label={label}
        title={label}
      >
        <Cookie className="relative z-10 h-7 w-7 text-white drop-shadow-md" />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
