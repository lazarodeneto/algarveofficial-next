import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Tracking-only query parameters that should be stripped via redirect.
// We only redirect when ALL remaining params are tracking params (i.e. no
// functional params survive stripping), to avoid breaking ?category= filters.
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "msclkid", "mc_cid", "mc_eid", "ref", "ttclid",
]);

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

  // Skip internal Next.js, API routes, and static assets.
  // Note: /favicon.ico is redundant here — it contains "." and is caught above.
  // Note: /admin, /owner, /dashboard, /auth, /maintenance are excluded via the
  // matcher below so they never reach this function.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── 0. Strip tracking-only query params ──────────────────────────────────
  // Redirect to the clean URL when every query param is a known tracking param.
  // Preserves functional params (e.g. ?category=... on /directory).
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.size > 0) {
    const hasNonTracking = Array.from(searchParams.keys()).some(
      (k) => !TRACKING_PARAMS.has(k),
    );
    if (!hasNonTracking) {
      const url = request.nextUrl.clone();
      url.search = "";
      return NextResponse.redirect(url, 301);
    }
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

  // ── 5. Pass locale to RootLayout via request header ───────────────────────
  // Set x-locale on the INCOMING request headers so server components can read
  // it via `headers()`. Setting it on response headers (response.headers.set)
  // sends it to the browser but NOT to the server component tree.
  const localeFromUrl =
    segments.length >= 1 && isLocale(segments[0])
      ? (segments[0].toLowerCase() as SupportedLocale)
      : "en";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", localeFromUrl);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  // Exclude: Next.js internals, API routes, static assets (any path with a "."),
  // and internal tool paths that are intentionally unlocalized and never need
  // redirects or locale detection.
  matcher: [
    "/((?!_next|api|admin|owner|dashboard|auth|maintenance|.*\\..*).*)",
  ],
};
