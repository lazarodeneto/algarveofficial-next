import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/advanced/schema-builders";
import EventsClient from "@/components/events/EventsClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { eventCategoryLabels, type EventCategory } from "@/types/events";
import { getEventMonthHeading } from "@/lib/events/dateDisplay";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import {
  getPublicEventGlobalSettings,
  getPublicEvents,
  type PublicEventDTO,
  type PublicEventGlobalSetting,
} from "@/lib/public-data/events";
import { getServerTranslations } from "@/lib/i18n/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

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

const EVENTS_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

const EVENTS_SERVER_KEYS = [
  "serverPages.events.badge",
  "serverPages.events.emptyTitle",
  "serverPages.events.emptyDescription",
  "serverPages.events.eventsAria",
] as const;

const EVENTS_SERVER_FALLBACK: Record<(typeof EVENTS_SERVER_KEYS)[number], string> = {
  "serverPages.events.badge": "Algarve events",
  "serverPages.events.emptyTitle": "No upcoming published events",
  "serverPages.events.emptyDescription": "Upcoming published events will appear here when available.",
  "serverPages.events.eventsAria": "Upcoming published events",
};

function eventsCopy(copy: Record<string, string>, key: (typeof EVENTS_SERVER_KEYS)[number]) {
  return copy[key] ?? EVENTS_SERVER_FALLBACK[key];
}

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

async function fetchEventsPageData(locale: Locale): Promise<{
  events: PublicEventDTO[];
  globalSettings: PublicEventGlobalSetting[];
}> {
  const [events, globalSettings] = await Promise.all([
    getPublicEvents({ locale, timeFilter: "upcoming", limit: 100 }),
    getPublicEventGlobalSettings(EVENTS_CMS_KEYS),
  ]);

  return { events, globalSettings };
}

function EventsServerShell({
  locale,
  events,
  title,
  description,
  copy,
}: {
  locale: Locale;
  events: PublicEventDTO[];
  title: string;
  description: string;
  copy: Record<string, string>;
}) {
  const eventsByMonth: Record<string, PublicEventDTO[]> = {};
  events.forEach((event) => {
    const monthKey = event.start_date.slice(0, 7);
    if (!eventsByMonth[monthKey]) eventsByMonth[monthKey] = [];
    eventsByMonth[monthKey].push(event);
  });

  return (
    <div id="events-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        <section className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {eventsCopy(copy, "serverPages.events.badge")}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </section>

        {events.length === 0 ? (
          <section className="rounded-lg border border-border bg-card/80 p-8 text-center shadow-sm">
            <Calendar className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="font-serif text-2xl">{eventsCopy(copy, "serverPages.events.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {eventsCopy(copy, "serverPages.events.emptyDescription")}
            </p>
          </section>
        ) : (
          <section aria-label={eventsCopy(copy, "serverPages.events.eventsAria")} className="space-y-10">
            {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
              <div key={monthKey}>
                <h2 className="mb-4 border-b border-border pb-2 font-serif text-2xl text-muted-foreground">
                  {getEventMonthHeading(monthKey, locale)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {monthEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={buildLocalizedPath(locale, `/events/${event.slug}`)}
                      className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {eventCategoryLabels[event.category as EventCategory] ?? event.category}
                      </p>
                      <h3 className="mt-2 font-serif text-xl leading-snug">{event.title}</h3>
                      {event.short_description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {event.short_description}
                        </p>
                      ) : null}
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {event.dateRangeLabel}
                        </p>
                        {event.venueLabel ? (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {event.venueLabel}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default async function EventsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  const meta = EVENTS_META[locale];
  const [{ events, globalSettings }, copy] = await Promise.all([
    fetchEventsPageData(locale),
    getServerTranslations(locale, [...EVENTS_SERVER_KEYS]),
  ]);
  const localizedEventsPath = buildLocalizedPath(locale, "/events");
  const itemListSchema = buildItemListSchema(
    meta.title,
    events.map((event) => ({
      name: event.title,
      url: buildLocalizedPath(locale, `/events/${event.slug}`),
      description: event.short_description ?? undefined,
      image: event.image ?? undefined,
    })),
    localizedEventsPath,
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: buildLocalizedPath(locale, "/") },
    { name: meta.title, url: localizedEventsPath },
  ]);

  return (
    <>
      <script
        id="schema-events-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        id="schema-events-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <EventsServerShell
        locale={locale}
        events={events}
        title={meta.title}
        description={meta.description}
        copy={copy}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <EventsClient initialEvents={events} initialGlobalSettings={globalSettings} />
      </Suspense>
    </>
  );
}
