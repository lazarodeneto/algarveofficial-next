import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { getLocaleFromPathname, hasLocalePrefix, isValidLocale } from "@/lib/i18n/locale-utils";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const PUBLIC_LOCALES = ["en", "pt-pt"];

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

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, q] = lang.trim().split(";q=");
        return { code: code.trim().toLowerCase(), q: q ? Number.parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { code } of languages) {
      if (SUPPORTED_LOCALES.includes(code as typeof SUPPORTED_LOCALES[number])) {
        return code;
      }
    }
  }

  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPathname = normalizePathname(pathname);

  if (isStaticAsset(normalizedPathname)) {
    return NextResponse.next();
  }

  const hasLocale = hasLocalePrefix(normalizedPathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (hasLocale) {
    if (!PUBLIC_LOCALES.includes(firstSegment ?? "")) {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${normalizedPathname}`, request.url), 308);
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

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  const { url, anonKey } = getSupabasePublicEnv();
  let response = NextResponse.next({
    request: {
      headers: requestHeaders ?? request.headers,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: requestHeaders ?? request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}