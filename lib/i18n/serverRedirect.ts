import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEFAULT_LOCALE,
  type Locale,
  isValidLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";

export async function getPreferredLocaleForServerRedirect(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value?.toLowerCase();

  if (isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = headerStore.get("accept-language");
  return resolveLocaleFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

export async function redirectToPreferredLocalePath(pathname: string): Promise<never> {
  const locale = await getPreferredLocaleForServerRedirect();
  const normalizedPath =
    pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;

  redirect(`/${locale}${normalizedPath}`);
}
