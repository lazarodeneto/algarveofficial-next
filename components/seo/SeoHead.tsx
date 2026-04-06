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

/**
 * @deprecated
 * App Router metadata is the only supported SEO system.
 * This compatibility shim intentionally renders nothing so legacy pages can
 * migrate without pulling `react-helmet-async` into the runtime.
 */
export function SeoHead(_props: SeoHeadProps) {
  return null;
}

export default SeoHead;
