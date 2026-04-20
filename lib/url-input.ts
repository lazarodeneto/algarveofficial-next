const ABSOLUTE_URL_SCHEME_RE = /^[a-z][a-z\d+\-.]*:\/\//i;
const SCHEME_RELATIVE_URL_RE = /^\/\//;

function withDefaultScheme(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (ABSOLUTE_URL_SCHEME_RE.test(trimmed)) return trimmed;
  if (SCHEME_RELATIVE_URL_RE.test(trimmed)) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

function tryParseExternalHttpUrl(value: string): URL | null {
  const candidate = withDefaultScheme(value);
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!parsed.hostname) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function normalizeExternalUrlInput(value: string): string {
  return withDefaultScheme(value);
}

export function isValidExternalUrlInput(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return tryParseExternalHttpUrl(trimmed) !== null;
}

export function normalizeExternalUrlForStorage(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = tryParseExternalHttpUrl(trimmed);
  if (!parsed) return null;
  return parsed.toString();
}
