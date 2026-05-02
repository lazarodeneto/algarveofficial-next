import { Suspense } from "react";
import type { Metadata } from "next";

import LiveClient from "@/components/live/LiveClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const RELOCATION_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Relocation to the Algarve | Move, Live & Settle in Portugal",
    description: "Practical guidance, trusted services, and curated local resources for moving to the Algarve with confidence.",
  },
  "pt-pt": {
    title: "Mudança para o Algarve | Mudar, viver e instalar-se em Portugal",
    description: "Guias práticos, serviços de confiança e recursos locais selecionados para mudar para o Algarve com confiança.",
  },
  fr: {
    title: "S’installer en Algarve | Déménager, vivre et s’établir au Portugal",
    description: "Des guides pratiques, des services de confiance et des ressources locales sélectionnées pour s’installer en Algarve en toute confiance.",
  },
  de: {
    title: "Umzug an die Algarve | Umziehen, leben und ankommen in Portugal",
    description: "Praktische Orientierung, vertrauenswürdige Dienstleistungen und kuratierte lokale Ressourcen für einen sicheren Umzug an die Algarve.",
  },
  es: {
    title: "Traslado al Algarve | Mudarse, vivir e instalarse en Portugal",
    description: "Guías prácticas, servicios de confianza y recursos locales seleccionados para trasladarse al Algarve con seguridad.",
  },
  it: {
    title: "Trasferirsi in Algarve | Traslocare, vivere e stabilirsi in Portogallo",
    description: "Guide pratiche, servizi affidabili e risorse locali selezionate per trasferirsi in Algarve con sicurezza.",
  },
  nl: {
    title: "Verhuizen naar de Algarve | Verhuizen, wonen en settelen in Portugal",
    description: "Praktische gidsen, betrouwbare diensten en zorgvuldig geselecteerde lokale bronnen om met vertrouwen naar de Algarve te verhuizen.",
  },
  sv: {
    title: "Flytta till Algarve | Flytta, bo och etablera dig i Portugal",
    description: "Praktiska guider, pålitliga tjänster och utvalda lokala resurser för att flytta till Algarve med trygghet.",
  },
  no: {
    title: "Flytte til Algarve | Flytte, bo og etablere seg i Portugal",
    description: "Praktiske guider, pålitelige tjenester og utvalgte lokale ressurser for å flytte til Algarve med trygghet.",
  },
  da: {
    title: "Flytning til Algarve | Flyt, bo og etablér dig i Portugal",
    description: "Praktiske guider, pålidelige tjenester og udvalgte lokale ressourcer til at flytte til Algarve med tryghed.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const meta = RELOCATION_META[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/relocation",
    title: meta.title,
    description: meta.description,
    keywords: ["relocation to Algarve", "move to Portugal", "Algarve residency", "Algarve neighborhoods"],
  });
}

export default function RelocationPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <LiveClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
