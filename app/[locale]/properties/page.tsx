import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/advanced/schema-builders";
import PropertiesClient from "@/components/properties/PropertiesClient";
import { getRealEstateDirectoryData } from "@/lib/real-estate/directory-data";
import { getServerTranslations } from "@/lib/i18n/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 300;

const PROPERTIES_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Properties in the Algarve",
    description:
      "Browse premium properties for sale and rent across the Algarve — premium villas, sea-view apartments and investment opportunities on Portugal's finest coast.",
  },
  "pt-pt": {
    title: "Propriedades no Algarve",
    description:
      "Explore propriedades premium à venda e para arrendamento no Algarve — moradias de luxo, apartamentos com vista mar e oportunidades de investimento.",
  },
  fr: {
    title: "Propriétés en Algarve",
    description:
      "Découvrez des propriétés premium à la vente et à la location en Algarve — villas de luxe, appartements avec vue mer et opportunités d'investissement.",
  },
  de: {
    title: "Immobilien in der Algarve",
    description:
      "Entdecken Sie Premium-Immobilien zum Kauf und zur Miete in der Algarve — Luxusvillen, Meerblick-Apartments und Investitionsmöglichkeiten.",
  },
  es: {
    title: "Propiedades en el Algarve",
    description:
      "Explore propiedades premium en venta y alquiler en el Algarve — villas de lujo, apartamentos con vistas al mar y oportunidades de inversión.",
  },
  it: {
    title: "Proprietà in Algarve",
    description:
      "Scopri proprietà premium in vendita e affitto in Algarve — ville di lusso, appartamenti con vista mare e opportunità di investimento.",
  },
  nl: {
    title: "Woningen in de Algarve",
    description:
      "Bekijk premium woningen te koop en te huur in de Algarve — luxe villa's, appartementen met zeezicht en investeringsmogelijkheden.",
  },
  sv: {
    title: "Fastigheter i Algarve",
    description:
      "Utforska premiumfastigheter till salu och uthyrning i Algarve — lyxvillor, havsutsiктslägenheter och investeringsmöjligheter.",
  },
  no: {
    title: "Eiendommer i Algarve",
    description:
      "Utforsk premium-eiendommer til salgs og leie i Algarve — luksusvilla, leiligheter med havutsikt og investeringsmuligheter.",
  },
  da: {
    title: "Ejendomme i Algarve",
    description:
      "Udforsk premium-ejendomme til salg og leje i Algarve — luksusvilla'er, lejligheder med havudsigt og investeringsmuligheder.",
  },
};

const PROPERTIES_SERVER_KEYS = [
  "serverPages.properties.badge",
  "serverPages.properties.emptyTitle",
  "serverPages.properties.emptyDescription",
  "serverPages.properties.listingsAria",
  "serverPages.common.algarve",
] as const;

const PROPERTIES_SERVER_FALLBACK: Record<(typeof PROPERTIES_SERVER_KEYS)[number], string> = {
  "serverPages.properties.badge": "AlgarveOfficial",
  "serverPages.properties.emptyTitle": "No published properties available",
  "serverPages.properties.emptyDescription": "Property listings will appear here once they are published.",
  "serverPages.properties.listingsAria": "Published property listings",
  "serverPages.common.algarve": "Algarve",
};

function propertiesCopy(copy: Record<string, string>, key: (typeof PROPERTIES_SERVER_KEYS)[number]) {
  return copy[key] ?? PROPERTIES_SERVER_FALLBACK[key];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = PROPERTIES_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/properties",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve properties", "Algarve real estate", "villas Algarve", "property Portugal"],
  });
}

interface PropertiesServerShellProps {
  locale: Locale;
  title: string;
  description: string;
  listings: Awaited<ReturnType<typeof getRealEstateDirectoryData>>["listings"];
  copy: Record<string, string>;
}

function PropertiesServerShell({
  locale,
  title,
  description,
  listings,
  copy,
}: PropertiesServerShellProps) {
  return (
    <div id="properties-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        <section className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {propertiesCopy(copy, "serverPages.properties.badge")}
          </p>
          <p className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {title}
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </section>

        {listings.length === 0 ? (
          <section className="rounded-lg border border-border bg-card/80 p-8 text-center shadow-sm">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="font-serif text-2xl">{propertiesCopy(copy, "serverPages.properties.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {propertiesCopy(copy, "serverPages.properties.emptyDescription")}
            </p>
          </section>
        ) : (
          <section aria-label={propertiesCopy(copy, "serverPages.properties.listingsAria")} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 12).map((listing) => (
              <Link
                key={listing.id}
                href={buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`)}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:border-primary/40"
              >
                {listing.featured_image_url ? (
                  <Image
                    src={listing.featured_image_url}
                    alt={listing.name}
                    className="h-44 w-full object-cover"
                    width={640}
                    height={352}
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-muted">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {listing.cities?.name ?? propertiesCopy(copy, "serverPages.common.algarve")}
                  </p>
                  <h2 className="font-serif text-xl leading-snug group-hover:text-primary">
                    {listing.name}
                  </h2>
                  {listing.short_description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {listing.short_description}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default async function PropertiesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  const meta = PROPERTIES_META[locale];
  const [data, copy] = await Promise.all([
    getRealEstateDirectoryData(locale, 100),
    getServerTranslations(locale, [...PROPERTIES_SERVER_KEYS]),
  ]);
  const localizedPropertiesPath = buildLocalizedPath(locale, "/properties");
  const itemListSchema = buildItemListSchema(
    meta.title,
    data.listings.map((listing) => ({
      name: listing.name,
      url: buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`),
      description: listing.short_description ?? undefined,
      image: listing.featured_image_url ?? undefined,
    })),
    localizedPropertiesPath,
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: buildLocalizedPath(locale, "/") },
    { name: meta.title, url: localizedPropertiesPath },
  ]);

  return (
    <>
      <script
        id="schema-properties-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        id="schema-properties-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PropertiesServerShell
        locale={locale}
        title={meta.title}
        description={meta.description}
        listings={data.listings}
        copy={copy}
      />
      <PropertiesClient
        initialCategoryId={data.category?.id ?? null}
        initialListings={data.listings}
      />
    </>
  );
}
