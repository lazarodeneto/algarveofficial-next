import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDirectoryPageData } from "@/lib/directory-data";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

const VISIT_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Discover the Best of the Algarve",
    description:
      "Explore top restaurants, hotels, beaches and experiences across the Algarve.",
  },
  "pt-pt": {
    title: "Descubra o Melhor do Algarve",
    description:
      "Explore os melhores restaurantes, hotéis, praias e experiências no Algarve.",
  },
  fr: {
    title: "Découvrez le Meilleur de l'Algarve",
    description:
      "Explorez les meilleurs restaurants, hôtels, plages et expériences en Algarve.",
  },
  de: {
    title: "Entdecken Sie das Beste der Algarve",
    description:
      "Erkunden Sie die besten Restaurants, Hotels, Strände und Erlebnisse an der Algarve.",
  },
  es: {
    title: "Descubre lo Mejor del Algarve",
    description:
      "Explora los mejores restaurantes, hoteles, playas y experiencias en el Algarve.",
  },
  it: {
    title: "Scopri il Meglio dell'Algarve",
    description:
      "Esplora i migliori ristoranti, hotel, spiagge ed esperienze in Algarve.",
  },
  nl: {
    title: "Ontdek het Beste van de Algarve",
    description:
      "Ontdek de beste restaurants, hotels, stranden en ervaringen in de Algarve.",
  },
  sv: {
    title: "Upptäck det Bästa av Algarve",
    description:
      "Utforska de bästa restaurangerna, hotellen, stränderna och upplevelserna i Algarve.",
  },
  no: {
    title: "Oppdag det Beste av Algarve",
    description:
      "Utforsk de beste restaurantene, hotellene, strendene og opplevelsene i Algarve.",
  },
  da: {
    title: "Oplev det Bedste af Algarve",
    description:
      "Udforsk de bedste restauranter, hoteller, strande og oplevelser i Algarve.",
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const meta = VISIT_META[locale];

  return buildLocalizedMetadata({
    locale,
    path: "/visit",
    title: meta.title,
    description: meta.description,
    keywords: [
      "Algarve",
      "directory",
      "restaurants",
      "hotels",
      "beaches",
      "golf",
    ],
  });
}

export default async function VisitPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const data = await getDirectoryPageData(rawLocale, {
    q: "",
    city: "all",
    region: "all",
    category: "all",
    tier: "all",
  });

  return (
    <DirectoryClient
      locale={data.locale}
      initialListings={data.listings}
      initialCities={data.cities}
      initialRegions={data.regions}
      initialCategories={data.categories}
      initialCategoryCounts={data.categoryCounts}
      initialFilters={data.filters}
      globalSettings={data.globalSettings}
    />
  );
}
