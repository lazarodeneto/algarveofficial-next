import { Helmet } from "react-helmet-async";
import { SITE_URL, localizeCanonicalUrl } from "@/lib/seoUrls";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SEO,
  SITE_NAME,
  ensureBrandedTitle,
  normalizeSeoDescription,
  toAbsoluteSeoImageUrl,
} from "@/lib/seo/sharedSeo.js";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  openGraphUrl?: string;
  ogType?: "website" | "article" | "product" | "place";
  noIndex?: boolean;
  noFollow?: boolean;
  keywords?: string;
  author?: string;
  authorUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  locale?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  alternateLocales?: { locale: string; url: string }[];
}

const DEFAULT_IMAGE = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;

/**
 * Language config for hreflang generation.
 * English lives at root (/), all others in their prefix directory.
 */
const LANGUAGES = [
  { hreflang: "en", prefix: "" },
  { hreflang: "pt", prefix: "/pt-pt" },
  { hreflang: "fr", prefix: "/fr" },
  { hreflang: "de", prefix: "/de" },
  { hreflang: "es", prefix: "/es" },
  { hreflang: "it", prefix: "/it" },
  { hreflang: "nl", prefix: "/nl" },
  { hreflang: "sv", prefix: "/sv" },
  { hreflang: "nb", prefix: "/no" },
  { hreflang: "da", prefix: "/da" },
];

const HTML_LANG_BY_PREFIX: Record<string, string> = {
  "/pt-pt": "pt-PT",
  "/fr": "fr",
  "/de": "de",
  "/es": "es",
  "/it": "it",
  "/nl": "nl",
  "/sv": "sv",
  "/no": "no",
  "/da": "da",
};

/** Derive the page path from a canonical URL (strip domain) */
function getPagePath(canonical: string): string {
  if (canonical.startsWith(SITE_URL)) {
    return canonical.slice(SITE_URL.length) || "/";
  }
  return "/";
}

export function SeoHead({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogImageAlt,
  openGraphTitle,
  openGraphDescription,
  openGraphImage,
  openGraphUrl,
  ogType = "website",
  noIndex = false,
  noFollow = false,
  keywords,
  author,
  authorUrl,
  publishedTime,
  modifiedTime,
  articleSection,
  locale = "en_US",
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = "summary_large_image",
  twitterSite = "@AlgarveOfficial",
  alternateLocales = [],
}: SeoHeadProps) {
  const fullTitle = ensureBrandedTitle(title || DEFAULT_SEO.title);
  const metaDescription = normalizeSeoDescription(description, DEFAULT_SEO.description);

  const toAbsoluteUrl = (url: string): string => (
    url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`
  );

  // Self-referencing canonical — always algarveofficial.com, never .pt
  const canonical = canonicalUrl
    ? localizeCanonicalUrl(toAbsoluteUrl(canonicalUrl))
    : (typeof window !== "undefined" ? `${SITE_URL}${window.location.pathname}${window.location.search}` : SITE_URL);
  const htmlLang = Object.entries(HTML_LANG_BY_PREFIX).find(([prefix]) => canonical.includes(`${SITE_URL}${prefix}`))?.[1] ?? "en";

  const ogUrl = openGraphUrl ? toAbsoluteUrl(openGraphUrl) : canonical;
  const image = toAbsoluteSeoImageUrl(openGraphImage || ogImage || DEFAULT_IMAGE, SITE_URL);
  const ogTitle = openGraphTitle || fullTitle;
  const ogDescription = openGraphDescription || metaDescription;
  const twitterTitleValue = twitterTitle || ogTitle;
  const twitterDescriptionValue = twitterDescription || ogDescription;
  const twitterImageValue = twitterImage || image;
  
  // Robots directive
  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
    "max-image-preview:large",
    "max-snippet:-1",
    "max-video-preview:-1",
  ].join(", ");

  // Build hreflang alternates
  const pagePath = getPagePath(canonical);
  // Strip any existing language prefix from the path so we get the bare page path
  const barePath = pagePath.replace(/^\/(pt-pt|fr|de|es|it|nl|sv|no|da)(\/|$)/, "/");

  // Helper: build full URL for a language prefix + bare path
  const buildLangUrl = (prefix: string): string => {
    if (barePath === "/") {
      // Homepage: EN → "/" , others → "/pt-pt/" (with trailing slash)
      return prefix ? `${SITE_URL}${prefix}/` : `${SITE_URL}/`;
    }
    // Inner pages: "/listings/abc" → "/pt-pt/listings/abc"
    return `${SITE_URL}${prefix}${barePath}`;
  };

  const hreflangs = alternateLocales.length > 0
    ? alternateLocales
    : LANGUAGES.map(({ hreflang, prefix }) => ({
        locale: hreflang,
        url: buildLangUrl(prefix),
      }));

  // x-default always points to English version
  const xDefaultUrl = buildLangUrl("");

  return (
    <Helmet>
      <html lang={htmlLang} />
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Canonical — self-referencing, always .com */}
      <link rel="canonical" href={canonical} />
      
      {/* Hreflang for international SEO */}
      {hreflangs.map(({ locale: lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />
      
      {/* Open Graph / Facebook — always .com URLs */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={locale} />

      {/* Article specific */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={authorUrl || author} />
      )}
      {ogType === "article" && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={twitterTitleValue} />
      <meta name="twitter:description" content={twitterDescriptionValue} />
      <meta name="twitter:image" content={twitterImageValue} />
      <meta name="twitter:site" content={twitterSite} />
      
      {/* Additional SEO signals */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="PT-08" />
      <meta name="geo.placename" content="Algarve, Portugal" />
      <meta name="geo.position" content="37.0179;-7.9304" />
      <meta name="ICBM" content="37.0179, -7.9304" />
    </Helmet>
  );
}

export default SeoHead;
