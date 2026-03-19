"use client";
import { useLocation } from "@/components/router/nextRouterCompat";

const LANG_PREFIXES = ["/pt-pt", "/fr", "/de", "/es", "/it", "/nl", "/sv", "/no", "/da"];

/**
 * Returns the current language prefix from the URL (e.g. "/pt-pt", "/fr", or "").
 * Use this to build language-aware internal links.
 */
export function useLangPrefix(): string {
  let pathname = "";
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch {
    // Falls through to returning empty string if window/location/context is missing
  }

  if (!pathname) return "";

  for (const prefix of LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return prefix;
    }
  }
  return "";
}

/**
 * Build a language-aware path by prepending the current language prefix.
 * Usage: langPath("/blog") → "/pt-pt/blog" if on Portuguese version
 */
export function buildLangPath(prefix: string, path: string): string {
  if (!prefix) return path;
  if (path === "/") return prefix;
  return `${prefix}${path}`;
}
