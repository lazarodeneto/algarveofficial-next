import { getSafeCmsImageSrc } from "@/lib/cms/image-source";

export type HeroMediaType = "none" | "image" | "video" | "youtube";
export type LegacyHeroMediaType = HeroMediaType | "poster";

export type NormalizedHeroMediaConfig = {
  type: HeroMediaType;
  mediaType: HeroMediaType;
  imageUrl: string | null;
  videoUrl: string | null;
  youtubeUrl: string | null;
  posterUrl: string | null;
  explicitType: boolean;
  legacyType: LegacyHeroMediaType | null;
};

export type HeroMediaRenderState =
  | {
      kind: "none";
      reason: "disabled" | "missing" | "invalid";
    }
  | {
      kind: "image";
      imageUrl: string;
      source: "image" | "poster-fallback" | "legacy-poster";
    }
  | {
      kind: "video";
      videoUrl: string;
      posterUrl: string | null;
    };

type RawHeroMediaSource = {
  type?: unknown;
  mediaType?: unknown;
  heroImageUrl?: unknown;
  imageUrl?: unknown;
  videoUrl?: unknown;
  youtubeUrl?: unknown;
  posterUrl?: unknown;
  hero?: unknown;
  heroMedia?: unknown;
  backgroundMedia?: unknown;
  section?: unknown;
  text?: unknown;
};

const EMPTY_RESET_MEDIA = {
  mediaType: "none",
  imageUrl: "",
  videoUrl: "",
  youtubeUrl: "",
  posterUrl: "",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const stringValue = getString(value);
    if (stringValue !== null) return stringValue;
  }

  return null;
}

function emptyToNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function normalizeHeroMediaType(value: unknown): LegacyHeroMediaType | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "none") return "none";
  if (normalized === "image") return "image";
  if (normalized === "video") return "video";
  if (normalized === "youtube") return "youtube";
  if (normalized === "poster") return "poster";
  return null;
}

export function isValidHeroImageUrl(value: unknown): value is string {
  return getSafeCmsImageSrc(value) !== null;
}

export function normalizeHeroImageUrl(value: unknown): string | null {
  return getSafeCmsImageSrc(value);
}

export function isValidHeroVideoUrl(value: unknown): value is string {
  return normalizeHeroVideoUrl(value) !== null;
}

export function normalizeHeroVideoUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || /^(blob|data|file|javascript):/i.test(trimmed)) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    parsed.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(hostname);

  if (parsed.protocol !== "https:" && !isLocalDev) return null;

  return parsed.toString();
}

export function isValidYouTubeUrl(value: unknown): value is string {
  return normalizeYouTubeUrl(value) !== null;
}

export function normalizeYouTubeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || /^(blob|data|file|javascript):/i.test(trimmed)) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const allowedHosts = new Set([
    "youtube.com",
    "m.youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
  ]);

  if (!allowedHosts.has(hostname)) return null;

  return parsed.toString();
}

export function normalizeHeroMediaConfig(rawConfig: unknown): NormalizedHeroMediaConfig {
  const raw = isRecord(rawConfig) ? (rawConfig as RawHeroMediaSource) : {};
  const hero = isRecord(raw.hero) ? raw.hero : {};
  const heroMedia = isRecord(raw.heroMedia) ? raw.heroMedia : {};
  const backgroundMedia = isRecord(raw.backgroundMedia) ? raw.backgroundMedia : {};
  const section = isRecord(raw.section) ? raw.section : {};
  const sectionMedia = isRecord(section.media) ? section.media : {};
  const text = isRecord(raw.text) ? raw.text : {};

  const rawMediaType = firstString(
    heroMedia.type,
    heroMedia.mediaType,
    backgroundMedia.type,
    backgroundMedia.mediaType,
    sectionMedia.type,
    sectionMedia.mediaType,
    raw.type,
    raw.mediaType,
    hero.mediaType,
    text["hero.mediaType"],
  );
  const legacyType = normalizeHeroMediaType(rawMediaType);
  const explicitType = legacyType !== null;

  const rawImageUrl = firstString(
    heroMedia.imageUrl,
    backgroundMedia.imageUrl,
    sectionMedia.imageUrl,
    raw.imageUrl,
    raw.heroImageUrl,
    hero.imageUrl,
    text["hero.imageUrl"],
  );
  const rawVideoUrl = firstString(
    heroMedia.videoUrl,
    backgroundMedia.videoUrl,
    sectionMedia.videoUrl,
    raw.videoUrl,
    hero.videoUrl,
    text["hero.videoUrl"],
  );
  const rawYoutubeUrl = firstString(
    heroMedia.youtubeUrl,
    backgroundMedia.youtubeUrl,
    sectionMedia.youtubeUrl,
    raw.youtubeUrl,
    hero.youtubeUrl,
    text["hero.youtubeUrl"],
  );
  const rawPosterUrl = firstString(
    heroMedia.posterUrl,
    backgroundMedia.posterUrl,
    sectionMedia.posterUrl,
    raw.posterUrl,
    hero.posterUrl,
    text["hero.posterUrl"],
  );

  const safeImageUrl = normalizeHeroImageUrl(rawImageUrl);
  const safePosterUrl = normalizeHeroImageUrl(rawPosterUrl);
  const safeVideoUrl = normalizeHeroVideoUrl(rawVideoUrl);
  const safeYoutubeUrl = normalizeYouTubeUrl(rawYoutubeUrl);

  let type: HeroMediaType;
  if (legacyType === "none") {
    type = "none";
  } else if (legacyType === "poster") {
    type = safeImageUrl || safePosterUrl ? "image" : "none";
  } else if (legacyType) {
    type = legacyType;
  } else if (safeVideoUrl) {
    type = "video";
  } else if (safeYoutubeUrl) {
    type = "youtube";
  } else if (safeImageUrl || safePosterUrl) {
    type = "image";
  } else {
    type = "none";
  }

  const imageUrl =
    type === "image" && legacyType === "poster" && !safeImageUrl
      ? safePosterUrl
      : safeImageUrl;

  return {
    type,
    mediaType: type,
    imageUrl,
    videoUrl: safeVideoUrl,
    youtubeUrl: safeYoutubeUrl,
    posterUrl: safePosterUrl,
    explicitType,
    legacyType,
  };
}

export function getHeroMediaRenderState(media: NormalizedHeroMediaConfig): HeroMediaRenderState {
  if (media.type === "none") {
    return { kind: "none", reason: media.explicitType ? "disabled" : "missing" };
  }

  if (media.type === "image") {
    if (media.imageUrl) {
      return {
        kind: "image",
        imageUrl: media.imageUrl,
        source: media.legacyType === "poster" ? "legacy-poster" : "image",
      };
    }

    return { kind: "none", reason: "invalid" };
  }

  if (media.type === "video") {
    if (media.videoUrl) {
      return {
        kind: "video",
        videoUrl: media.videoUrl,
        posterUrl: media.posterUrl,
      };
    }

    if (media.posterUrl) {
      return {
        kind: "image",
        imageUrl: media.posterUrl,
        source: "poster-fallback",
      };
    }

    return { kind: "none", reason: "invalid" };
  }

  if (media.posterUrl) {
    return {
      kind: "image",
      imageUrl: media.posterUrl,
      source: "poster-fallback",
    };
  }

  return { kind: "none", reason: "invalid" };
}

export function resetHeroMediaConfig<T extends Record<string, unknown>>(config: T): T & Record<string, unknown> {
  const nextHero = {
    ...(isRecord(config.hero) ? config.hero : {}),
    ...EMPTY_RESET_MEDIA,
  };
  const nextText = {
    ...(isRecord(config.text) ? config.text : {}),
    "hero.mediaType": EMPTY_RESET_MEDIA.mediaType,
    "hero.imageUrl": EMPTY_RESET_MEDIA.imageUrl,
    "hero.videoUrl": EMPTY_RESET_MEDIA.videoUrl,
    "hero.youtubeUrl": EMPTY_RESET_MEDIA.youtubeUrl,
    "hero.posterUrl": EMPTY_RESET_MEDIA.posterUrl,
  };

  return {
    ...config,
    ...EMPTY_RESET_MEDIA,
    heroImageUrl: "",
    hero: nextHero,
    heroMedia: undefined,
    backgroundMedia: undefined,
    text: nextText,
  };
}
