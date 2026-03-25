import { Suspense } from "react";
import type { Metadata } from "next";

import InvestClient from "@/components/invest/InvestClient";
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
    path: "/invest",
    title: "Invest in the Algarve",
    description: "Explore premium investment opportunities in the Algarve, including prime real estate, relocation strategy, rental demand, and long-term wealth positioning in Southern Portugal.",
    keywords: ["Algarve investment", "Portugal real estate investment", "Algarve property market"],
  });

  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as { canonical?: string } | undefined)?.canonical,
      languages: buildHreflangs("/invest"),
    } as Metadata["alternates"],
  };
}

export default function InvestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <InvestClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
