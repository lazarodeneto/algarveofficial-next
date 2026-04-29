import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import RealEstateDirectory from "@/legacy-pages/public/RealEstateDirectory";

interface PageProps {
  params: Promise<{ locale: string }>;
}

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
  return buildLocalizedMetadata({
    locale,
    path: "/real-estate",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve real estate", "property for sale Algarve", "premium villas Portugal", "Algarve investment property"],
  });
}

export default function RealEstatePage() {
  return <RealEstateDirectory />;
}
