import { NextRequest, NextResponse } from "next/server";

import { isMaintenanceIpWhitelisted } from "@/lib/maintenance";

interface MaintenanceSettings {
  maintenance_mode: boolean | null;
  maintenance_ip_whitelist: string[] | null;
}

const MAINTENANCE_CACHE_TTL_MS = 15_000;
const LOCALE_PREFIX_REGEX = /^\/(?:pt-pt|fr|de|es|it|nl|sv|no|da|en)(?=\/|$)/;
const AUTH_WHITELIST_ROUTES = ["/login", "/signup", "/forgot-password", "/auth/callback", "/auth/reset-password"];
const PASS_THROUGH_PREFIXES = ["/_next", "/api", "/maintenance", "/admin", "/dashboard"];
const PASS_THROUGH_PATHS = ["/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.json"];
const PUBLIC_FILE_REGEX = /\.[^/]+$/;

let cachedSettings: MaintenanceSettings | null = null;
let cachedAt = 0;

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
  const normalizedPath = normalizePathname(pathname);

  if (PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  if (PASS_THROUGH_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (PASS_THROUGH_PREFIXES.some((prefix) => hasPathPrefix(normalizedPath, prefix))) {
    return NextResponse.next();
  }

  if (isAuthWhitelistedPath(normalizedPath)) {
    return NextResponse.next();
  }

  const settings = await fetchMaintenanceSettings();
  if (!settings?.maintenance_mode) {
    return NextResponse.next();
  }

  const requestIp = getRequestIp(request);
  if (isMaintenanceIpWhitelisted(requestIp, settings.maintenance_ip_whitelist)) {
    return NextResponse.next();
  }

  const maintenanceUrl = new URL("/maintenance", request.url);
  const response = NextResponse.rewrite(maintenanceUrl);
  response.headers.set("x-maintenance-mode", "true");
  response.headers.set("Retry-After", "600");
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
