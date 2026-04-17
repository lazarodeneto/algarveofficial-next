import { NextResponse } from "next/server";

import buildBlogSitemap from "@/app/sitemap-blog";
import { buildUrlsetXml } from "@/lib/seo/sitemap-xml";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const entries = await buildBlogSitemap();
  const xml = buildUrlsetXml(entries);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
