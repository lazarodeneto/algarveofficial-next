import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";
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
    canonicalPath: "/properties",
    title: "Redirecting to Properties",
    description: "Redirecting to the Properties page.",
    noIndex: true,
  });
}

export default async function InvestPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v)) v.forEach((val) => qs.append(k, val));
  }
  const query = qs.toString();

  permanentRedirect(`/${locale}/properties${query ? `?${query}` : ""}`);
}
