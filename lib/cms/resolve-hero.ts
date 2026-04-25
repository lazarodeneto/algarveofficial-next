export interface CmsHeroData {
  enabled?: boolean;
  mediaType?: "image" | "video" | "youtube" | "poster";
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  posterUrl?: string | null;
  alt?: string | null;
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaCourses?: string | null;
  ctaLeaderboard?: string | null;
}

export interface LegacyTextHero {
  "hero.mediaType"?: string;
  "hero.imageUrl"?: string;
  "hero.videoUrl"?: string;
  "hero.youtubeUrl"?: string;
  "hero.posterUrl"?: string;
  "hero.alt"?: string;
}

export interface CmsPageContent {
  hero?: CmsHeroData;
  text?: Record<string, string>;
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  mediaType?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  posterUrl?: string | null;
  alt?: string | null;
  ctaCourses?: string | null;
  ctaLeaderboard?: string | null;
}

export function resolveHero(content: CmsPageContent | null | undefined): CmsHeroData {
  if (!content) {
    return getDefaultHero();
  }

  if (content.hero) {
    return {
      enabled: content.hero.enabled ?? true,
      mediaType: content.hero.mediaType ?? "image",
      imageUrl: content.hero.imageUrl ?? null,
      videoUrl: content.hero.videoUrl ?? null,
      youtubeUrl: content.hero.youtubeUrl ?? null,
      posterUrl: content.hero.posterUrl ?? null,
      alt: content.hero.alt,
    };
  }

  if (typeof content.mediaType === "string" || typeof content.imageUrl === "string") {
    return {
      enabled: true,
      mediaType: (content.mediaType as CmsHeroData["mediaType"]) ?? "image",
      imageUrl: content.imageUrl ?? null,
      videoUrl: content.videoUrl ?? null,
      youtubeUrl: content.youtubeUrl ?? null,
      posterUrl: content.posterUrl ?? null,
      alt: content.alt,
    };
  }

  if (content.text) {
    const text = content.text as unknown as LegacyTextHero;
    return {
      enabled: true,
      mediaType: (text["hero.mediaType"] as CmsHeroData["mediaType"]) ?? "image",
      imageUrl: text["hero.imageUrl"] ?? null,
      videoUrl: text["hero.videoUrl"] ?? null,
      youtubeUrl: text["hero.youtubeUrl"] ?? null,
      posterUrl: text["hero.posterUrl"] ?? null,
      alt: text["hero.alt"],
    };
  }

  return getDefaultHero();
}

export function resolvePageContent(content: CmsPageContent | null | undefined): {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaCourses?: string | null;
  ctaLeaderboard?: string | null;
  alt?: string | null;
} {
  if (!content) {
    return {};
  }

  if (content.hero) {
    return {
      badge: content.hero.badge,
      title: content.hero.title,
      subtitle: content.hero.subtitle,
      ctaCourses: content.hero.ctaCourses,
      ctaLeaderboard: content.hero.ctaLeaderboard,
      alt: content.hero.alt,
    };
  }

  return {
    badge: content.badge,
    title: content.title,
    subtitle: content.subtitle,
    ctaCourses: content.ctaCourses,
    ctaLeaderboard: content.ctaLeaderboard,
    alt: content.alt,
  };
}

function getDefaultHero(): CmsHeroData {
  return {
    enabled: true,
    mediaType: "image",
    imageUrl: null,
    videoUrl: null,
    youtubeUrl: null,
    posterUrl: null,
  };
}

export function buildHeroFromTextMap(textMap: Record<string, string>): CmsHeroData {
  return {
    enabled: true,
    mediaType: (textMap["hero.mediaType"] as CmsHeroData["mediaType"]) ?? "image",
    imageUrl: textMap["hero.imageUrl"] ?? null,
    videoUrl: textMap["hero.videoUrl"] ?? null,
    youtubeUrl: textMap["hero.youtubeUrl"] ?? null,
    posterUrl: textMap["hero.posterUrl"] ?? null,
  };
}
