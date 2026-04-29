import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import PropertiesClient from "@/components/properties/PropertiesClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

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

export default function PropertiesPage() {
  return <PropertiesClient />;
}
