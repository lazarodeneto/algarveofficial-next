/**
 * @deprecated Import directly from "@/lib/i18n/config" instead.
 * This file exists only for backward compatibility.
 */
import { isValidLocale } from "./config";

export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  getLocaleFromPathname,
  getLocaleFromParam,
  toHtmlLang,
  type Locale,
} from "./config";

/** @deprecated Use isValidLocale from config instead */
export function isSupportedLocalePrefix(lang: string): boolean {
  return isValidLocale(lang);
}
