export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

const DIRECTORY_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "Premium Directory | AlgarveOfficial",
    description: "Discover the finest restaurants, villas, golf courses, and experiences in the Algarve. Curated by local experts.",
  },
  "pt-pt": {
    title: "Diretório Premium | AlgarveOfficial",
    description: "Descubra os melhores restaurantes, villas, campos de golfe e experiências no Algarve. Selecionados por especialistas locais.",
  },
  fr: {
    title: "Annuaire Premium | AlgarveOfficial",
    description: "Découvrez les meilleurs restaurants, villas, parcours de golf et expériences de l'Algarve. Sélectionnés par des experts locaux.",
  },
  de: {
    title: "Premium-Verzeichnis | AlgarveOfficial",
    description: "Entdecken Sie die besten Restaurants, Villen, Golfplätze und Erlebnisse der Algarve. Von lokaler Experten kuratiert.",
  },
  es: {
    title: "Directorio Premium | AlgarveOfficial",
    description: "Descubra los mejores restaurantes, villas, campos de golf y experiencias del Algarve. Seleccionados por expertos locales.",
  },
  nl: {
    title: "Premium Directory | AlgarveOfficial",
    description: "Ontdek de beste restaurants, villa's, golfbanen en ervaringen van de Algarve. Samengesteld door lokale experts.",
  },
};

interface LocaleDirectoryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleDirectoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const meta = DIRECTORY_META[resolvedLocale] ?? DIRECTORY_META.en;

  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    localizedPath: "/directory",
    locale: resolvedLocale,
  });
}

export default async function LocaleDirectoryPage({ params }: LocaleDirectoryPageProps) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;

  return (
    <DirectoryClient
      locale={resolvedLocale}
      initialListings={[]}
      initialCities={[]}
      initialRegions={[]}
      initialCategories={[]}
      initialCategoryCounts={{}}
      initialFilters={{ q: "", city: "", region: "", category: "", tier: "" }}
      globalSettings={[]}
    />
  );
}
