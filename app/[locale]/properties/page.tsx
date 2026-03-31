import { Suspense } from "react";
import type { Metadata } from "next";

import InvestClient from "@/components/invest/InvestClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/properties",
    title: "Properties in the Algarve",
    description: "Explore premium property investment opportunities in the Algarve — prime real estate, rental yields, and guided acquisition strategies.",
    keywords: ["Algarve properties", "Portugal real estate", "Algarve investment", "premium property Algarve"],
  });
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <InvestClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
