import type { Metadata } from "next";

import { BlogWriterClient } from "@/components/blog/BlogWriterClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/blog-writer",
    title: "Blog Writer | AlgarveOfficial",
    description: "Draft, structure, and preview editorial Algarve articles with a focused writing workspace.",
    noIndex: true,
  });
}

export default function BlogWriterPage() {
  return <BlogWriterClient />;
}
