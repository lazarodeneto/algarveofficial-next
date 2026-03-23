import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;

const CANONICAL_CATEGORY_SLUGS = [
  "restaurants", "places-to-stay", "golf", "things-to-do",
  "beaches-clubs", "wellness-spas", "whats-on", "algarve-services", "shopping-boutiques",
  "restaurantes", "alojamento", "golfe", "atividades", "praias",
  "bem-estar", "eventos", "servicos", "compras",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (
    segments.length === 3 &&
    SUPPORTED_LOCALES.includes(segments[0] as typeof SUPPORTED_LOCALES[number])
  ) {
    const [locale, a, b] = segments;
    if (CANONICAL_CATEGORY_SLUGS.includes(a)) {
      const url = request.nextUrl.clone();
      url.pathname = locale === "en" ? `/${b}/${a}` : `/${locale}/${b}/${a}`;
      return NextResponse.redirect(url, 301);
    }
  }

  if (pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/en", "") || "/";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)",],
};
