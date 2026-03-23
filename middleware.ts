import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
const DEFAULT_LOCALE = "en";

const CANONICAL_CATEGORY_SLUGS = [
  "restaurants", "places-to-stay", "golf", "things-to-do",
  "beaches-clubs", "wellness-spas", "whats-on", "algarve-services", "shopping-boutiques",
  "restaurantes", "alojamento", "golfe", "atividades", "praias",
  "bem-estar", "eventos", "servicos", "compras",
];

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as typeof SUPPORTED_LOCALES[number])) {
    return cookieLocale;
  }

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0].toLowerCase();
    const match = SUPPORTED_LOCALES.find((l) =>
      preferred.startsWith(l)
    );
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "HEAD") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasFileExtension = /\.[^/]+$/.test(pathname);
  if (hasFileExtension) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname.startsWith("/directory") || pathname.startsWith("/destinations") || pathname.startsWith("/blog") || pathname.startsWith("/events")) {
    const locale = getLocale(request);
    if (locale === DEFAULT_LOCALE) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 3) {
    const [locale, segment1, segment2] = segments;

    if (SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])) {
      const isSegment1Category = CANONICAL_CATEGORY_SLUGS.some(
        (cat) => segment1.toLowerCase() === cat.toLowerCase()
      );

      if (isSegment1Category) {
        const url = request.nextUrl.clone();
        url.pathname = locale === DEFAULT_LOCALE
          ? `/${segment2}/${segment1}`
          : `/${locale}/${segment2}/${segment1}`;
        return NextResponse.redirect(url, 301);
      }

      if (locale !== DEFAULT_LOCALE) {
        const trailingSlash = pathname.endsWith("/") && pathname !== "/";
        if (trailingSlash) {
          const url = request.nextUrl.clone();
          url.pathname = pathname.slice(0, -1);
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }
    }
  }

  if (pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/en", "") || "/";
    return NextResponse.redirect(url, 301);
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) =>
      locale !== DEFAULT_LOCALE &&
      (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
  );

  if (pathnameHasLocale) {
    const trailingSlash = pathname.endsWith("/") && pathname !== "/";
    if (trailingSlash) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(0, -1);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const trailingSlash = pathname.endsWith("/") && pathname !== "/";
  if (trailingSlash) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};