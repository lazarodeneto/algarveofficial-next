import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for locale routing.
 *
 * Responsibilities:
 * 1. Validate locale prefix in URL
 * 2. Redirect bare paths (no locale) → /{detected-locale}/...
 * 3. Sync NEXT_LOCALE cookie on every request
 * 4. Set x-locale header for server components
 */

// Inlined to avoid import issues in edge runtime
const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";
const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

const LOCALE_LANGUAGE_MAP: Record<string, Locale> = {
  en: "en", "en-gb": "en", "en-us": "en",
  pt: "pt-pt", "pt-pt": "pt-pt", "pt-br": "pt-pt",
  fr: "fr", "fr-fr": "fr", "fr-be": "fr",
  de: "de", "de-de": "de", "de-at": "de", "de-ch": "de",
  es: "es", "es-es": "es", "es-mx": "es",
  nl: "nl", "nl-nl": "nl", "nl-be": "nl",
  it: "it", "it-it": "it",
  sv: "sv", "sv-se": "sv",
  no: "no", "nb-no": "no", "nn-no": "no",
  da: "da", "da-dk": "da",
};

function isValidLocale(value: string): value is Locale {
  return LOCALE_SET.has(value);
}

function resolveLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const languages = header
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";q=");
      return { code: code.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (isValidLocale(code)) return code;
    const mapped = LOCALE_LANGUAGE_MAP[code];
    if (mapped) return mapped;
  }

  return DEFAULT_LOCALE;
}

const PUBLIC_FILE_RE = /\.[\w]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internals, API routes, and non-locale routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner") ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sitemap") ||
    PUBLIC_FILE_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Extract first path segment
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0]?.toLowerCase();

  // URL already has a valid locale prefix → sync cookie & continue
  if (maybeLocale && LOCALE_SET.has(maybeLocale)) {
    const locale = maybeLocale as Locale;
    const response = NextResponse.next();

    // Always sync cookie so server components stay consistent
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    response.headers.set("x-locale", locale);

    return response;
  }

  // No locale in URL — detect preferred locale and redirect
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const storedPreference =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : null;

  const browserLocale = resolveLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );

  const targetLocale = storedPreference || browserLocale || DEFAULT_LOCALE;

  // Build redirect URL
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", targetLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
