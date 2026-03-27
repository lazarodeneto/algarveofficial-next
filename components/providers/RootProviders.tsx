"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";

import { AppProviders } from "./AppProviders";

interface RootProvidersProps {
  children: ReactNode;
}

export function RootProviders({ children }: RootProvidersProps) {
  const params = useParams();
  const paramLocale =
    typeof params?.locale === "string" && isValidLocale(params.locale)
      ? (params.locale as Locale)
      : null;

  if (paramLocale) {
    return <>{children}</>;
  }

  return (
    <LocaleProvider locale={DEFAULT_LOCALE}>
      <AppProviders locale={DEFAULT_LOCALE}>{children}</AppProviders>
    </LocaleProvider>
  );
}
