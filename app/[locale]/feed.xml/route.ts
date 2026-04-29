import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

const DEFAULT_SITE_URL = "https://algarveofficial.com";
const SITE_NAME = "AlgarveOfficial";
const SITE_DESCRIPTION = "Your gateway to premium experiences across Portugal's most prestigious coastal region.";

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

function escapeXml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRssDate(date: string | null | undefined): string {
  if (!date) return new Date().toUTCString();
  try {
    return new Date(date).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

async function getBlogPosts() {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, featured_image, published_at, updated_at")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[feed] Failed to fetch blog posts", error);
    return [];
  }

  return data ?? [];
}

async function getEvents() {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug, title, description, image, start_date, end_date, location, venue, updated_at")
    .eq("status", "published")
    .not("slug", "is", null)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[feed] Failed to fetch events", error);
    return [];
  }

  return data ?? [];
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteUrl = getSiteUrl();
  const baseUrl = `${siteUrl}/${locale}`;

  const [blogPosts, events] = await Promise.all([getBlogPosts(), getEvents()]);

  const items: string[] = [];

  for (const post of blogPosts) {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const pubDate = formatRssDate(post.published_at);
    const lastMod = formatRssDate(post.updated_at);
    const image = post.featured_image ? `<image>${escapeXml(post.featured_image)}</image>` : "";

    items.push(`    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <lastBuildDate>${lastMod}</lastBuildDate>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      ${image}
    </item>`);
  }

  for (const event of events) {
    const eventUrl = `${baseUrl}/events/${event.slug}`;
    const startDate = formatRssDate(event.start_date);
    const lastMod = formatRssDate(event.updated_at);
    const locationName = event.location ?? event.venue;
    const location = locationName ? `<location>${escapeXml(locationName)}</location>` : "";
    const image = event.image ? `<image>${escapeXml(event.image)}</image>` : "";

    items.push(`    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${eventUrl}</link>
      <guid isPermaLink="true">${eventUrl}</guid>
      <pubDate>${startDate}</pubDate>
      <lastBuildDate>${lastMod}</lastBuildDate>
      <description><![CDATA[${event.description || ""}]]></description>
      ${location}
      ${image}
    </item>`);
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${siteUrl}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${siteUrl}</link>
    </image>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
