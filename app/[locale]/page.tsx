import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary } from "@tanstack/react-query";
import Index from "@/components/Index";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDehydratedHomeCriticalState } from "@/lib/homepage-data";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

const HOME_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Discover the Algarve’s Best Places to Stay, Eat and Invest",
    description:
      "A curated selection of the region's finest hotels, restaurants, experiences and properties, with full directory search across the Algarve.",
  },
  "pt-pt": {
    title: "Descubra os melhores lugares do Algarve para ficar, comer e investir",
    description:
      "Uma seleção cuidada dos melhores hotéis, restaurantes, experiências e propriedades da região, com pesquisa completa no diretório em todo o Algarve.",
  },
  fr: {
    title: "Découvrez les meilleures adresses de l’Algarve où séjourner, manger et investir",
    description:
      "Une sélection soignée des meilleurs hôtels, restaurants, expériences et biens de la région, avec recherche complète dans l’annuaire de l’Algarve.",
  },
  de: {
    title: "Entdecken Sie die besten Orte der Algarve zum Übernachten, Essen und Investieren",
    description:
      "Eine kuratierte Auswahl der besten Hotels, Restaurants, Erlebnisse und Immobilien der Region, mit vollständiger Verzeichnissuche in der Algarve.",
  },
  es: {
    title: "Descubre los mejores lugares del Algarve para alojarte, comer e invertir",
    description:
      "Una selección cuidada de los mejores hoteles, restaurantes, experiencias y propiedades de la región, con búsqueda completa en el directorio del Algarve.",
  },
  it: {
    title: "Scopri i migliori luoghi dell’Algarve dove soggiornare, mangiare e investire",
    description:
      "Una selezione curata dei migliori hotel, ristoranti, esperienze e proprietà della regione, con ricerca completa nella directory dell’Algarve.",
  },
  nl: {
    title: "Ontdek de beste plekken in de Algarve om te verblijven, eten en investeren",
    description:
      "Een zorgvuldig samengestelde selectie van de beste hotels, restaurants, ervaringen en panden in de regio, met volledige zoekfunctie in de Algarve-gids.",
  },
  sv: {
    title: "Upptäck Algarves bästa platser att bo, äta och investera på",
    description:
      "Ett kurerat urval av regionens bästa hotell, restauranger, upplevelser och fastigheter, med komplett katalogsökning i hela Algarve.",
  },
  no: {
    title: "Oppdag Algarves beste steder å bo, spise og investere",
    description:
      "Et kuratert utvalg av regionens beste hoteller, restauranter, opplevelser og eiendommer, med komplett katalogsøk i hele Algarve.",
  },
  da: {
    title: "Oplev Algarves bedste steder at bo, spise og investere",
    description:
      "Et kurateret udvalg af regionens bedste hoteller, restauranter, oplevelser og ejendomme, med komplet katalogsøgning i hele Algarve.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const metadata = HOME_METADATA[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/",
    title: metadata.title,
    description: metadata.description,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const { dehydratedState } = await getDehydratedHomeCriticalState(locale);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Index />
    </HydrationBoundary>
  );
}
