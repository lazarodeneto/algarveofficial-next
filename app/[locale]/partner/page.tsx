import { cache } from "react";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildWebPageSchema, buildFaqSchema } from "@/lib/seo/schemaBuilders.js";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import PartnerClient from "@/components/partner/PartnerClient";
import type { PartnerSettings } from "@/hooks/usePartnerSettings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";
export const revalidate = 3600;

export interface FAQ {
  question: string;
  answer: string;
}

function normalizeFaqs(value: unknown): FAQ[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      return {
        question: String(candidate.question ?? "").trim(),
        answer: String(candidate.answer ?? "").trim(),
      };
    })
    .filter((item) => item.question && item.answer);
}

const getPartnerSettings = cache(async (): Promise<PartnerSettings | null> => {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("partner_settings")
    .select(
      [
        "id",
        "hero_title",
        "hero_subtitle",
        "new_listing_title",
        "new_listing_description",
        "new_listing_cta",
        "claim_business_title",
        "claim_business_description",
        "claim_business_cta",
        "form_title",
        "success_message",
        "benefits_title",
        "benefit_1_title",
        "benefit_1_description",
        "benefit_2_title",
        "benefit_2_description",
        "benefit_3_title",
        "benefit_3_description",
        "faq_title",
        "faqs",
        "meta_title",
        "meta_description",
        "updated_at",
      ].join(", "),
    )
    .eq("id", "default")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rawSettings = data as unknown as Record<string, unknown> & { faqs?: unknown };
  return {
    ...rawSettings,
    faqs: normalizeFaqs(rawSettings.faqs),
  } as unknown as PartnerSettings;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const settings = await getPartnerSettings();

  return buildPageMetadata({
    title: settings?.meta_title || "Partner with AlgarveOfficial | List Your Business",
    description:
      settings?.meta_description ||
      "Apply to list or claim your Algarve business and connect with travelers seeking premium stays, dining, services, and experiences.",
    localizedRoute: buildStaticRouteData("partner"),
    locale: resolvedLocale,
  });
}

export default async function LocalePartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const settings = await getPartnerSettings();

  const canonicalUrl = buildAbsoluteRouteUrl(
    resolvedLocale,
    buildStaticRouteData("partner"),
  );

  const pageSchema = buildWebPageSchema({
    type: "WebPage",
    name: settings?.hero_title || "Partner with AlgarveOfficial",
    description:
      settings?.meta_description ||
      settings?.hero_subtitle ||
      "Apply to list or claim your Algarve business and connect with travelers, buyers, and residents seeking premium services.",
    url: canonicalUrl,
    image: `${SITE_URL}/og-image.png`,
    siteUrl: SITE_URL,
  });

  const faqSchema = settings?.faqs?.length ? buildFaqSchema(settings.faqs) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <div id="partner-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              Partner
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {settings?.hero_title || "Partner with AlgarveOfficial"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {settings?.hero_subtitle ||
                "Apply to list or claim your Algarve business and connect with travelers, buyers, and residents seeking premium services."}
            </p>
          </section>
        </main>
      </div>

      <PartnerClient initialPartnerSettings={settings} />
    </>
  );
}
