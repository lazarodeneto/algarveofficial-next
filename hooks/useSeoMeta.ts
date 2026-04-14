"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/seo/advanced/seo-config";

interface UseSeoMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalUrl?: string;
}

export function useSeoMeta({
  title,
  description,
  image,
  noIndex = false,
  noFollow = false,
  canonicalUrl,
}: UseSeoMetaOptions = {}) {
  const pathname = usePathname();

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_CONFIG.url;
    const resolvedTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
    const resolvedDescription = description ?? SITE_CONFIG.description;
    const resolvedImage = image ?? `${siteUrl}${SITE_CONFIG.ogImage}`;
    const resolvedCanonical = canonicalUrl ?? `${siteUrl}${pathname}`;

    document.title = resolvedTitle;

    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaTag("description", resolvedDescription);
    updateMetaTag("og:title", resolvedTitle, true);
    updateMetaTag("og:description", resolvedDescription, true);
    updateMetaTag("og:image", resolvedImage, true);
    updateMetaTag("og:url", resolvedCanonical, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", resolvedTitle);
    updateMetaTag("twitter:description", resolvedDescription);
    updateMetaTag("twitter:image", resolvedImage);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = resolvedCanonical;

    if (noIndex || noFollow) {
      updateMetaTag("robots", `${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`);
      updateMetaTag("googlebot", `${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`);
    }
  }, [title, description, image, noIndex, noFollow, canonicalUrl, pathname]);
}
