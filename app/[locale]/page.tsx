import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HydrationBoundary } from "@tanstack/react-query";
import Index from "@/components/Index";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDehydratedHomePageState } from "@/lib/homepage-data";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const HOME_METADATA: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  },
  "pt-pt": {
    title: "AlgarveOfficial | Villas de Luxo, Golfe e Restaurantes",
    description:
      "Descubra as melhores villas, restaurantes e campos de golfe do Algarve, selecionados por especialistas que conhecem cada recanto da costa mais prestigiada de Portugal.",
  },
  fr: {
    title: "AlgarveOfficial | Villas de Luxe, Golf et Restaurants",
    description:
      "Découvrez les meilleures villas, restaurants et parcours de golf de l'Algarve, sélectionnés par des experts qui connaissent chaque recoin de la côte la plus prestigieuse du Portugal.",
  },
  de: {
    title: "AlgarveOfficial | Luxusvillen, Golf und Restaurants",
    description:
      "Entdecken Sie die besten Villen, Restaurants und Golfplätze der Algarve – kuratiert von Experten, die jeden Winkel der prestigeträchtigsten Küste Portugals kennen.",
  },
  es: {
    title: "AlgarveOfficial | Villas de Lujo, Golf y Restaurantes",
    description:
      "Descubre las mejores villas, restaurantes y campos de golf del Algarve, seleccionados por expertos que conocen cada rincón de la costa más prestigiosa de Portugal.",
  },
  it: {
    title: "AlgarveOfficial | Ville di Lusso, Golf e Ristoranti",
    description:
      "Scopri le migliori ville, ristoranti e campi da golf dell'Algarve, selezionati da esperti che conoscono ogni angolo della costa più prestigiosa del Portogallo.",
  },
  nl: {
    title: "AlgarveOfficial | Luxe Villa's, Golf en Restaurants",
    description:
      "Ontdek de beste villa's, restaurants en golfbanen van de Algarve, samengesteld door experts die elke hoek van de meest prestigieuze kust van Portugal kennen.",
  },
  sv: {
    title: "AlgarveOfficial | Lyxvillor, Golf och Restauranger",
    description:
      "Upptäck Algarves bästa villor, restauranger och golfbanor, utvalda av experter som känner varje del av Portugals mest prestigefyllda kust.",
  },
  no: {
    title: "AlgarveOfficial | Luksusvillaer, Golf og Restauranter",
    description:
      "Oppdag Algarves beste villaer, restauranter og golfbaner, kuratert av eksperter som kjenner hver del av Portugals mest prestisjefylte kyst.",
  },
  da: {
    title: "AlgarveOfficial | Luksusvillaer, Golf og Restauranter",
    description:
      "Opdag Algarves bedste villaer, restauranter og golfbaner, kurateret af eksperter der kender hver del af Portugals mest prestigefyldte kyst.",
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
  const { dehydratedState } = await getDehydratedHomePageState(locale);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<RouteLoadingState />}>
        <Index />
      </Suspense>
    </HydrationBoundary>
  );
}
