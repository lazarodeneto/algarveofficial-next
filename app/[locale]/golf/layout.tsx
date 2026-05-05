import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import Header from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const tx = await getServerTranslations(locale, [
    "golf.metadata.title",
    "golf.metadata.description",
  ]);

  return buildLocalizedMetadata({
    locale,
    path: "/golf",
    title: tx["golf.metadata.title"] ?? "AlgarveOfficial",
    description: tx["golf.metadata.description"] ?? "AlgarveOfficial",
  });
}

export default function GolfLayout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
