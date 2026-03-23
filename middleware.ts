import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// All known category slugs in every language — used to detect old /category/city URL format
const CANONICAL_CATEGORY_SLUGS = new Set([
  "restaurants", "places-to-stay", "golf", "things-to-do",
  "beaches-clubs", "wellness-spas", "whats-on", "algarve-services", "shopping-boutiques",
  "restaurantes", "alojamento", "golfe", "atividades", "praias",
  "bem-estar", "eventos", "servicos", "compras",
]);

function isLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value.toLowerCase() as SupportedLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js, API routes, and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  // ── 1. Normalize locale casing: /PT-PT/... → /pt-pt/... ──────────────────
  // Must run before any other locale check to avoid case-sensitive 404s.
  if (segments.length >= 1) {
    const first = segments[0];
    const lower = first.toLowerCase();
    if (first !== lower && isLocale(lower)) {
      const url = request.nextUrl.clone();
      url.pathname = "/" + [lower, ...segments.slice(1)].join("/");
      return NextResponse.redirect(url, 301);
    }
  }

  // ── 2. Strip legacy /en/ prefix ──────────────────────────────────────────
  if (pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/"; // remove "/en", keep leading "/"
    return NextResponse.redirect(url, 301);
  }

  // ── 3. Old URL format: /[locale]/[category]/[city] → /[locale]/[city]/[category] ──
  // Example: /pt-pt/restaurantes/lagos → /pt-pt/lagos/restaurantes
  if (
    segments.length === 3 &&
    isLocale(segments[0]) &&
    CANONICAL_CATEGORY_SLUGS.has(segments[1])
  ) {
    const [locale, category, city] = segments;
    const url = request.nextUrl.clone();
    url.pathname = locale === "en" ? `/${city}/${category}` : `/${locale}/${city}/${category}`;
    return NextResponse.redirect(url, 301);
  }

  // ── 4. Old URL format WITHOUT locale: /[category]/[city] → /[city]/[category] ──
  // Example: /restaurants/lagos → /lagos/restaurants
  if (
    segments.length === 2 &&
    CANONICAL_CATEGORY_SLUGS.has(segments[0])
  ) {
    const [category, city] = segments;
    const url = request.nextUrl.clone();
    url.pathname = `/${city}/${category}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)",],
};
