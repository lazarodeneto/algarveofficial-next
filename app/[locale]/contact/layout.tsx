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
    path: "/contact",
    title: "Contact AlgarveOfficial",
    description:
      "Contact AlgarveOfficial for concierge support, listing enquiries, partnerships, and tailored luxury experiences in the Algarve.",
  });
}

export default function ContactLayout({ children }: LayoutProps) {
  return children;
}

