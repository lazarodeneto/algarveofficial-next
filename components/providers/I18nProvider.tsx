"use client";

import { useEffect, type ReactNode } from "react";

import i18n, { ensureLocaleLoaded } from "@/i18n";
import { useLocale } from "@/lib/i18n/locale-context";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useLocale() as string;

  useEffect(() => {
    void ensureLocaleLoaded(locale).finally(() => {
      void i18n.changeLanguage(locale);
    });
  }, [locale]);

  return children;
}
