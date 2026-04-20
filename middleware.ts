import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/locales";
import { isValidLocale, resolveLocaleFromAcceptLanguage } from "@/lib/i18n/locale-utils";
import { REQUEST_LOCALE_HEADER_NAME } from "@/lib/i18n/route-rules";
import { isMaintenanceIpWhitelisted } from "@/lib/maintenance";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

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
const MAINTENANCE_SETTINGS_CACHE_TTL_MS = 30_000;

type MaintenanceSettingsRow = {
  maintenance_mode: boolean | null;
  maintenance_ip_whitelist: string[] | null;
};

let maintenanceSettingsCache:
  | {
      fetchedAt: number;
      settings: MaintenanceSettingsRow | null;
    }
  | null = null;

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
    if (firstForwarded) {
      return firstForwarded;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return null;
}

async function fetchMaintenanceSettings(): Promise<MaintenanceSettingsRow | null> {
  const now = Date.now();
  if (
    maintenanceSettingsCache
    && now - maintenanceSettingsCache.fetchedAt < MAINTENANCE_SETTINGS_CACHE_TTL_MS
  ) {
    return maintenanceSettingsCache.settings;
  }

  try {
    const { url, anonKey } = getSupabasePublicEnv();
    const endpoint = new URL("/rest/v1/site_settings", url);
    endpoint.searchParams.set("id", "eq.default");
    endpoint.searchParams.set("select", "maintenance_mode,maintenance_ip_whitelist");
    endpoint.searchParams.set("limit", "1");

    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Maintenance settings request failed (${response.status})`);
    }

    const payload = (await response.json()) as MaintenanceSettingsRow[];
    const settings = payload[0] ?? null;
    maintenanceSettingsCache = {
      fetchedAt: now,
      settings,
    };

    return settings;
  } catch (error) {
    // Fall back to most recent cached value if available.
    if (maintenanceSettingsCache) {
      maintenanceSettingsCache = {
        ...maintenanceSettingsCache,
        fetchedAt: now,
      };
      return maintenanceSettingsCache.settings;
    }

    console.error("[middleware] failed to fetch maintenance settings", error);
    return null;
  }
}

function createMiddlewareSupabaseClient(request: NextRequest) {
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Middleware maintenance checks are read-only; session writes are not required here.
      },
    },
  });
}

async function getAuthenticatedRole(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createMiddlewareSupabaseClient(request);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    const { data: roleData, error: roleError } = await supabase.rpc("get_user_role", {
      _user_id: userData.user.id,
    });

    if (roleError || typeof roleData !== "string") {
      return null;
    }

    return roleData;
  } catch {
    return null;
  }
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

function withLocalePrefix(pathname: string, locale: AppLocale) {
  const normalized = normalizePathname(pathname);
  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPathname = normalizePathname(pathname);
  const strippedPathname = stripLocalePrefix(normalizedPathname);

  if (isStaticAsset(normalizedPathname)) {
    return NextResponse.next();
  }

  const maintenanceSettings = await fetchMaintenanceSettings();
  const maintenanceEnabled = maintenanceSettings?.maintenance_mode === true;

  if (maintenanceEnabled && !isMaintenanceBypassPath(normalizedPathname)) {
    const requesterIp = getClientIp(request);
    const ipWhitelisted = isMaintenanceIpWhitelisted(
      requesterIp,
      maintenanceSettings?.maintenance_ip_whitelist,
    );

    if (!ipWhitelisted) {
      const role = await getAuthenticatedRole(request);
      const isPrivilegedUser = role === "admin" || role === "editor";

      if (!isPrivilegedUser) {
        return NextResponse.redirect(new URL("/maintenance", request.url), 307);
      }
    }
  }

  if (strippedPathname === "/maintenance") {
    if (normalizedPathname === "/maintenance") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/maintenance", request.url), 308);
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

    if (strippedPathname === "/pricing") {
      const redirectUrl = new URL(withLocalePrefix("/partner", localeFromPath), request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    if (localeFromPath === DEFAULT_LOCALE) {
      const redirectUrl = new URL(strippedPathname, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    return nextWithRequestLocale(request, localeFromPath);
  }

  if (strippedPathname === "/pricing") {
    const locale = getPreferredLocale(request);
    const redirectUrl = new URL(withLocalePrefix("/partner", locale), request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const locale = getPreferredLocale(request);
  if (locale === DEFAULT_LOCALE) {
    const rewritePath =
      normalizedPathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${normalizedPathname}`;
    return rewriteWithRequestLocale(request, rewritePath, locale);
  }

  return NextResponse.redirect(new URL(withLocalePrefix(normalizedPathname, locale), request.url), 307);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
