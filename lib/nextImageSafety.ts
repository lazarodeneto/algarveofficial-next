const NEXT_IMAGE_ALLOWED_HOSTS = [
  "algarveofficial.com",
  "www.algarveofficial.com",
  "images.unsplash.com",
  "static.wixstatic.com",
  "i.ytimg.com",
  "img.youtube.com",
] as const;

function matchesWildcardHostname(hostname: string, suffix: string) {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

export function canUseNextImage(src?: string | null): boolean {
  if (!src) return false;

  if (
    src.startsWith("/") ||
    src.startsWith("./") ||
    src.startsWith("../") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false;

    if (NEXT_IMAGE_ALLOWED_HOSTS.includes(hostname as (typeof NEXT_IMAGE_ALLOWED_HOSTS)[number])) {
      return true;
    }

    return (
      matchesWildcardHostname(hostname, "supabase.co") ||
      matchesWildcardHostname(hostname, "cdn-files-a.com") ||
      matchesWildcardHostname(hostname, "setimaondaboattrips.com") ||
      matchesWildcardHostname(hostname, "wixstatic.com") ||
      matchesWildcardHostname(hostname, "googleapis.com") ||
      matchesWildcardHostname(hostname, "google.com") ||
      matchesWildcardHostname(hostname, "ggpht.com")
    );
  } catch {
    return false;
  }
}
