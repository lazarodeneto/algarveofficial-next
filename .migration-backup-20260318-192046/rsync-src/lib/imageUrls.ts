export function isBlockedPublicImageUrl(value?: string | null): boolean {
  if (!value || typeof value !== "string") return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (
      hostname.endsWith("googleapis.com")
      && pathname.includes("/maps/api/place/photo")
    ) {
      return true;
    }

    if (
      hostname === "places.googleapis.com"
      && pathname.includes("/media")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function normalizePublicImageUrl(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isBlockedPublicImageUrl(trimmed)) return null;

  return trimmed;
}
