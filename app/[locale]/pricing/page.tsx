import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingClient } from "@/components/pricing/PricingClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildPageMetadata({
    title: "Partner Pricing | AlgarveOfficial",
    description:
      "Transparent pricing for every stage of growth. From Verified visibility to Signature placement. See ROI estimates for Algarve partners.",
    localizedRoute: buildStaticRouteData("pricing"),
    locale,
  });
}

export default function LocalePricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PricingClient />
      <Footer />
    </div>
  );
}
