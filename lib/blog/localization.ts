import type { Locale } from "@/lib/i18n/config";
import { BEST_BEACHES_TRANSLATIONS } from "@/lib/blog/best-beaches-fallback";

export interface BlogTranslationRow {
  post_id: string;
  locale: string;
  title: string | null;
  excerpt: string | null;
  content?: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface BlogLocalizablePost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeKey(value: string | null | undefined) {
  return normalizeText(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
}

function getKnownFallbackTranslation(post: Pick<BlogLocalizablePost, "slug" | "title">, locale: string) {
  const normalizedLocale = locale as Locale;
  const fallback = BEST_BEACHES_TRANSLATIONS[normalizedLocale];
  if (!fallback) return null;

  const slugKey = normalizeKey(post.slug);
  const titleKey = normalizeKey(post.title);
  if (
    slugKey === "best-beaches-in-the-algarve" ||
    slugKey === "best-beaches-algarve" ||
    titleKey === "best-beaches-in-the-algarve"
  ) {
    return fallback;
  }

  return null;
}

function preferCompleteKnownContent(
  translated: string | null,
  fallback: string | undefined,
) {
  if (!fallback) return translated;
  if (!translated) return fallback;

  const hasFullArticleMarkers =
    translated.includes("Praia da Marinha") &&
    translated.includes("Praia da Falésia") &&
    translated.includes("Meia Praia") &&
    translated.length > fallback.length * 0.75;

  return hasFullArticleMarkers ? translated : fallback;
}

export function applyBlogTranslation<T extends BlogLocalizablePost>(
  post: T,
  translation: BlogTranslationRow | null | undefined,
  locale: string,
): T {
  const knownFallback = locale === "en" ? null : getKnownFallbackTranslation(post, locale);
  const translatedContent = normalizeText(translation?.content);

  return {
    ...post,
    title: normalizeText(translation?.title) ?? knownFallback?.title ?? post.title,
    excerpt: normalizeText(translation?.excerpt) ?? knownFallback?.excerpt ?? post.excerpt ?? null,
    content:
      preferCompleteKnownContent(translatedContent, knownFallback?.content) ?? post.content ?? null,
    seo_title: normalizeText(translation?.seo_title) ?? knownFallback?.title ?? post.seo_title ?? null,
    seo_description:
      normalizeText(translation?.seo_description) ?? knownFallback?.excerpt ?? post.seo_description ?? null,
  };
}

export function getKnownBlogCategoryLabel(
  post: Pick<BlogLocalizablePost, "slug" | "title">,
  locale: string,
) {
  return locale === "en" ? null : getKnownFallbackTranslation(post, locale)?.category ?? null;
}
