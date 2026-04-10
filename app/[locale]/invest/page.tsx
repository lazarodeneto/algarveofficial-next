import { Suspense } from "react";
import type { Metadata } from "next";

import InvestClient from "@/components/invest/InvestClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
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
    path: "/invest",
    title: "Invest in the Algarve",
    description:
      "Explore Algarve investment opportunities, city market context, and a practical acquisition planning flow for long-term value.",
    keywords: [
      "invest in Algarve",
      "Algarve property investment",
      "Algarve market insights",
      "Portugal real estate investment",
    ],
  });
}

export default function InvestPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <InvestClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
