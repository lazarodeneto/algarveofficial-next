"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { ensureLocaleLoaded, initI18n } from "@/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

/**
 * I18nProvider — syncs react-i18next with the current locale without
 * replacing already server-rendered content with a fullscreen loader.
 *
 * SINGLE SOURCE OF TRUTH: locale from LocaleContext (derived from URL params).
 * NO localStorage fallback. NO pathname parsing.
 * The locale prop is only used as initial fallback before context is available.
 *
 * ✅ Synchronization Guaranteed: Keeps client i18n in sync with the route locale
 * ✅ SSR-Safe: Uses ref to skip redundant initializations, defers heavy work to useEffect
 * ✅ No fullscreen flash over server-rendered content while syncing
 */
export function I18nProvider({ children, locale: propLocale = "en" }: I18nProviderProps) {
  const initialized = useRef(false);
  const contextLocale = useLocale();

  // Prefer context (from URL), fall back to prop (from server)
  const targetLocale: Locale = (contextLocale || propLocale) as Locale;
  const [isReady, setIsReady] = useState(() => i18n.language === targetLocale);

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      if (cancelled) {
        return;
      }

      // Initialize i18n once on client
      if (!initialized.current) {
        try {
          await initI18n();
          initialized.current = true;
        } catch {
          // Fail silently - i18n will use fallback
          initialized.current = true;
        }
      }

      if (!cancelled && i18n.language !== targetLocale) {
        setIsReady(false);
      }

      // Ensure locale resources are loaded
      if (!cancelled) {
        try {
          await ensureLocaleLoaded(targetLocale);
        } catch {
          // Fail silently - use available translations
        }
      }

      // Change language if needed
      if (!cancelled && i18n.language !== targetLocale) {
        try {
          await i18n.changeLanguage(targetLocale);
        } catch {
          // Fail silently - use fallback
        }
      }

      // Mark as ready - always set ready to true to avoid blocking indefinitely
      if (!cancelled) {
        setIsReady(true);
      }
    };

    // Start async sync
    void syncI18n();

    return () => {
      cancelled = true;
    };
  }, [targetLocale]);

  return (
    <I18nextProvider i18n={i18n}>
      <div
        className="contents"
        data-i18n-loading={isReady ? undefined : "true"}
      >
        {children}
      </div>
    </I18nextProvider>
  );
}
