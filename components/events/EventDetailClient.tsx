"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
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
import { Button } from "@/components/ui/button";
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
import { useHydrated } from "@/hooks/useHydrated";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";

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
    .gte("end_date", new Date().toISOString())
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
  const {
    data: event = initialEvent,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", "slug", initialEvent.slug, locale],
    queryFn: () => fetchEventBySlug(initialEvent.slug, locale),
    initialData: initialEvent,
    staleTime: 1000 * 60 * 10,
  });

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["event-detail", "global-settings", locale],
    queryFn: () => fetchEventDetailGlobalSettings(locale),
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 10,
  });

  const cms = useEventDetailCmsHelpers(globalSettings);

  const { data: relatedEvents = initialRelatedEvents } = useQuery({
    queryKey: ["events", "related", event?.id, event?.category, event?.city_id, locale],
    queryFn: async () => {
      if (!event?.id) return [];
      return fetchRelatedEvents(locale, event.id, event.category, event.city_id, 3);
    },
    enabled: Boolean(event?.id),
    initialData: initialRelatedEvents,
    staleTime: 1000 * 60 * 5,
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

  if (error || !event) {
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

  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isSingleDay = event.start_date === event.end_date;
  const categoryTemplate = eventCategoryTemplates[event.category as EventCategory];
  const eventData = event.event_data || {};
  const eventHeroImage = normalizePublicImageUrl(event.image);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.short_description || event.description?.slice(0, 150) || undefined,
          url: shareUrl,
        });
      } catch {
        // Ignore user-cancelled share actions.
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
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
                  {isSingleDay
                    ? format(startDate, "d")
                    : `${format(startDate, "d")} - ${format(endDate, "d")}`}
                </span>
                <span className="mt-1 block text-sm font-medium uppercase tracking-wide text-foreground lg:text-base">
                  {format(startDate, "MMM")}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge className={eventCategoryColors[event.category as EventCategory]}>
                  {eventCategoryLabels[event.category as EventCategory]}
                </Badge>
                {event.is_featured ? (
                  <Badge className="bg-primary text-primary-foreground">
                    {cms.getText("hero.featuredBadge", "Featured")}
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
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {cms.getText("hero.share", "Share")}
              </Button>
              {event.ticket_url ? (
                <Button variant="gold" size="sm" asChild>
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                    <Ticket className="mr-2 h-4 w-4" />
                    {cms.getText("hero.getTickets", "Get Tickets")}
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
                      {cms.getText("content.aboutTitle", "About This Event")}
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
                      {cms.getText("content.detailsTitle", "Event Details")}
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
                            ? cms.getText("content.booleanYes", "Yes")
                            : cms.getText("content.booleanNo", "No");
                        } else if (field.type === "multiselect" || field.type === "tags") {
                          displayValue = (
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(value) ? value : []).map((itemValue: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {itemValue}
                                </Badge>
                              ))}
                            </div>
                          );
                        } else if (field.type === "select" && field.options) {
                          const option = field.options.find((opt) => opt.value === value);
                          displayValue = option?.label || String(value);
                        }

                        return (
                          <div key={field.name} className="flex flex-col gap-1">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                              {field.label}
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
                      {cms.getText("content.tagsTitle", "Tags")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
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
                    {cms.getText("sidebar.dateTimeTitle", "Date & Time")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {isSingleDay
                        ? format(startDate, "EEEE, MMMM d, yyyy")
                        : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`}
                    </p>
                  </div>
                  {event.start_time || event.end_time ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {event.start_time
                          ? format(parseISO(`2000-01-01T${event.start_time}`), "h:mm a")
                          : null}
                        {event.start_time && event.end_time ? " - " : null}
                        {event.end_time
                          ? format(parseISO(`2000-01-01T${event.end_time}`), "h:mm a")
                          : null}
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
                      {cms.getText("sidebar.locationTitle", "Location")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.venue ? <p className="font-medium text-foreground">{event.venue}</p> : null}
                    {event.location ? <p className="text-sm text-muted-foreground">{event.location}</p> : null}
                  </CardContent>
                </Card>
              ) : null}

              {event.price_range ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Ticket className="h-5 w-5 text-primary" />
                      {cms.getText("sidebar.admissionTitle", "Admission")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-primary">{event.price_range}</p>
                    {event.ticket_url ? (
                      <Button variant="gold" className="mt-4 w-full" asChild>
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                          {cms.getText("sidebar.purchaseTickets", "Purchase Tickets")}
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
                  {cms.getText("related.title", "Related Events")}
                </h2>
                <LocaleLink
                  href="/events"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {cms.getText("related.viewAll", "View All")}
                  <ChevronRight className="h-4 w-4" />
                </LocaleLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedEvents.map((relatedEvent) => {
                  const relStartDate = parseISO(relatedEvent.start_date);
                  const relEndDate = parseISO(relatedEvent.end_date);
                  const relIsSingleDay = relatedEvent.start_date === relatedEvent.end_date;
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
                              {relIsSingleDay
                                ? format(relStartDate, "d")
                                : `${format(relStartDate, "d")}-${format(relEndDate, "d")}`}
                            </span>
                            <span className="block text-xs font-medium uppercase text-foreground">
                              {format(relStartDate, "MMM")}
                            </span>
                          </div>

                          <div className="absolute bottom-2 left-2">
                            <Badge className={`text-xs ${eventCategoryColors[relatedEvent.category as EventCategory]}`}>
                              {eventCategoryLabels[relatedEvent.category as EventCategory]}
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
    const serverShell = document.getElementById("event-detail-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return <EventDetailClientInner {...props} />;
}

export default EventDetailClient;
