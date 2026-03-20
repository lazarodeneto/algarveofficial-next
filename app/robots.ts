import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://algarveofficial.com";

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/owner/",
          "/maintenance",
          "/auth/",
          "/_next/",
          "/uch/",
          "/owner/api/",
          "/api/admin/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/owner/",
          "/maintenance",
          "/auth/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/owner/",
          "/maintenance",
          "/auth/",
        ],
      },
    ],
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap.xml?type=blog`,
      `${siteUrl}/sitemap.xml?type=events`,
    ],
    host: siteUrl,
  };
}
