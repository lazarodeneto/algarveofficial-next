import type { Locale } from "@/lib/i18n/config";
import {
  getLocaleFromPathname,
  hasLocalePrefix,
  isValidLocale,
  normalizeLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n/locale-utils";
import { shouldBypassLocalePrefix } from "@/lib/i18n/route-rules";
import {
  buildLocalizedPath,
  getDefaultLocale,
  isPassthroughHref,
  switchLocaleInPathname,
  type AppLocale,
} from "@/lib/i18n/localized-routing";

export { hasLocalePrefix, isValidLocale, normalizeLocale, shouldBypassLocalePrefix, stripLocaleFromPathname };
export const getLocaleFromPathnameSafe = getLocaleFromPathname;
export { buildLocalizedPath, getDefaultLocale, isPassthroughHref, switchLocaleInPathname };

export type { AppLocale, Locale };
