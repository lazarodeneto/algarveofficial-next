"use client";

import { useEffect, useState } from "react";
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

  const barePath = stripLocaleFromPathname(pathname);
  const shouldHide = HIDDEN_ROUTE_PREFIXES.some((prefix) => barePath.startsWith(prefix));

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
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] left-4 z-40 sm:bottom-5 sm:left-5 xl:left-24">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="pointer-events-auto h-12 w-12 rounded-full border border-[#C7A35A]/35 bg-white/96 text-[#C7A35A] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl hover:border-[#C7A35A]/55 hover:bg-white hover:text-[#A17618] dark:border-white/16 dark:bg-[hsl(var(--background)/0.94)] dark:text-primary dark:hover:border-primary/40 dark:hover:bg-[hsl(var(--background))]"
        aria-label={label}
        title={`${label} · GDPR`}
        onClick={openCookiePreferences}
      >
        <Cookie className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </Button>
    </div>
  );
}
