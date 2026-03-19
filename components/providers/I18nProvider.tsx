"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { usePathname } from "next/navigation";

import i18n, { ensureLocaleLoaded, initI18n } from "@/i18n";
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/locales";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export function I18nProvider({
  children,
  locale = "en",
}: I18nProviderProps) {
  const initialized = useRef(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      if (!initialized.current) {
        await initI18n();
        initialized.current = true;
      }

      const routeLocale = getLocaleFromPathname(pathname);
      const storedLocale =
        typeof window !== "undefined" ? window.localStorage.getItem("algarve-language") : null;
      const targetLocale: Locale =
        routeLocale !== DEFAULT_LOCALE
          ? routeLocale
          : storedLocale && isValidLocale(storedLocale)
            ? storedLocale
            : ((locale as Locale) ?? DEFAULT_LOCALE);

      await ensureLocaleLoaded(targetLocale);

      if (!cancelled && i18n.language !== targetLocale) {
        await i18n.changeLanguage(targetLocale);
      }
    };

    void syncI18n();

    return () => {
      cancelled = true;
    };
  }, [locale, pathname]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
