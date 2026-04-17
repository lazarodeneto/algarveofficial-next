import { NextResponse } from "next/server";

import { buildSitemapIndexXml } from "@/lib/seo/sitemap-xml";

const DEFAULT_SITE_URL = "https://algarveofficial.com";

export const runtime = "nodejs";
export const revalidate = 3600;

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const xml = buildSitemapIndexXml(
    [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-blog.xml`,
      `${siteUrl}/sitemap-events.xml`,
    ],
    new Date(),
  );

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
