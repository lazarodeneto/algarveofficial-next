/**
 * @deprecated Use `createLocalizedHref` from "@/lib/i18n/navigation" and
 * `<LocalizedLink>` from "@/components/navigation/LocalizedLink" instead.
 *
 * This file is kept for backward compatibility during migration.
 */

import { getLocaleFromPathname, type Locale } from "@/lib/i18n/config";
import { createLocalizedHref } from "@/lib/i18n/navigation";

export function extractLocaleFromPath(pathname: string): string {
  return getLocaleFromPathname(pathname);
}

export function localizeHref(pathname: string, href: string): string {
  const locale = getLocaleFromPathname(pathname) as Locale;
  return createLocalizedHref(href, locale);
}
