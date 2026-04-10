export {
  DEFAULT_LOCALE,
  LOCALE_CONFIGS,
  LOCALE_LANGUAGE_MAP,
  LOCALE_PREFIX_PATTERN,
  LOCALE_PREFIX_REGEX,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale-definitions";

export {
  addLocaleToPathname,
  getLocaleFromParam,
  getLocaleFromPathname,
  getLocaleFromPathnameSafe,
  hasLocalePrefix,
  isValidLocale,
  normalizeLocale,
  resolveLocaleFromAcceptLanguage,
  stripLocaleFromPathname,
  toHtmlLang,
} from "@/lib/i18n/locale-utils";

import {
  LOCALE_CONFIGS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale-definitions";
import { addLocaleToPathname } from "@/lib/i18n/locale-utils";

export function buildLocaleAlternates(
  basePath: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

  for (const locale of SUPPORTED_LOCALES) {
    const localizedPath = addLocaleToPathname(basePath, locale as Locale);
    result[LOCALE_CONFIGS[locale].hreflang] = `${siteUrl}${localizedPath}`;
  }

  return result;
}
