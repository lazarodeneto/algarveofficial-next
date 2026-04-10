"use client";

import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import type {
  LocalizedPathInput,
  LocalizedRouteOptions,
} from "@/lib/i18n/localized-routing";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";

export function useLocalePath() {
  const locale = useCurrentLocale();

  return (href: LocalizedPathInput, options?: LocalizedRouteOptions) =>
    buildLocalizedPath(locale, href, options);
}
