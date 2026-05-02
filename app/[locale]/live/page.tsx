import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { buildLocalizedAliasMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function LegacyLivePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const sp = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      qs.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => qs.append(key, entry));
    }
  }

  const query = qs.toString();
  const targetPath = buildLocalizedPath(locale, "/relocation");
  permanentRedirect(`${targetPath}${query ? `?${query}` : ""}`);
}
