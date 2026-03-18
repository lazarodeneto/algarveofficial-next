"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { ensureLocaleLoaded, initI18n } from "@/i18n";

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export function I18nProvider({
  children,
  locale = "en",
}: I18nProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const syncI18n = async () => {
      if (!initialized.current) {
        await initI18n();
        initialized.current = true;
      }

      await ensureLocaleLoaded(locale);

      if (!cancelled && i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }
    };

    void syncI18n();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
