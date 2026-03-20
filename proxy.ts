import { NextRequest, NextResponse } from "next/server";

import { isMaintenanceIpWhitelisted } from "@/lib/maintenance";
import { updateSession } from "@/lib/supabase/middleware";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_PREFIX_REGEX,
  isValidLocale,
  getLocaleFromPathname,
  stripLocaleFromPathname,
  resolveLocaleFromAcceptLanguage,
  addLocaleToPathname,
} from "@/lib/i18n/config";

interface MaintenanceSettings {
  maintenance_mode: boolean | null;
  maintenance_ip_whitelist: string[] | null;
}

const MAINTENANCE_CACHE_TTL_MS = 15_000;
const AUTH_WHITELIST_ROUTES = ["/login", "/signup", "/forgot-password", "/auth/callback", "/auth/reset-password"];
const PASS_THROUGH_PREFIXES = ["/_next", "/api", "/maintenance", "/admin", "/dashboard", "/owner"];
const PASS_THROUGH_PATHS = ["/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.json"];
const PUBLIC_FILE_REGEX = /\.[^/]+$/;

const PROTECTED_ROUTES = ["/admin", "/dashboard", "/owner"];
const PUBLIC_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

const API_ROUTE_RATE_LIMIT = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

let cachedSettings: MaintenanceSettings | null = null;
let cachedAt = 0;

const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "on",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function normalizePathname(pathname: string): string {
  const normalized = pathname.replace(LOCALE_PREFIX_REGEX, "");
  return normalized || "/";
}

function isAuthWhitelistedPath(pathname: string): boolean {
  return AUTH_WHITELIST_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function hasPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getRequestIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = API_ROUTE_RATE_LIMIT.get(ip);

  if (!record || now > record.resetTime) {
    API_ROUTE_RATE_LIMIT.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

async function fetchMaintenanceSettings(): Promise<MaintenanceSettings | null> {
  const now = Date.now();
  if (cachedSettings && now - cachedAt < MAINTENANCE_CACHE_TTL_MS) {
    return cachedSettings;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const url = `${supabaseUrl}/rest/v1/site_settings?select=maintenance_mode,maintenance_ip_whitelist&id=eq.default`;
    const response = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as MaintenanceSettings[] | null;
    const first = payload?.[0];
    if (!first) {
      return null;
    }

    cachedSettings = first;
    cachedAt = now;
    return first;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeFromPath = getLocaleFromPathname(pathname);
  const hasLocalePrefix = isValidLocale(localeFromPath) && localeFromPath !== DEFAULT_LOCALE
    ? pathname.match(LOCALE_PREFIX_REGEX) !== null
    : pathname !== "/" && pathname.match(LOCALE_PREFIX_REGEX) !== null;
  const normalizedPath = normalizePathname(pathname);

  let response = await updateSession(request);

  const securityHeaderEntries = Object.entries(SECURITY_HEADERS);
  for (let i = 0; i < securityHeaderEntries.length; i++) {
    const entry = securityHeaderEntries[i];
    response.headers.set(entry[0], entry[1]);
  }

  response.headers.set("x-locale", localeFromPath);

  if (pathname === "/" && !hasLocalePrefix) {
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = resolveLocaleFromAcceptLanguage(acceptLanguage);
    const suffix = normalizedPath === "/" ? "" : `/${normalizedPath.replace(/^\//, "")}`;
    const redirectUrl = new URL("/" + detectedLocale + suffix, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/api/")) {
    const ip = getRequestIp(request) || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  if (PROTECTED_ROUTES.some((route) => normalizedPath.startsWith(route))) {
    const supabaseCookie = request.cookies.get("sb-access-token");
    const isAuthenticated = !!supabaseCookie?.value;

    if (!isAuthenticated && !normalizedPath.includes("/auth/")) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", normalizedPath);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (PUBLIC_ONLY_ROUTES.some((route) => normalizedPath.startsWith(route))) {
    const supabaseCookie = request.cookies.get("sb-access-token");
    const isAuthenticated = !!supabaseCookie?.value;

    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (PUBLIC_FILE_REGEX.test(pathname)) {
    return response;
  }

  if (PASS_THROUGH_PATHS.includes(pathname)) {
    return response;
  }

  if (PASS_THROUGH_PREFIXES.some((prefix) => hasPathPrefix(normalizedPath, prefix))) {
    return response;
  }

  if (isAuthWhitelistedPath(normalizedPath)) {
    return response;
  }

  const settings = await fetchMaintenanceSettings();
  if (!settings?.maintenance_mode) {
    return response;
  }

  const requestIp = getRequestIp(request);
  if (isMaintenanceIpWhitelisted(requestIp, settings.maintenance_ip_whitelist)) {
    return response;
  }

  const maintenanceUrl = new URL("/maintenance", request.url);
  response = NextResponse.rewrite(maintenanceUrl);
  response.headers.set("x-maintenance-mode", "true");
  response.headers.set("Retry-After", "600");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
