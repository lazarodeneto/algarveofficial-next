import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://algarveofficial.com";

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

const STATIC_PUBLIC_PATHS = [
  "/",
  "/about-us",
  "/blog",
  "/contact",
  "/cookie-policy",
  "/destinations",
  "/directory",
  "/events",
  "/invest",
  "/live",
  "/map",
  "/partner",
  "/privacy-policy",
  "/real-estate",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return STATIC_PUBLIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

