import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildStaticRouteData, buildStaticRoutePath } from "@/lib/i18n/localized-routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildPageMetadata({
    title: "Partner Subscriptions | AlgarveOfficial",
    description:
      "Explore partner subscriptions, benefits, and application details on the Partner page.",
    localizedRoute: buildStaticRouteData("partner"),
    locale,
  });
}

export default async function LocalePricingPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  permanentRedirect(buildStaticRoutePath("partner", locale));
}
