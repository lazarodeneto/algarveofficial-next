import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/locales";
import { isValidLocale, resolveLocaleFromAcceptLanguage } from "@/lib/i18n/locale-utils";
import { REQUEST_LOCALE_HEADER_NAME } from "@/lib/i18n/route-rules";
import { isMaintenanceIpWhitelisted } from "@/lib/maintenance";

const PUBLIC_LOCALES: readonly AppLocale[] = SUPPORTED_LOCALES;
const PUBLIC_LOCALE_SET = new Set<string>(PUBLIC_LOCALES);

const MAINTENANCE_BYPASS_ROUTES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/maintenance",
]);
const MAINTENANCE_ENABLED = process.env.MAINTENANCE_MODE?.trim().toLowerCase() === "true";
const MAINTENANCE_WHITELIST = process.env.MAINTENANCE_IP_WHITELIST
  ?.split(",")
  .map((value) => value.trim())
  .filter(Boolean) ?? null;

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (withLeadingSlash !== "/" && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && isValidLocale(firstSegment)) {
    const stripped = segments.slice(1).join("/");
    return stripped ? `/${stripped}` : "/";
  }

  return normalized;
}

function isMaintenanceBypassPath(pathname: string): boolean {
  const normalized = stripLocalePrefix(pathname);

  if (normalized.startsWith("/admin")) {
    return true;
  }

  return MAINTENANCE_BYPASS_ROUTES.has(normalized);
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwarded = forwardedFor.split(",")[0]?.trim();
    if (firstForwarded) return firstForwarded;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return null;
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

function nextWithRequestLocale(request: NextRequest, locale: AppLocale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LOCALE_HEADER_NAME, locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function rewriteWithRequestLocale(
  request: NextRequest,
  rewritePathname: string,
  locale: AppLocale,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LOCALE_HEADER_NAME, locale);

  const rewriteUrl = new URL(rewritePathname, request.url);
  rewriteUrl.search = request.nextUrl.search;

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

function withLocalePrefix(pathname: string, locale: AppLocale): string {
  const normalized = normalizePathname(pathname);

  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const normalizedPathname = normalizePathname(pathname);
  const strippedPathname = stripLocalePrefix(normalizedPathname);

  if (MAINTENANCE_ENABLED && !isMaintenanceBypassPath(normalizedPathname)) {
    const requesterIp = getClientIp(request);
    const ipWhitelisted = isMaintenanceIpWhitelisted(requesterIp, MAINTENANCE_WHITELIST);
    if (!ipWhitelisted) {
      return NextResponse.redirect(new URL("/maintenance", request.url), 307);
    }
  }

  // Garantir /maintenance sem prefixo de locale
  if (strippedPathname === "/maintenance") {
    if (normalizedPathname === "/maintenance") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/maintenance", request.url), 308);
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const localeFromPath =
    firstSegment && isValidLocale(firstSegment) ? (firstSegment as AppLocale) : null;

  // Requests com locale explícito no path
  if (localeFromPath) {
    // Locale inválido ou não público -> fallback para default
    if (!isPublicLocale(localeFromPath)) {
      const remainingPath = segments.slice(1).join("/");
      const destination = remainingPath
        ? `/${DEFAULT_LOCALE}/${remainingPath}`
        : `/${DEFAULT_LOCALE}`;

      return NextResponse.redirect(new URL(destination, request.url), 308);
    }

    // /{locale}/pricing -> /{locale}/partner
    if (strippedPathname === "/pricing") {
      const redirectUrl = new URL(withLocalePrefix("/partner", localeFromPath), request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    // Default locale não deve aparecer com prefixo
    if (localeFromPath === DEFAULT_LOCALE) {
      const redirectUrl = new URL(strippedPathname, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    return nextWithRequestLocale(request, localeFromPath);
  }

  // /pricing sem locale -> /partner com locale preferido
  if (strippedPathname === "/pricing") {
    const locale = getPreferredLocale(request);
    const redirectUrl = new URL(withLocalePrefix("/partner", locale), request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Paths sem locale explícito
  const locale = getPreferredLocale(request);

  // Default locale sem prefixo: reescreve internamente
  if (locale === DEFAULT_LOCALE) {
    const rewritePath =
      normalizedPathname === "/"
        ? `/${DEFAULT_LOCALE}`
        : `/${DEFAULT_LOCALE}${normalizedPathname}`;

    return rewriteWithRequestLocale(request, rewritePath, locale);
  }

  // Outros locales: redirect para path prefixado
  return NextResponse.redirect(
    new URL(withLocalePrefix(normalizedPathname, locale), request.url),
    307,
  );
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|images|icons|videos|.*\\..*$).*)",
  ],
};
