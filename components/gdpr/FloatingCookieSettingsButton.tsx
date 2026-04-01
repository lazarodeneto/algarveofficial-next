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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
    <div className={`pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-4 z-40 lg:left-6 transition-transform duration-200 ease-out backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 rounded-full p-0 ${
      isUserScrolling ? "translate-y-[calc(100%+env(safe-area-inset-bottom))]" : ""
    }`}>
      <button
        type="button"
        onClick={openCookiePreferences}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_38px_-18px_rgba(15,23,42,0.55)] transition-all hover:scale-[1.03] hover:shadow-[0_22px_46px_-18px_rgba(15,23,42,0.6)]"
        aria-label={label}
        title={label}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none" />
        <span className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
        <Cookie className="relative z-10 h-7 w-7 drop-shadow-sm" />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
