import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import Header from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: "/golf",
    title: "Golf in the Algarve",
    description:
      "Discover the Algarve's finest golf courses, premium clubs, and golf travel planning resources.",
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
