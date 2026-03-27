"use client";

import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { buildLocalizedPath } from "@/lib/i18n/routing";

export function useLocalePath() {
  const locale = useCurrentLocale();

  return (href: string) => buildLocalizedPath(locale, href);
}
