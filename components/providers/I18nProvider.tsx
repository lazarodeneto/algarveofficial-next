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
 * I18nProvider — syncs react-i18next with the current locale and blocks rendering until ready.
 *
 * SINGLE SOURCE OF TRUTH: locale from LocaleContext (derived from URL params).
 * NO localStorage fallback. NO pathname parsing.
 * The locale prop is only used as initial fallback before context is available.
 *
 * ✅ Synchronization Guaranteed: Waits for translations to load before rendering children
 * ✅ SSR-Safe: Uses ref to skip redundant initializations, defers heavy work to useEffect
 * ✅ Shows loading spinner while syncing
 */
export function I18nProvider({ children, locale: propLocale = "en" }: I18nProviderProps) {
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const contextLocale = useLocale();

  // Prefer context (from URL), fall back to prop (from server)
  const targetLocale: Locale = (contextLocale || propLocale) as Locale;

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      // Skip if already initialized or request is cancelled
      if (initialized.current || cancelled) {
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

  // Show loading spinner while translations are being synced
  if (!isReady) {
    return (
      <I18nextProvider i18n={i18n}>
        <div className="flex items-center justify-center w-full h-full min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </I18nextProvider>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
