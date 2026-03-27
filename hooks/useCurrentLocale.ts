"use client";

import { useParams, usePathname } from "next/navigation";
import {
  getLocaleFromPathnameSafe,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n/routing";

export function useCurrentLocale(): AppLocale {
  const params = useParams();
  const pathname = usePathname();

  const paramLocale =
    typeof params?.locale === "string" ? params.locale : undefined;

  if (paramLocale) {
    return normalizeLocale(paramLocale);
  }

  return getLocaleFromPathnameSafe(pathname || "/");
}
