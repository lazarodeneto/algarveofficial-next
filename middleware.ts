import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/locales";
import { isValidLocale, resolveLocaleFromAcceptLanguage } from "@/lib/i18n/locale-utils";

const PUBLIC_LOCALES: readonly AppLocale[] = SUPPORTED_LOCALES;
const PUBLIC_LOCALE_SET = new Set<string>(PUBLIC_LOCALES);

function isStaticAsset(pathname: string): boolean {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  
  if (normalized.startsWith("/_next/")) return true;
  if (normalized.startsWith("/api/")) return true;
  if (normalized.startsWith("/images/")) return true;
  if (normalized.startsWith("/icons/")) return true;
  if (normalized.startsWith("/videos/")) return true;
  
  if (/\.[a-z0-9]+$/i.test(normalized)) return true;
  
  return false;
}

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeading !== "/" && withLeading.endsWith("/")) {
    return withLeading.slice(0, -1);
  }
  return withLeading;
}

function isPublicLocale(locale: string | null | undefined): locale is AppLocale {
  if (!locale) return false;
  return PUBLIC_LOCALE_SET.has(locale.toLowerCase());
}

function getPreferredLocale(request: NextRequest): AppLocale {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (isPublicLocale(cookieLocale)) {
    return cookieLocale;
  }

  const preferredFromHeader = resolveLocaleFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  if (isPublicLocale(preferredFromHeader)) {
    return preferredFromHeader;
  }

  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPathname = normalizePathname(pathname);

  if (isStaticAsset(normalizedPathname)) {
    return NextResponse.next();
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const localeFromPath = firstSegment && isValidLocale(firstSegment)
    ? firstSegment
    : null;

  if (localeFromPath) {
    if (!isPublicLocale(localeFromPath)) {
      const remainingPath = segments.slice(1).join("/");
      const destination = remainingPath
        ? `/${DEFAULT_LOCALE}/${remainingPath}`
        : `/${DEFAULT_LOCALE}`;
      return NextResponse.redirect(new URL(destination, request.url), 308);
    }
    return NextResponse.next();
  }

  if (normalizedPathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url), 302);
  }

  const locale = getPreferredLocale(request);
  return NextResponse.redirect(new URL(`/${locale}${normalizedPathname}`, request.url), 308);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
