import { Suspense } from "react";
import type { Metadata } from "next";

import Login from "@/legacy-pages/auth/Login";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildHreflangs } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const metadata = buildLocalizedMetadata({
    locale,
    path: "/login",
    title: "Log In",
    description: "Access your AlgarveOfficial account to manage favourites, trips, listings, and messages.",
    noIndex: true,
  });

  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as { canonical?: string } | undefined)?.canonical,
      languages: buildHreflangs("/login"),
    } as Metadata["alternates"],
  };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Login />
    </Suspense>
  );
}
