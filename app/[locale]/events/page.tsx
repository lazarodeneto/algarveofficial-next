import type { Metadata } from "next";
import { Suspense } from "react";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import Events from "@/legacy-pages/public/events/Events";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const EVENTS_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Events in the Algarve",
    description:
      "Discover upcoming events, festivals and things to do across the Algarve — from beach parties and concerts to cultural celebrations and food fairs.",
  },
  "pt-pt": {
    title: "Eventos no Algarve",
    description:
      "Descubra os próximos eventos, festivais e atividades no Algarve — de festas na praia e concertos a celebrações culturais e feiras gastronómicas.",
  },
  fr: {
    title: "Événements en Algarve",
    description:
      "Découvrez les prochains événements, festivals et activités en Algarve — des fêtes de plage aux célébrations culturelles.",
  },
  de: {
    title: "Veranstaltungen in der Algarve",
    description:
      "Entdecken Sie kommende Events, Festivals und Aktivitäten in der Algarve — von Strandpartys bis hin zu Kulturveranstaltungen.",
  },
  es: {
    title: "Eventos en el Algarve",
    description:
      "Descubre próximos eventos, festivales y actividades en el Algarve — desde fiestas en la playa hasta celebraciones culturales.",
  },
  it: {
    title: "Eventi in Algarve",
    description:
      "Scopri i prossimi eventi, festival e attività in Algarve — dalle feste in spiaggia alle celebrazioni culturali.",
  },
  nl: {
    title: "Evenementen in de Algarve",
    description:
      "Ontdek aankomende evenementen, festivals en activiteiten in de Algarve — van strandfeesten tot culturele vieringen.",
  },
  sv: {
    title: "Evenemang i Algarve",
    description:
      "Upptäck kommande evenemang, festivaler och aktiviteter i Algarve — från strandfester till kulturella firanden.",
  },
  no: {
    title: "Arrangementer i Algarve",
    description:
      "Oppdag kommende arrangementer, festivaler og aktiviteter i Algarve — fra strandfester til kulturelle feiringer.",
  },
  da: {
    title: "Arrangementer i Algarve",
    description:
      "Oplev kommende arrangementer, festivaler og aktiviteter i Algarve — fra strandfester til kulturelle fejringer.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;
  const meta = EVENTS_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/events",
    title: meta.title,
    description: meta.description,
    keywords: ["Algarve events", "events Portugal", "Algarve festivals", "things to do Algarve"],
  });
}

export default function EventsPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Events />
    </Suspense>
  );
}
