import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { buildLocalizedAliasMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  return buildLocalizedAliasMetadata({
    locale,
    canonicalPath: "/relocation",
    title: "Redirecting to Relocation",
    description: "Redirecting to the Relocation to the Algarve page.",
    noIndex: true,
  });
}

export default async function ResidencePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  permanentRedirect(buildLocalizedPath(locale, "/relocation"));
}
