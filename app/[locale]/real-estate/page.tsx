import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedAliasMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/advanced/schema-builders";
import RealEstateDirectoryClient from "@/components/real-estate/RealEstateDirectoryClient";
import { getRealEstateDirectoryData } from "@/lib/real-estate/directory-data";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 300;

const REAL_ESTATE_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Real Estate in the Algarve",
    description:
      "Find premium villas, apartments and investment properties for sale across the Algarve — expert-curated listings in Portugal's most sought-after coastal destination.",
  },
  "pt-pt": {
    title: "Imobiliário no Algarve",
    description:
      "Encontre moradias de luxo, apartamentos e propriedades de investimento à venda no Algarve — seleção de especialistas no destino costeiro mais procurado de Portugal.",
  },
  fr: {
    title: "Immobilier en Algarve",
    description:
      "Trouvez des villas de luxe, des appartements et des propriétés d'investissement à vendre en Algarve — sélection d'experts dans la destination côtière la plus prisée du Portugal.",
  },
  de: {
    title: "Immobilien zum Kauf in der Algarve",
    description:
      "Finden Sie Luxusvillen, Apartments und Investitionsobjekte zum Kauf in der Algarve — von Experten kuratierte Angebote an Portugals begehrtestem Küstenziel.",
  },
  es: {
    title: "Inmobiliaria en el Algarve",
    description:
      "Encuentra villas de lujo, apartamentos y propiedades de inversión en venta en el Algarve — selección de expertos en el destino costero más codiciado de Portugal.",
  },
  it: {
    title: "Immobiliare in Algarve",
    description:
      "Trova ville di lusso, appartamenti e proprietà di investimento in vendita in Algarve — una selezione curata di esperti nella destinazione costiera più ambita del Portogallo.",
  },
  nl: {
    title: "Vastgoed in de Algarve",
    description:
      "Vind luxe villa's, appartementen en investeringspanden te koop in de Algarve — door experts samengesteld aanbod in Portugal's meest gewilde kustbestemming.",
  },
  sv: {
    title: "Fastigheter till salu i Algarve",
    description:
      "Hitta lyxvillor, lägenheter och investeringsfastigheter till salu i Algarve — expertvalda listor i Portugals mest eftertraktade kustdestination.",
  },
  no: {
    title: "Eiendom til salgs i Algarve",
    description:
      "Finn luksusvilla, leiligheter og investeringseiendommer til salgs i Algarve — ekspertvalgte annonser i Portugals mest attraktive kystdestinasjon.",
  },
  da: {
    title: "Fast ejendom i Algarve",
    description:
      "Find luksusvilla'er, lejligheder og investeringsejendomme til salg i Algarve — ekspertudvalgte boliger i Portugals mest eftertragtede kystdestination.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = REAL_ESTATE_META[locale];
  return buildLocalizedAliasMetadata({
    locale,
    canonicalPath: "/properties",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve real estate", "property for sale Algarve", "premium villas Portugal", "Algarve investment property"],
  });
}

interface RealEstateServerShellProps {
  locale: Locale;
  title: string;
  description: string;
  listings: Awaited<ReturnType<typeof getRealEstateDirectoryData>>["listings"];
}

function RealEstateServerShell({
  locale,
  title,
  description,
  listings,
}: RealEstateServerShellProps) {
  return (
    <div id="real-estate-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        <section className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Real estate directory
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <Link href={buildLocalizedPath(locale, "/properties")} className="text-primary underline-offset-4 hover:underline">
              Browse properties
            </Link>
            <Link href={buildLocalizedPath(locale, "/map")} className="text-primary underline-offset-4 hover:underline">
              Open map
            </Link>
          </div>
        </section>

        {listings.length === 0 ? (
          <section className="rounded-lg border border-border bg-card/80 p-8 text-center shadow-sm">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="font-serif text-2xl">No published real estate listings available</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Published property listings will appear here when available.
            </p>
          </section>
        ) : (
          <section aria-label="Published real estate listings" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 9).map((listing) => (
              <Link
                key={listing.id}
                href={buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`)}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:border-primary/40"
              >
                {listing.featured_image_url ? (
                  <img
                    src={listing.featured_image_url}
                    alt={listing.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-muted">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {listing.cities?.name ?? "Algarve"}
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

export default async function RealEstatePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  const meta = REAL_ESTATE_META[locale];
  const data = await getRealEstateDirectoryData(locale, 100);
  const canonicalPropertiesPath = buildLocalizedPath(locale, "/properties");
  const itemListSchema = buildItemListSchema(
    meta.title,
    data.listings.map((listing) => ({
      name: listing.name,
      url: buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`),
      description: listing.short_description ?? undefined,
      image: listing.featured_image_url ?? undefined,
    })),
    canonicalPropertiesPath,
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: buildLocalizedPath(locale, "/") },
    { name: meta.title, url: canonicalPropertiesPath },
  ]);

  return (
    <>
      <script
        id="schema-real-estate-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        id="schema-real-estate-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RealEstateServerShell
        locale={locale}
        title={meta.title}
        description={meta.description}
        listings={data.listings}
      />
      {data.category ? (
        <RealEstateDirectoryClient
          initialCategory={data.category}
          initialListings={data.listings}
        />
      ) : null}
    </>
  );
}
