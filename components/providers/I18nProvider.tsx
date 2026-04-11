"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import baseI18n, { ensureLocaleLoaded } from "@/i18n";
import { useLocale } from "@/lib/i18n/locale-context";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useLocale() as string;
  const i18n = useMemo(
    () => {
      const instance = baseI18n.cloneInstance({
        lng: locale,
        fallbackLng: false,
      });
      const bundle = baseI18n.getResourceBundle(locale, "translation");
      if (bundle) {
        instance.addResourceBundle(locale, "translation", bundle, true, true);
      }
      return instance;
    },
    [locale],
  );

  useEffect(() => {
    void ensureLocaleLoaded(locale).finally(() => {
      const bundle = baseI18n.getResourceBundle(locale, "translation");
      if (bundle) {
        i18n.addResourceBundle(locale, "translation", bundle, true, true);
      }
      void i18n.changeLanguage(locale);
    });
  }, [i18n, locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
