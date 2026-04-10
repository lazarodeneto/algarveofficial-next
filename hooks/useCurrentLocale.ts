"use client";

import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  isValidLocale,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n/routing";

export function useCurrentLocale(): AppLocale {
  const contextLocale = useLocale();

  if (contextLocale) {
    return contextLocale;
  }

  const params = useParams();
  const paramLocale =
    typeof params?.locale === "string" ? params.locale : undefined;

  return isValidLocale(paramLocale)
    ? paramLocale
    : normalizeLocale(undefined);
}
