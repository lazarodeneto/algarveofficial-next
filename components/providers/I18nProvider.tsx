"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { ensureLocaleLoaded, initI18n } from "@/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

/**
 * I18nProvider — syncs react-i18next with the current locale.
 *
 * SINGLE SOURCE OF TRUTH: locale from LocaleContext (derived from URL params).
 * NO localStorage fallback. NO pathname parsing.
 * The locale prop is only used as initial fallback before context is available.
 */
export function I18nProvider({ children, locale: propLocale = "en" }: I18nProviderProps) {
  const initialized = useRef(false);
  const contextLocale = useLocale();

  // Prefer context (from URL), fall back to prop (from server)
  const targetLocale: Locale = (contextLocale || propLocale) as Locale;

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      if (!initialized.current) {
        await initI18n();
        initialized.current = true;
      }

      await ensureLocaleLoaded(targetLocale);

      if (!cancelled && i18n.language !== targetLocale) {
        await i18n.changeLanguage(targetLocale);
      }
    };

    void syncI18n();

    return () => {
      cancelled = true;
    };
  }, [targetLocale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
