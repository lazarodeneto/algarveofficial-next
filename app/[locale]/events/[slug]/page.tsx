import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildEventSchema } from "@/lib/seo/advanced/schema-builders";
import EventDetail from "@/legacy-pages/public/events/EventDetail";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { getPublishedEventBySlug } from "@/app/events/[slug]/eventData";
import {
  buildAbsoluteRouteUrl,
  buildLocaleSwitchPathsForEntity,
  type EventRouteData,
} from "@/lib/i18n/localized-routing";

interface LocaleEventDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

function buildEventRouteData(event: NonNullable<Awaited<ReturnType<typeof getPublishedEventBySlug>>>): EventRouteData {
  return {
    routeType: "event",
    id: event.id,
    slugs: event.localizedSlugs,
  };
}

export async function generateMetadata({ params }: LocaleEventDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    return buildPageMetadata({
      title: "Event Not Found",
      description: "This event could not be found.",
      localizedPath: `/events/${slug}`,
      locale: resolvedLocale,
      noIndex: true,
      noFollow: true,
    });
  }

  return buildPageMetadata({
    title: (event.meta_title || event.title) ?? undefined,
    description: (event.meta_description || event.short_description) ?? undefined,
    localizedRoute: buildEventRouteData(event),
    image: event.image ?? undefined,
    type: "event",
    locale: resolvedLocale,
  });
}

export default async function LocaleEventDetailPage({ params }: LocaleEventDetailPageProps) {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const event = await getPublishedEventBySlug(slug);

  if (!event) notFound();

  const routeData = buildEventRouteData(event);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);

  const eventSchema = buildEventSchema({
    id: event.id,
    slug: event.slug,
    url: buildAbsoluteRouteUrl(resolvedLocale, routeData),
    name: event.meta_title ?? event.title,
    description: event.meta_description || event.short_description ?? undefined,
    image_url: event.image ?? undefined,
    venue_name: event.venue ?? undefined,
    city: event.location ?? undefined,
    start_date: event.start_date ?? undefined,
    end_date: event.end_date ?? undefined,
    ticket_url: event.ticket_url ?? undefined,
    locale: resolvedLocale,
  });

  return (
    <>
      <Script
        id="schema-event"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <Suspense fallback={<RouteLoadingState />}>
        <EventDetail localeSwitchPaths={localeSwitchPaths} localizedRoute={routeData} />
      </Suspense>
    </>
  );
}
