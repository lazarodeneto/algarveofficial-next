"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ExternalLink,
  ArrowLeft,
  Share2,
  Tag,
  ChevronRight,
} from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { eventCategoryLabels, eventCategoryColors, type EventCategory } from "@/types/events";
import { eventCategoryTemplates } from "@/lib/eventCategoryTemplates";
import {
  CMS_GLOBAL_SETTING_KEYS,
  normalizeCmsPageConfigs,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { useHydrated } from "@/hooks/useHydrated";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { hideServerShell } from "@/lib/dom/server-shell";
import {
  getPublicEventCutoffDate,
  isPublicEventVisibleByDate,
} from "@/lib/events/publicVisibility";
import { localizeEvent, localizeEvents } from "@/lib/events/i18n";
import {
  getEventDateBadgeParts,
  getEventDetailDateRangeLabel,
  getEventTimeLabel,
} from "@/lib/events/dateDisplay";
import {
  getLocalizedEventPriceRange,
  getTranslatedEventCategoryLabel,
  getTranslatedEventFieldLabel,
  getTranslatedEventFieldValue,
  getTranslatedEventTextValue,
  getTranslatedEventTag,
} from "@/lib/events/display";
import { FavoriteButton } from "@/components/ui/favorite-button";

export type EventCitySummary = Pick<Tables<"cities">, "id" | "name" | "slug">;
export type EventGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;
export type EventRecord = Tables<"events"> & {
  city?: EventCitySummary | null;
};

export interface EventDetailClientProps {
  initialEvent: EventRecord;
  initialRelatedEvents: EventRecord[];
  initialGlobalSettings: EventGlobalSetting[];
}

const EVENT_DETAIL_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

const passthroughImageLoader = ({ src }: { src: string }) => src;

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key.trim()] = value;
    }
  });

  return normalized;
}

function useEventDetailCmsHelpers(globalSettings: EventGlobalSetting[]) {
  return useMemo(() => {
    const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});

    const textOverrides = normalizeTextOverrides(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    );
    const pageConfigs = normalizeCmsPageConfigs(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const pageConfig = pageConfigs["event-detail"] ?? {};
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true) => {
      const configured = blocks[blockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getText = (textKey: string, fallback: string) =>
      pageText[textKey] ??
      textOverrides[`event-detail.${textKey}`] ??
      textOverrides[textKey] ??
      fallback;

    return {
      isBlockEnabled,
      getText,
    };
  }, [globalSettings]);
}

async function fetchEventBySlug(slug: string, _locale: string) {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .gte("end_date", getPublicEventCutoffDate())
    .maybeSingle();

  if (error) throw error;
  return (data as EventRecord | null) ?? null;
}

async function fetchRelatedEvents(
  _locale: string,
  eventId: string,
  category?: string | null,
  cityId?: string | null,
  limit = 3,
) {
  const filters: string[] = [];
  if (category) filters.push(`category.eq.${category}`);
  if (cityId) filters.push(`city_id.eq.${cityId}`);

  if (!filters.length) {
    return [] as EventRecord[];
  }

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("status", "published")
    .gte("end_date", getPublicEventCutoffDate())
    .neq("id", eventId)
    .or(filters.join(","))
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

async function fetchEventDetailGlobalSettings(_locale: string) {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...EVENT_DETAIL_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventGlobalSetting[];
}

function EventDetailClientInner({
  initialEvent,
  initialRelatedEvents,
  initialGlobalSettings,
}: EventDetailClientProps) {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const localizedInitialEvent = useMemo(
    () => localizeEvent(initialEvent, locale),
    [initialEvent, locale],
  );
  const localizedInitialRelatedEvents = useMemo(
    () => localizeEvents(initialRelatedEvents, locale),
    [initialRelatedEvents, locale],
  );
  const { isFavorite, toggleFavorite } = useFavoriteEvents();
  const {
    data: event = localizedInitialEvent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", "slug", initialEvent.slug, locale],
    queryFn: async () => localizeEvent(await fetchEventBySlug(initialEvent.slug, locale), locale),
    placeholderData: localizedInitialEvent,
    staleTime: 30 * 1000,
  });

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["event-detail", "global-settings", locale],
    queryFn: () => fetchEventDetailGlobalSettings(locale),
    placeholderData: initialGlobalSettings,
    staleTime: 0,
  });

  const cms = useEventDetailCmsHelpers(globalSettings);

  const { data: relatedEvents = localizedInitialRelatedEvents } = useQuery({
    queryKey: ["events", "related", event?.id, event?.category, event?.city_id, locale],
    queryFn: async () => {
      if (!event?.id) return [];
      return localizeEvents(await fetchRelatedEvents(locale, event.id, event.category, event.city_id, 3), locale);
    },
    enabled: Boolean(event?.id),
    placeholderData: localizedInitialRelatedEvents,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(6rem+10px)] pb-16">
          <div className="app-container content-max">
            <Skeleton className="mb-6 h-8 w-32" />
            <Skeleton className="mb-8 h-[400px] w-full rounded-xl" />
            <Skeleton className="mb-4 h-12 w-3/4" />
            <Skeleton className="mb-8 h-6 w-1/2" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event || !isPublicEventVisibleByDate(event)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[calc(8rem+10px)] pb-16">
          <div className="app-container text-center">
            <h1 className="mb-4 text-4xl font-serif font-medium text-foreground">
              {cms.getText("notFound.title", t("notFound.title"))}
            </h1>
            <p className="mb-8 text-muted-foreground">
              {cms.getText("notFound.description", t("notFound.description"))}
            </p>
            <Button variant="gold" asChild>
              <LocaleLink href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {cms.getText("notFound.back", t("events.backToEvents"))}
              </LocaleLink>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const dateBadge = getEventDateBadgeParts(event, locale);
  const detailDateLabel = getEventDetailDateRangeLabel(event, locale);
  const categoryTemplate = eventCategoryTemplates[event.category as EventCategory];
  const eventData = event.event_data ?? {};
  const eventHeroImage = normalizePublicImageUrl(event.image);
  const categoryLabel = getTranslatedEventCategoryLabel(
    event.category as EventCategory,
    eventCategoryLabels[event.category as EventCategory],
    t,
  );
  const priceRangeLabel = getLocalizedEventPriceRange(event.price_range, t);
  const startTimeLabel = getEventTimeLabel(event.start_time, locale);
  const endTimeLabel = getEventTimeLabel(event.end_time, locale);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: (event.short_description || event.description?.slice(0, 150)) ?? undefined,
          url: shareUrl,
        });
      } catch {
        // Ignore user-cancelled share actions.
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // Browser clipboard permission can be denied outside trusted gestures.
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[calc(6rem+10px)] pb-16">
        <div className="app-container content-max">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <LocaleLink
              href="/events"
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {cms.getText("hero.backToEvents", t("events.backToEvents"))}
            </LocaleLink>
          </m.div>

          {eventHeroImage ? (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl"
            >
              <Image
                loader={passthroughImageLoader}
                unoptimized
                src={eventHeroImage}
                alt={event.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 right-4 rounded-lg border border-border/50 bg-background/95 px-5 py-4 text-center shadow-xl backdrop-blur-sm">
                <span className="block text-4xl font-bold leading-none text-primary lg:text-5xl">
                  {dateBadge.primary}
                </span>
                <span className="mt-1 block text-sm font-medium uppercase tracking-wide text-foreground lg:text-base">
                  {dateBadge.secondary}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge className="border-white/80 bg-white/90 text-slate-950 shadow-lg backdrop-blur-md hover:bg-white">
                  {categoryLabel}
                </Badge>
                {event.is_featured ? (
                  <Badge className="bg-primary text-primary-foreground">
                    {cms.getText("hero.featuredBadge", t("sections.events.featuredBadge"))}
                  </Badge>
                ) : null}
              </div>
            </m.div>
          ) : null}

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <div>
              <h1 className="mb-2 text-3xl font-serif font-medium text-foreground lg:text-4xl">
                {event.title}
              </h1>
              {event.short_description ? (
                <p className="text-lg text-muted-foreground">{event.short_description}</p>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <FavoriteButton
                isFavorite={isFavorite(event)}
                onToggle={() => void toggleFavorite(event)}
                size="md"
                variant="solid"
              />
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {cms.getText("hero.share", t("events.detail.share"))}
              </Button>
              {event.ticket_url ? (
                <Button variant="gold" size="sm" asChild>
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                    <Ticket className="mr-2 h-4 w-4" />
                    {cms.getText("hero.getTickets", t("events.detail.getTickets"))}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              ) : null}
            </div>
          </m.div>

          <div className="grid gap-8 lg:grid-cols-3">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8 lg:col-span-2"
            >
              {event.description ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-serif">
                      {cms.getText("content.aboutTitle", t("events.detail.aboutTitle"))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none prose-invert">
                      {event.description.split("\n").map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-muted-foreground last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {categoryTemplate && Object.keys(eventData).length > 0 ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-serif">
                      {cms.getText("content.detailsTitle", t("events.detail.detailsTitle"))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {categoryTemplate.fields.map((field) => {
                        const value = (eventData as Record<string, unknown>)[field.name];
                        if (
                          value === undefined ||
                          value === null ||
                          value === "" ||
                          (Array.isArray(value) && value.length === 0)
                        ) {
                          return null;
                        }

                        let displayValue: React.ReactNode = String(value);

                        if (field.type === "checkbox") {
                          displayValue = value
                            ? cms.getText("content.booleanYes", t("events.detail.booleanYes"))
                            : cms.getText("content.booleanNo", t("events.detail.booleanNo"));
                        } else if (field.type === "multiselect" || field.type === "tags") {
                          displayValue = (
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(value) ? value : []).map((itemValue: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {getTranslatedEventFieldValue(field, itemValue, t)}
                                </Badge>
                              ))}
                            </div>
                          );
                        } else if (field.type === "select" && field.options) {
                          displayValue = getTranslatedEventFieldValue(field, String(value), t);
                        } else if (field.type === "text" || field.type === "textarea") {
                          displayValue = getTranslatedEventTextValue(field, String(value), t);
                        }

                        return (
                          <div key={field.name} className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                              {getTranslatedEventFieldLabel(field, t)}
                            </span>
                            <span className="text-foreground">{displayValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {event.tags && event.tags.length > 0 ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Tag className="h-5 w-5" />
                      {cms.getText("content.tagsTitle", t("events.detail.tagsTitle"))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {getTranslatedEventTag(tag, t)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Calendar className="h-5 w-5 text-primary" />
                    {cms.getText("sidebar.dateTimeTitle", t("events.detail.dateTimeTitle"))}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {detailDateLabel}
                    </p>
                  </div>
                  {event.start_time || event.end_time ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {startTimeLabel}
                        {startTimeLabel && endTimeLabel ? " - " : null}
                        {endTimeLabel}
                      </span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {event.venue || event.location ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <MapPin className="h-5 w-5 text-primary" />
                      {cms.getText("sidebar.locationTitle", t("events.detail.locationTitle"))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.venue ? <p className="font-medium text-foreground">{event.venue}</p> : null}
                    {event.location ? <p className="text-sm text-muted-foreground">{event.location}</p> : null}
                  </CardContent>
                </Card>
              ) : null}

              {priceRangeLabel ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Ticket className="h-5 w-5 text-primary" />
                      {cms.getText("sidebar.admissionTitle", t("events.detail.admissionTitle"))}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-primary">{priceRangeLabel}</p>
                    {event.ticket_url ? (
                      <Button variant="gold" className="mt-4 w-full" asChild>
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                          {cms.getText("sidebar.purchaseTickets", t("events.detail.purchaseTickets"))}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </m.div>
          </div>

          {cms.isBlockEnabled("related-events", true) && relatedEvents.length > 0 ? (
            <m.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-medium text-foreground">
                  {cms.getText("related.title", t("events.detail.relatedTitle"))}
                </h2>
                <LocaleLink
                  href="/events"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {cms.getText("related.viewAll", t("events.detail.viewAll"))}
                  <ChevronRight className="h-4 w-4" />
                </LocaleLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedEvents.map((relatedEvent) => {
                  const relatedDateBadge = getEventDateBadgeParts(relatedEvent, locale);
                  const relatedEventImage = normalizePublicImageUrl(relatedEvent.image);

                  return (
                    <LocaleLink key={relatedEvent.id} href={`/events/${relatedEvent.slug}`} className="group">
                      <Card className="h-full overflow-hidden border-border bg-card transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {relatedEventImage ? (
                            <Image
                              loader={passthroughImageLoader}
                              unoptimized
                              src={relatedEventImage}
                              alt={relatedEvent.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <Calendar className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          <div className="absolute right-2 top-2 rounded-md border border-border/50 bg-background/95 px-2 py-1 text-center backdrop-blur-sm">
                            <span className="block text-lg font-bold leading-none text-primary">
                              {relatedDateBadge.primary}
                            </span>
                            <span className="block text-xs font-medium uppercase text-foreground">
                              {relatedDateBadge.secondary}
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2">
                            <Badge className={`text-xs ${eventCategoryColors[relatedEvent.category as EventCategory]}`}>
                              {getTranslatedEventCategoryLabel(
                                relatedEvent.category as EventCategory,
                                eventCategoryLabels[relatedEvent.category as EventCategory],
                                t,
                              )}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-3">
                          <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                            {relatedEvent.title}
                          </h3>
                          {relatedEvent.city ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {relatedEvent.city.name}
                            </p>
                          ) : null}
                        </CardContent>
                      </Card>
                    </LocaleLink>
                  );
                })}
              </div>
            </m.section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function EventDetailClient(props: EventDetailClientProps) {
  const mounted = useHydrated();

  useEffect(() => {
    return hideServerShell("event-detail-server-shell");
  }, []);

  if (!mounted) {
    return null;
  }

  return <EventDetailClientInner {...props} />;
}

export default EventDetailClient;
