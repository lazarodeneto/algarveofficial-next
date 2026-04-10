import { headers } from "next/headers";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { REQUEST_LOCALE_HEADER_NAME } from "@/lib/i18n/route-rules";

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get(REQUEST_LOCALE_HEADER_NAME);

  return isValidLocale(requestLocale) ? requestLocale : DEFAULT_LOCALE;
}
