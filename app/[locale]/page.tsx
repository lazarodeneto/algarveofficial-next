import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { HomePageClient } from "@/components/home/HomePageClient";
import { getHomePageData } from "@/lib/homepage-data";

const HOMEPAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
  },
  "pt-pt": {
    title: "AlgarveOfficial | Vilas de Luxo, Golfe & Restaurantes",
    description:
      "Descubra as melhores villas, restaurantes e campos de golfe do Algarve — selecionados por especialistas que conhecem cada recanto da costa mais prestigiada de Portugal.",
  },
  fr: {
    title: "AlgarveOfficial | Villas de Luxe, Golf & Restaurants",
    description:
      "Découvrez les meilleures villas, restaurants et parcours de golf de l'Algarve — sélectionnés par des experts qui connaissent chaque recoin de la côte portugaise la plus prestigieuse.",
  },
  de: {
    title: "AlgarveOfficial | Luxusvillen, Golf & Restaurants",
    description:
      "Entdecken Sie die besten Villen, Restaurants und Golfplätze der Algarve — von Experten kuratiert, die jede Ecke der renommiertesten Küste Portugals kennen.",
  },
  es: {
    title: "AlgarveOfficial | Villas de Lujo, Golf & Restaurantes",
    description:
      "Descubra las mejores villas, restaurantes y campos de golf del Algarve — seleccionados por expertos que conocen cada rincón de la costa más exclusiva de Portugal.",
  },
  nl: {
    title: "AlgarveOfficial | Luxe Villa's, Golf & Restaurants",
    description:
      "Ontdek de beste villa's, restaurants en golfbanen van de Algarve — samengesteld door experts die elke uithoek van Portugal's meest gerenommeerde kust kennen.",
  },
};

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleHomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const meta = HOMEPAGE_META[resolvedLocale] ?? HOMEPAGE_META.en;

  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    locale: resolvedLocale,
    localizedPath: "/",
  });
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getHomePageData(resolvedLocale);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <HomePageClient
          homepageSettings={data.homepageSettings}
          regions={data.regions}
          categories={data.categories}
          allCategories={data.allCategories}
          cities={data.cities}
          listings={data.listings}
          curatedAssignments={data.curatedAssignments}
          globalSettings={data.globalSettings}
          locale={resolvedLocale}
        />
      </Suspense>
    </>
  );
}
