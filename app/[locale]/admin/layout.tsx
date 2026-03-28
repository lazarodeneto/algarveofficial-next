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
    path: "/admin",
    title: "Admin Dashboard",
    description: "AlgarveOfficial administration area.",
    noIndex: true,
  });
}

export default function LocaleAdminLayout({ children }: { children: ReactNode }) {
  return children;
}
