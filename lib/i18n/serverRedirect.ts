import { cookies, headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import {
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/route-rules";
import {
  getLocaleFromPathname,
  hasLocalePrefix,
  isValidLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/locale-utils";

interface LocaleRedirectOptions {
  localeHint?: string | null;
  requestedPath?: string | null;
}

type SearchParamsShape =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getFirstSearchParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toUrlSearchParams(searchParams: SearchParamsShape): URLSearchParams {
  if (searchParams instanceof URLSearchParams) {
    return new URLSearchParams(searchParams);
  }

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          params.append(key, item);
        }
      });
      return;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  });
  return params;
}

function getLocaleFromRequestedPath(requestedPath?: string | null): Locale | null {
  if (!requestedPath || !requestedPath.startsWith("/")) {
    return null;
  }

  if (!hasLocalePrefix(requestedPath)) {
    return null;
  }

  return getLocaleFromPathname(requestedPath);
}

export async function getPreferredLocaleForServerRedirect(
  options?: LocaleRedirectOptions,
): Promise<Locale> {
  const requestedPathLocale = getLocaleFromRequestedPath(options?.requestedPath);
  if (requestedPathLocale) {
    return requestedPathLocale;
  }

  if (isValidLocale(options?.localeHint)) {
    return options.localeHint;
  }

  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value?.toLowerCase();

  if (isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = headerStore.get("accept-language");
  return resolveLocaleFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

export async function redirectToPreferredLocalePath(
  pathname: string,
  options?: LocaleRedirectOptions,
): Promise<never> {
  const locale = await getPreferredLocaleForServerRedirect(options);
  const normalizedPath =
    pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;

  permanentRedirect(`/${locale}${normalizedPath}`);
}

export async function redirectUnlocalizedAliasPath(
  pathname: string,
  searchParams: SearchParamsShape,
): Promise<never> {
  const params = toUrlSearchParams(searchParams);
  const requestedPath = params.get("next") ?? params.get("from");
  const localeHint = params.get("locale");
  const locale = await getPreferredLocaleForServerRedirect({
    requestedPath,
    localeHint,
  });
  const targetPath = buildLocalizedPath(locale, pathname);
  const query = params.toString();

  permanentRedirect(query ? `${targetPath}?${query}` : targetPath);
}
