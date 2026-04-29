import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: "/about-us",
    title: "About AlgarveOfficial",
    description:
      "Learn about AlgarveOfficial and our mission to curate Portugal's premier premium stays, dining, golf, and concierge experiences.",
  });
}

export default function AboutUsLayout({ children }: LayoutProps) {
  return children;
}
