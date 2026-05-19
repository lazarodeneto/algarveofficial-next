import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car,
  MapPin,
  Plane,
  Route,
} from "lucide-react";

import TravelPayoutsFlightsWidget from "@/components/flights/TravelPayoutsFlightsWidget";
import Header from "@/components/layout/Header";
import { STANDARD_PUBLIC_CONTENT_TOP_CLASS } from "@/components/sections/hero-layout";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isValidLocale, type Locale } from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildLocalizedPath,
  buildLocaleSwitchPathsForStaticRoute,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

const TRAVELPAYOUTS_FLIGHTS_WIDGET_SRC =
  "https://tpwdg.com/content?currency=usd&trs=497598&shmarker=426069&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&no_labels=&plain=true&destination=FAO&promo_id=7879&campaign_id=100";

const TRANSLATION_KEYS: string[] = [
  "nav.home",
  "nav.flights",
  "nav.stay",
  "nav.map",
  "flights.meta.title",
  "flights.meta.description",
  "flights.hero.badge",
  "flights.hero.title",
  "flights.hero.subtitle",
  "flights.hero.helper",
  "flights.hero.primaryCta",
  "flights.hero.secondaryCta",
  "flights.airports.title",
  "flights.airports.description",
  "flights.airports.faro.title",
  "flights.airports.faro.description",
  "flights.airports.lisbon.title",
  "flights.airports.lisbon.description",
  "flights.airports.seville.title",
  "flights.airports.seville.description",
  "flights.tripTypes.title",
  "flights.tripTypes.description",
  "flights.tripTypes.shortBreak.title",
  "flights.tripTypes.shortBreak.description",
  "flights.tripTypes.golf.title",
  "flights.tripTypes.golf.description",
  "flights.tripTypes.relocation.title",
  "flights.tripTypes.relocation.description",
  "flights.links.title",
  "flights.links.description",
  "flights.links.stay",
  "flights.links.map",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const tx = await getServerTranslations(locale, [
    "flights.meta.title",
    "flights.meta.description",
  ]);

  return buildLocalizedMetadata({
    locale,
    path: "/flights",
    title: tx["flights.meta.title"] ?? "Flights to the Algarve",
    description:
      tx["flights.meta.description"] ??
      "Plan flights to Faro and nearby airports for Algarve holidays, golf trips, relocation visits, and long-stay travel.",
    keywords: [
      "Algarve flights",
      "Faro Airport",
      "flights to Faro",
      "Algarve travel planning",
    ],
  });
}

export default async function FlightsLocalizedPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const tx = await getServerTranslations(locale, TRANSLATION_KEYS);
  const t = (key: string, fallback: string) => tx[key] ?? fallback;

  const pageUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("flights"));
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const localeSwitchPaths = buildLocaleSwitchPathsForStaticRoute("flights", SUPPORTED_LOCALES);
  const pageTitle = t("flights.hero.title", "Flights to the Algarve");
  const flightSearchLabel = tx["nav.flights"] ?? pageTitle;
  const pageDescription = t(
    "flights.hero.subtitle",
    "Plan flights into Faro and nearby airports, then continue your Algarve trip with trusted local guides, places, and services.",
  );
  const pageSchema = buildWebPageSchema({
    type: "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    image: `${SITE_URL}/og-image.png`,
    siteUrl: SITE_URL,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tx["nav.home"] ?? "Home", url: homeUrl },
    { name: tx["nav.flights"] ?? "Flights", url: pageUrl },
  ]);

  const airports = [
    {
      icon: Plane,
      title: t("flights.airports.faro.title", "Faro Airport"),
      description: t(
        "flights.airports.faro.description",
        "The main Algarve airport, best for most coastal stays, golf trips, and short breaks.",
      ),
    },
    {
      icon: Route,
      title: t("flights.airports.lisbon.title", "Lisbon Airport"),
      description: t(
        "flights.airports.lisbon.description",
        "A useful alternative for longer itineraries, city stopovers, and some long-haul routes.",
      ),
    },
    {
      icon: MapPin,
      title: t("flights.airports.seville.title", "Seville Airport"),
      description: t(
        "flights.airports.seville.description",
        "Practical for the eastern Algarve when flight times or fares are better.",
      ),
    },
  ];

  const tripTypes = [
    {
      icon: CalendarDays,
      title: t("flights.tripTypes.shortBreak.title", "Short breaks"),
      description: t(
        "flights.tripTypes.shortBreak.description",
        "Choose Faro for the simplest arrival and keep transfers short.",
      ),
    },
    {
      icon: Plane,
      title: t("flights.tripTypes.golf.title", "Golf trips"),
      description: t(
        "flights.tripTypes.golf.description",
        "Match tee times, accommodation, and airport transfers before you book.",
      ),
    },
    {
      icon: Car,
      title: t("flights.tripTypes.relocation.title", "Relocation visits"),
      description: t(
        "flights.tripTypes.relocation.description",
        "Compare airport access with property viewings, schools, services, and local areas.",
      ),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header localeSwitchPaths={localeSwitchPaths} />

      <main className="min-h-screen bg-background text-foreground">
        <section
          aria-label={flightSearchLabel}
          className={`app-container pb-6 ${STANDARD_PUBLIC_CONTENT_TOP_CLASS}`}
        >
          <TravelPayoutsFlightsWidget
            label={flightSearchLabel}
            scriptSrc={TRAVELPAYOUTS_FLIGHTS_WIDGET_SRC}
          />
        </section>

        <section className="app-container pb-16">
          <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="bg-black px-6 py-12 text-white md:px-10 md:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Plane className="h-4 w-4 text-primary" />
                  {t("flights.hero.badge", "Arrive well")}
                </div>
                <h1 className="mt-6 max-w-xl font-serif text-4xl leading-tight md:text-6xl">
                  {pageTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
                  {pageDescription}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
                  {t(
                    "flights.hero.helper",
                    "Useful airport context without leaving AlgarveOfficial.",
                  )}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={buildLocalizedPath(locale, buildStaticRouteData("stay"))}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    {t("flights.hero.primaryCta", "Find places to stay")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={buildLocalizedPath(locale, buildStaticRouteData("map"))}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    {t("flights.hero.secondaryCta", "Open the map")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="bg-[radial-gradient(circle_at_top_right,rgba(225,166,37,0.16),transparent_32%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))] px-6 py-10 md:px-10 md:py-14">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {t("flights.airports.title", "Choose the right airport")}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {t(
                    "flights.airports.description",
                    "Faro is the closest airport for most Algarve trips, while Lisbon and Seville can work for longer itineraries.",
                  )}
                </p>
                <div className="mt-7 grid gap-4">
                  {airports.map(({ icon: Icon, title, description }) => (
                    <article
                      key={title}
                      className="flex gap-4 rounded-sm border border-border/70 bg-background/80 p-4 shadow-sm"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-base font-semibold text-foreground">{title}</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="app-container pb-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {t("flights.tripTypes.title", "Plan around your trip")}
              </p>
              <h2 className="mt-4 max-w-md font-serif text-3xl text-foreground md:text-4xl">
                {t("flights.links.title", "Continue planning with AlgarveOfficial")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                {t(
                  "flights.links.description",
                  "After choosing your arrival route, compare stays, places, maps, and local guides in one trusted platform.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tripTypes.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-sm border border-border/70 bg-card p-5 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
