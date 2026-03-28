import type { Metadata } from "next";
import type { ReactNode } from "react";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : ("en" as Locale);

  return buildLocalizedMetadata({
    locale,
    path: "/owner",
    title: "Owner Dashboard",
    description: "Manage listings, media, subscriptions, and enquiries in the AlgarveOfficial owner portal.",
    noIndex: true,
  });
}

export default function LocaleOwnerLayout({ children }: { children: ReactNode }) {
  return children;
}
