/**
 * middleware.ts — Root-level locale enforcement for Next.js App Router
 *
 * Ensures every public page request carries a locale prefix in the URL.
 *
 * Flow:
 *  1. Skip static assets, API routes, auth, admin, owner, dashboard
 *  2. If URL already has a valid locale prefix → pass through (refresh Supabase session)
 *  3. If URL has NO locale prefix → detect preferred locale → redirect to /{locale}/path
 *
 * Locale detection priority:
 *  1. NEXT_LOCALE cookie (user's explicit choice via language switcher)
 *  2. Accept-Language header (browser preference)
 *  3. DEFAULT_LOCALE ("en")
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/config";

// ─── Constants ──────────────────────────────────────────────────────────────

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

/** Prefixes that should NEVER get a locale redirect */
const BYPASS_PREFIXES = [
  "/api",
  "/auth",
  "/admin",
  "/owner",
  "/dashboard",
  "/login",
  "/signup",
  "/forgot-password",
  "/maintenance",
  "/_next",
  "/_vercel",
  "/favicon",
  "/manifest",
];

/** File extensions that indicate static assets */
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|eot|css|js|map|json|xml|txt|webmanifest|pdf)$/i;

// ─── Locale detection ───────────────────────────────────────────────────────

/**
 * Simple mapping from broad Accept-Language codes to our supported locales.
 */
const ACCEPT_LANGUAGE_MAP: Record<string, Locale> = {
  en: "en",
  "en-gb": "en",
  "en-us": "en",
  pt: "pt-pt",
  "pt-pt": "pt-pt",
  "pt-br": "pt-pt",
  fr: "fr",
  "fr-fr": "fr",
  "fr-be": "fr",
  de: "de",
  "de-de": "de",
  "de-at": "de",
  "de-ch": "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  it: "it",
  "it-it": "it",
  nl: "nl",
  "nl-nl": "nl",
  "nl-be": "nl",
  sv: "sv",
  "sv-se": "sv",
  no: "no",
  nb: "no",
  "nb-no": "no",
  nn: "no",
  "nn-no": "no",
  da: "da",
  "da-dk": "da",
};

function detectLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const languages = header
    .split(",")
    .map((entry) => {
      const [code, qPart] = entry.trim().split(";q=");
      return { code: code.trim().toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    // Exact match
    const direct = ACCEPT_LANGUAGE_MAP[code];
    if (direct) return direct;

    // Try base language (e.g. "en-au" → "en")
    const base = code.split("-")[0];
    const baseMatch = ACCEPT_LANGUAGE_MAP[base];
    if (baseMatch) return baseMatch;
  }

  return null;
}

function detectPreferredLocale(request: NextRequest): Locale {
  // 1. Cookie — explicit user choice from language switcher
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (cookieLocale && LOCALE_SET.has(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  const detected = detectLocaleFromAcceptLanguage(acceptLang);
  if (detected) return detected;

  // 3. Default
  return DEFAULT_LOCALE;
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and file extensions
  if (STATIC_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  // Skip bypass prefixes (API, auth, admin, _next, etc.)
  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return updateSession(request);
  }

  // Check if the URL already starts with a valid locale
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && LOCALE_SET.has(firstSegment)) {
    // Already has locale → pass through, but set x-locale header for downstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", firstSegment);
    return updateSession(request, requestHeaders);
  }

  // ─── No locale prefix → redirect to /{locale}/path ────────────────────────

  const preferredLocale = detectPreferredLocale(request);

  const url = request.nextUrl.clone();
  // Build new path: /{locale}{pathname}
  url.pathname = pathname === "/" ? `/${preferredLocale}` : `/${preferredLocale}${pathname}`;

  // Use 307 (temporary) redirect — preserves method and allows search engines
  // to understand this is a locale redirect, not a permanent move
  return NextResponse.redirect(url, 307);
}

// ─── Matcher ────────────────────────────────────────────────────────────────
// Run on all paths EXCEPT static files, _next internals, and API routes.
// The middleware function itself has additional skip logic for safety.

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap*, manifest.json
     * - Static file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|manifest\\.json|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|eot|css|js|map)).*)",
  ],
};
