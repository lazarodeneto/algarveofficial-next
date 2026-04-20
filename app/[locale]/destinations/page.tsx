import type { Metadata } from "next";
import { DestinationsClient } from "@/components/destinations/DestinationsClient";
import {
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const DESTINATIONS_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Algarve Destinations",
    description:
      "Explore Algarve destinations by city and region — discover the best of Lagos, Albufeira, Vilamoura, Tavira and more across Portugal's southern coast.",
  },
  "pt-pt": {
    title: "Destinos do Algarve",
    description:
      "Explore os destinos do Algarve por cidade e região — descubra o melhor de Lagos, Albufeira, Vilamoura, Tavira e muito mais.",
  },
  fr: {
    title: "Destinations en Algarve",
    description:
      "Explorez les destinations de l'Algarve par ville et région — découvrez le meilleur de Lagos, Albufeira, Vilamoura, Tavira et plus encore.",
  },
  de: {
    title: "Reiseziele in der Algarve",
    description:
      "Erkunden Sie die Algarve nach Städten und Regionen — entdecken Sie das Beste aus Lagos, Albufeira, Vilamoura, Tavira und mehr.",
  },
  es: {
    title: "Destinos en el Algarve",
    description:
      "Explora los destinos del Algarve por ciudad y región — descubre lo mejor de Lagos, Albufeira, Vilamoura, Tavira y más.",
  },
  it: {
    title: "Destinazioni in Algarve",
    description:
      "Esplora le destinazioni dell'Algarve per città e regione — scopri il meglio di Lagos, Albufeira, Vilamoura, Tavira e altro ancora.",
  },
  nl: {
    title: "Bestemmingen in de Algarve",
    description:
      "Verken Algarve-bestemmingen per stad en regio — ontdek het beste van Lagos, Albufeira, Vilamoura, Tavira en meer.",
  },
  sv: {
    title: "Resmål i Algarve",
    description:
      "Utforska Algarves resmål per stad och region — upptäck det bästa av Lagos, Albufeira, Vilamoura, Tavira och mer.",
  },
  no: {
    title: "Reisemål i Algarve",
    description:
      "Utforsk Algarves reisemål etter by og region — oppdag det beste av Lagos, Albufeira, Vilamoura, Tavira og mer.",
  },
  da: {
    title: "Rejsemål i Algarve",
    description:
      "Udforsk Algarves rejsemål efter by og region — oplev det bedste af Lagos, Albufeira, Vilamoura, Tavira og mere.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = DESTINATIONS_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/destinations",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve destinations", "Algarve cities", "Lagos", "Albufeira", "Vilamoura", "Tavira"],
  });
}

export default async function DestinationsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const tx = await getServerTranslations(locale, [
    "nav.home",
    "nav.destinations",
    "sections.regions.featured",
    "sections.regions.featuredSubtitle",
    "sections.regions.more",
    "sections.regions.moreSubtitle",
    "sections.regions.cantDecide",
    "sections.regions.cantDecideSubtitle",
  ]);

  const pageUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("destinations"));
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const pageTitle = tx["nav.destinations"] ?? "Destinations";
  const pageDescription =
    tx["sections.regions.featuredSubtitle"] ??
    "Explore Algarve destinations by city and region with curated local highlights and travel inspiration.";
  const pageSchema = buildWebPageSchema({
    type: "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    image: `${SITE_URL}/og-image.png`,
    siteUrl: SITE_URL,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tx["nav.home"] ?? "Home", url: homeUrl },
    { name: pageTitle, url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div id="destinations-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {tx["sections.regions.featured"] ?? "Featured Destinations"}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {pageDescription}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {tx["sections.regions.featured"] ?? "Featured Destinations"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tx["sections.regions.featuredSubtitle"] ?? "Our most sought-after premium regions."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {tx["sections.regions.more"] ?? "More Destinations"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tx["sections.regions.moreSubtitle"] ?? "Discover hidden gems across the Algarve."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {tx["sections.regions.cantDecide"] ?? "Need help choosing?"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tx["sections.regions.cantDecideSubtitle"] ??
                    "Our concierge team can help you choose the right Algarve base for your trip."}
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <DestinationsClient initialRegions={[]} />
    </>
  );
}
