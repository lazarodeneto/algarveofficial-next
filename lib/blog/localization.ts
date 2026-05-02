import type { Locale } from "@/lib/i18n/config";

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

type BlogFallbackTranslation = {
  title: string;
  excerpt: string;
  category: string;
};

const BEST_BEACHES_TRANSLATIONS: Record<Locale, BlogFallbackTranslation> = {
  en: {
    title: "Best Beaches in the Algarve",
    category: "Travel Guides",
    excerpt:
      "The Algarve is home to some of the most spectacular beaches in Europe, known for dramatic golden cliffs, turquoise waters, hidden caves, and long sandy stretches perfect for relaxing or exploring.",
  },
  "pt-pt": {
    title: "As Melhores Praias do Algarve",
    category: "Guias de Viagem",
    excerpt:
      "O Algarve alberga algumas das praias mais espetaculares da Europa, conhecidas pelas falésias douradas, águas turquesa, grutas escondidas e extensos areais perfeitos para relaxar ou explorar.",
  },
  fr: {
    title: "Les Plus Belles Plages de l’Algarve",
    category: "Guides de Voyage",
    excerpt:
      "L’Algarve abrite certaines des plages les plus spectaculaires d’Europe, réputées pour leurs falaises dorées, leurs eaux turquoise, leurs grottes cachées et leurs longues étendues de sable idéales pour se détendre ou explorer.",
  },
  de: {
    title: "Die schönsten Strände der Algarve",
    category: "Reiseführer",
    excerpt:
      "Die Algarve beherbergt einige der spektakulärsten Strände Europas, bekannt für goldene Felsklippen, türkisfarbenes Wasser, versteckte Grotten und lange Sandstrände, die ideal zum Entspannen oder Erkunden sind.",
  },
  es: {
    title: "Las Mejores Playas del Algarve",
    category: "Guías de Viaje",
    excerpt:
      "El Algarve alberga algunas de las playas más espectaculares de Europa, conocidas por sus acantilados dorados, aguas turquesas, cuevas escondidas y largas extensiones de arena perfectas para relajarse o explorar.",
  },
  it: {
    title: "Le Migliori Spiagge dell’Algarve",
    category: "Guide di Viaggio",
    excerpt:
      "L’Algarve ospita alcune delle spiagge più spettacolari d’Europa, note per le scogliere dorate, le acque turchesi, le grotte nascoste e le lunghe distese di sabbia perfette per rilassarsi o esplorare.",
  },
  nl: {
    title: "De Beste Stranden van de Algarve",
    category: "Reisgidsen",
    excerpt:
      "De Algarve heeft enkele van de meest spectaculaire stranden van Europa, bekend om gouden kliffen, turquoise water, verborgen grotten en lange zandstranden die perfect zijn om te ontspannen of te verkennen.",
  },
  sv: {
    title: "Algarves Bästa Stränder",
    category: "Reseguider",
    excerpt:
      "Algarve har några av Europas mest spektakulära stränder, kända för gyllene klippor, turkost vatten, dolda grottor och långa sandstränder som passar perfekt för avkoppling eller upptäcktsfärder.",
  },
  no: {
    title: "Algarves Beste Strender",
    category: "Reiseguider",
    excerpt:
      "Algarve har noen av Europas mest spektakulære strender, kjent for gylne klipper, turkist vann, skjulte grotter og lange sandstrender som passer perfekt for avslapning eller utforsking.",
  },
  da: {
    title: "Algarves Bedste Strande",
    category: "Rejseguider",
    excerpt:
      "Algarve har nogle af Europas mest spektakulære strande, kendt for gyldne klipper, turkisblåt vand, skjulte grotter og lange sandstrande, der er perfekte til afslapning eller udforskning.",
  },
};

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

export function applyBlogTranslation<T extends BlogLocalizablePost>(
  post: T,
  translation: BlogTranslationRow | null | undefined,
  locale: string,
): T {
  const knownFallback = locale === "en" ? null : getKnownFallbackTranslation(post, locale);

  return {
    ...post,
    title: normalizeText(translation?.title) ?? knownFallback?.title ?? post.title,
    excerpt: normalizeText(translation?.excerpt) ?? knownFallback?.excerpt ?? post.excerpt ?? null,
    content: normalizeText(translation?.content) ?? post.content ?? null,
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
