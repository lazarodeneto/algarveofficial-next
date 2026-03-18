const SITE_URL = "https://algarveofficial.com";
const LANGUAGE_PREFIX_RE = /^\/(pt-pt|fr|de|es|it|nl|sv|no|da)(?=\/|$)/;

export function toAbsoluteSeoUrl(url: string): string {
  return toAbsoluteUrl(url).toString();
}

function toAbsoluteUrl(url: string): URL {
  if (url.startsWith("http")) {
    return new URL(url);
  }

  return new URL(url.startsWith("/") ? `${SITE_URL}${url}` : `${SITE_URL}/${url}`);
}

function getActiveLocalePrefix(): string {
  if (typeof window === "undefined") return "";

  const match = window.location.pathname.match(LANGUAGE_PREFIX_RE);
  return match ? `/${match[1]}` : "";
}

export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(LANGUAGE_PREFIX_RE, "") || "/";
}

export function localizeSeoUrl(url: string): string {
  try {
    const absoluteUrl = toAbsoluteUrl(url);
    if (absoluteUrl.origin !== SITE_URL) {
      return absoluteUrl.toString();
    }

    const localePrefix = getActiveLocalePrefix();
    if (!localePrefix) {
      return absoluteUrl.toString();
    }

    const barePath = stripLanguagePrefix(absoluteUrl.pathname);
    absoluteUrl.pathname = barePath === "/" ? `${localePrefix}/` : `${localePrefix}${barePath}`;
    return absoluteUrl.toString();
  } catch {
    return url;
  }
}

export function localizeCanonicalUrl(preferredCanonical: string): string {
  if (typeof window === "undefined") return preferredCanonical;

  const currentPath = window.location.pathname;
  if (!LANGUAGE_PREFIX_RE.test(currentPath)) {
    return preferredCanonical;
  }

  try {
    const current = new URL(`${SITE_URL}${window.location.pathname}${window.location.search}`);
    const preferred = toAbsoluteUrl(preferredCanonical);
    const currentBarePath = stripLanguagePrefix(current.pathname);
    const preferredBarePath = stripLanguagePrefix(preferred.pathname);
    const currentComparable = `${currentBarePath}${current.search}`;
    const preferredComparable = `${preferredBarePath}${preferred.search}`;

    if (currentComparable === preferredComparable) {
      return current.toString();
    }

    if (currentBarePath === preferredBarePath) {
      return localizeSeoUrl(preferred.toString());
    }
  } catch {
    return preferredCanonical;
  }

  return preferredCanonical;
}

export { LANGUAGE_PREFIX_RE, SITE_URL };
