import type { MetadataRoute } from "next";

import { escapeXmlValue } from "@/lib/seo/sitemap-utils";

function toIsoDate(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function buildUrlsetXml(entries: MetadataRoute.Sitemap): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const entry of entries) {
    lines.push("<url>");
    lines.push(`<loc>${escapeXmlValue(entry.url)}</loc>`);

    const alternates = entry.alternates?.languages ?? {};
    for (const [hreflang, href] of Object.entries(alternates)) {
      if (!href) continue;
      lines.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXmlValue(hreflang)}" href="${escapeXmlValue(href)}" />`,
      );
    }

    const images = entry.images ?? [];
    for (const image of images) {
      lines.push("<image:image>");
      lines.push(`<image:loc>${escapeXmlValue(image)}</image:loc>`);
      lines.push("</image:image>");
    }

    const lastMod = toIsoDate(entry.lastModified);
    if (lastMod) {
      lines.push(`<lastmod>${lastMod}</lastmod>`);
    }

    if (entry.changeFrequency) {
      lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
    }

    if (typeof entry.priority === "number") {
      const normalized = Number.isInteger(entry.priority)
        ? String(entry.priority)
        : entry.priority.toFixed(2).replace(/\.?0+$/, "");
      lines.push(`<priority>${normalized}</priority>`);
    }

    lines.push("</url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

export function buildSitemapIndexXml(urls: string[], lastModified?: Date): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  const lastMod = toIsoDate(lastModified);

  for (const url of urls) {
    lines.push("<sitemap>");
    lines.push(`<loc>${escapeXmlValue(url)}</loc>`);
    if (lastMod) {
      lines.push(`<lastmod>${lastMod}</lastmod>`);
    }
    lines.push("</sitemap>");
  }

  lines.push("</sitemapindex>");
  return `${lines.join("\n")}\n`;
}
