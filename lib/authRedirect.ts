import { buildLocalizedPath, stripLocaleFromPathname } from "@/lib/i18n/routing";

const DISALLOWED_POST_AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
];

function splitPathSuffix(path: string): { pathname: string; suffix: string } {
  const match = path.match(/^([^?#]*)(.*)$/);

  return {
    pathname: match?.[1] ?? path,
    suffix: match?.[2] ?? "",
  };
}

function isDisallowedPostAuthPath(path: string): boolean {
  return DISALLOWED_POST_AUTH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function getRequestedPostAuthPath(search: string): string | null {
  const params = new URLSearchParams(search);
  return params.get("next") || params.get("from");
}

export function resolvePostAuthRedirectPath(
  requestedPath: string | null | undefined,
  locale: string,
  fallbackPath: string,
): string {
  const safeFallbackPath = buildLocalizedPath(locale, fallbackPath);

  if (!requestedPath) {
    return safeFallbackPath;
  }

  const trimmed = requestedPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return safeFallbackPath;
  }

  const localizedPath = buildLocalizedPath(locale, trimmed);
  const { pathname } = splitPathSuffix(localizedPath);
  const barePath = stripLocaleFromPathname(pathname);

  if (isDisallowedPostAuthPath(barePath)) {
    return safeFallbackPath;
  }

  return localizedPath;
}

export function buildAbsoluteAppUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
