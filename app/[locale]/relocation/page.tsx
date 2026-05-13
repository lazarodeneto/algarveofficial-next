import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home, MapPin, ShieldCheck } from "lucide-react";

import LiveClient from "@/components/live/LiveClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { getServerTranslations } from "@/lib/i18n/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

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

const RELOCATION_SERVER_KEYS = [
  "serverPages.relocation.badge",
  "serverPages.relocation.primaryCta",
  "serverPages.relocation.secondaryCta",
  "serverPages.relocation.roadmapAria",
  "serverPages.relocation.steps.residency.title",
  "serverPages.relocation.steps.residency.description",
  "serverPages.relocation.steps.base.title",
  "serverPages.relocation.steps.base.description",
  "serverPages.relocation.steps.home.title",
  "serverPages.relocation.steps.home.description",
  "serverPages.relocation.basesTitle",
  "serverPages.relocation.emptyCities",
] as const;

const RELOCATION_SERVER_FALLBACK: Record<(typeof RELOCATION_SERVER_KEYS)[number], string> = {
  "serverPages.relocation.badge": "Relocation",
  "serverPages.relocation.primaryCta": "Talk to AlgarveOfficial",
  "serverPages.relocation.secondaryCta": "Browse properties",
  "serverPages.relocation.roadmapAria": "Relocation roadmap",
  "serverPages.relocation.steps.residency.title": "Plan residency and paperwork",
  "serverPages.relocation.steps.residency.description":
    "Understand documents, timelines, healthcare, tax, and practical arrival steps before you move.",
  "serverPages.relocation.steps.base.title": "Choose a base",
  "serverPages.relocation.steps.base.description":
    "Compare Algarve towns, coastal lifestyles, schools, services, and travel links.",
  "serverPages.relocation.steps.home.title": "Find a home",
  "serverPages.relocation.steps.home.description":
    "Connect relocation planning with property search, trusted services, and local support.",
  "serverPages.relocation.basesTitle": "Explore Algarve bases",
  "serverPages.relocation.emptyCities": "City guides will appear here when destination data is available.",
};

function relocationCopy(copy: Record<string, string>, key: (typeof RELOCATION_SERVER_KEYS)[number]) {
  return copy[key] ?? RELOCATION_SERVER_FALLBACK[key];
}

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

async function fetchRelocationCities() {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, short_description")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(6);

  if (error || !data) return [];
  return data;
}

function RelocationServerShell({
  locale,
  title,
  description,
  cities,
  copy,
}: {
  locale: Locale;
  title: string;
  description: string;
  cities: Awaited<ReturnType<typeof fetchRelocationCities>>;
  copy: Record<string, string>;
}) {
  const steps = [
    {
      title: relocationCopy(copy, "serverPages.relocation.steps.residency.title"),
      description: relocationCopy(copy, "serverPages.relocation.steps.residency.description"),
      Icon: ShieldCheck,
    },
    {
      title: relocationCopy(copy, "serverPages.relocation.steps.base.title"),
      description: relocationCopy(copy, "serverPages.relocation.steps.base.description"),
      Icon: MapPin,
    },
    {
      title: relocationCopy(copy, "serverPages.relocation.steps.home.title"),
      description: relocationCopy(copy, "serverPages.relocation.steps.home.description"),
      Icon: Home,
    },
  ];

  return (
    <div id="live-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        <section className="mb-10 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {relocationCopy(copy, "serverPages.relocation.badge")}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={buildLocalizedPath(locale, "/contact")}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {relocationCopy(copy, "serverPages.relocation.primaryCta")}
            </Link>
            <Link
              href={buildLocalizedPath(locale, "/properties")}
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
            >
              {relocationCopy(copy, "serverPages.relocation.secondaryCta")}
            </Link>
          </div>
        </section>

        <section aria-label={relocationCopy(copy, "serverPages.relocation.roadmapAria")} className="grid gap-4 lg:grid-cols-3">
          {steps.map(({ title: stepTitle, description: stepDescription, Icon }) => (
            <article key={stepTitle} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <h2 className="font-serif text-xl">{stepTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{stepDescription}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-lg border border-border bg-card/80 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl">{relocationCopy(copy, "serverPages.relocation.basesTitle")}</h2>
          </div>
          {cities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {relocationCopy(copy, "serverPages.relocation.emptyCities")}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  href={buildLocalizedPath(locale, `/visit/${city.slug}`)}
                  className="rounded-md border border-border bg-background px-4 py-3 transition hover:border-primary/40"
                >
                  <span className="font-medium text-foreground">{city.name}</span>
                  {city.short_description ? (
                    <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {city.short_description}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default async function RelocationPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  const [cities, copy] = await Promise.all([
    fetchRelocationCities(),
    getServerTranslations(locale, [...RELOCATION_SERVER_KEYS]),
  ]);
  const meta = RELOCATION_META[locale];

  return (
    <>
      <RelocationServerShell
        locale={locale}
        title={meta.title}
        description={meta.description}
        cities={cities}
        copy={copy}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <LiveClient initialGlobalSettings={[]} />
      </Suspense>
    </>
  );
}
