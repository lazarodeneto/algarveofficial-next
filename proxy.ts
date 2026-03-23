import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

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

function redirectOldCategoryCityStructure(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 3) {
    const [locale, segment1, segment2] = segments;

    if (SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])) {
      const isSegment1Category = CANONICAL_CATEGORY_SLUGS.some(
        (cat) => segment1.toLowerCase() === cat.toLowerCase()
      );
      const isSegment2Category = CANONICAL_CATEGORY_SLUGS.some(
        (cat) => segment2.toLowerCase() === cat.toLowerCase()
      );

      if (isSegment1Category && !isSegment2Category) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/${segment2}/${segment1}`;
        return NextResponse.redirect(url, 301);
      }
    }
  }

  return null;
}

function normalizeTrailingSlash(pathname: string): string | null {
  if (pathname.endsWith("/") && pathname !== "/") {
    return pathname.slice(0, -1);
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. Old URL structure redirect: /{locale}/{category}/{city} -> /{locale}/{city}/{category}
  const oldStructureRedirect = redirectOldCategoryCityStructure(request);
  if (oldStructureRedirect) {
    return oldStructureRedirect;
  }

  // 2. Strip default locale prefix: /en/... -> /...
  if (pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    const newPath = pathname.replace("/en", "") || "/";
    const trailingSlash = normalizeTrailingSlash(newPath);
    if (trailingSlash) {
      url.pathname = trailingSlash;
    } else {
      url.pathname = newPath;
    }
    return NextResponse.redirect(url, 301);
  }

  // 3. Check if path has non-default locale prefix
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) =>
      locale !== DEFAULT_LOCALE &&
      (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
  );

  if (pathnameHasLocale) {
    // Normalize trailing slash if present
    const trailingSlash = normalizeTrailingSlash(pathname);
    if (trailingSlash) {
      const url = request.nextUrl.clone();
      url.pathname = trailingSlash;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. No locale prefix - detect locale and redirect
  const locale = getLocale(request);

  if (locale === DEFAULT_LOCALE) {
    // Normalize trailing slash for default locale
    const trailingSlash = normalizeTrailingSlash(pathname);
    if (trailingSlash) {
      const url = request.nextUrl.clone();
      url.pathname = trailingSlash;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 5. Redirect to non-default locale with trailing slash normalized
  let newPathname = `/${locale}${pathname}`;
  const trailingSlash = normalizeTrailingSlash(newPathname);
  if (trailingSlash) {
    newPathname = trailingSlash;
  }

  const url = request.nextUrl.clone();
  url.pathname = newPathname;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|images|fonts).*)",
  ],
};