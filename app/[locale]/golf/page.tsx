import type { Metadata } from "next";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import GolfClient from "@/components/golf/GolfClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const GOLF_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Golf in the Algarve",
    description:
      "Explore world-class golf courses across the Algarve — championship links, clifftop fairways and year-round sunshine on Portugal's finest golf coast.",
  },
  "pt-pt": {
    title: "Golfe no Algarve",
    description:
      "Explore campos de golfe de classe mundial no Algarve — percursos de campeonato, fairways com vista para o oceano e sol durante todo o ano.",
  },
  fr: {
    title: "Golf en Algarve",
    description:
      "Découvrez les meilleurs parcours de golf de l'Algarve — des links de championnat aux fairways sur falaise avec vue sur l'Atlantique.",
  },
  de: {
    title: "Golf in der Algarve",
    description:
      "Entdecken Sie Weltklasse-Golfplätze in der Algarve — Meisterschaftsplätze, Fairways mit Meeresblick und Sonnenschein das ganze Jahr.",
  },
  es: {
    title: "Golf en el Algarve",
    description:
      "Explora los mejores campos de golf del Algarve — links de campeonato, fairways junto a los acantilados y sol durante todo el año.",
  },
  it: {
    title: "Golf in Algarve",
    description:
      "Esplora i campi da golf di livello mondiale in Algarve — percorsi da campionato, fairway sulle scogliere e sole tutto l'anno.",
  },
  nl: {
    title: "Golf in de Algarve",
    description:
      "Ontdek wereldklasse golfbanen in de Algarve — kampioenschapsbanen, kliffairways met uitzicht op de Atlantische Oceaan en het hele jaar zon.",
  },
  sv: {
    title: "Golf i Algarve",
    description:
      "Utforska världsklassens golfbanor i Algarve — mästerskapsgolfbanor, klippfairways med havsutsikt och sol hela året.",
  },
  no: {
    title: "Golf i Algarve",
    description:
      "Utforsk verdensklasse golfbaner i Algarve — mesterskapsanlegg, fairways med havutsikt og sol hele året.",
  },
  da: {
    title: "Golf i Algarve",
    description:
      "Udforsk verdensklasse golfbaner i Algarve — mesterskabsbaner, klippefairways med havudsigt og sol hele året.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = GOLF_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/golf",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve golf", "golf courses Portugal", "Algarve golf courses", "golf holidays Algarve"],
  });
}

export default function GolfPage() {
  return <GolfClient />;
}
