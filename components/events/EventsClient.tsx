"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Star,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategoryLabels, eventCategoryColors, type CalendarEvent, type EventCategory } from "@/types/events";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useHydrated } from "@/hooks/useHydrated";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { STANDARD_PUBLIC_HERO_WRAPPER_CLASS } from "@/components/sections/hero-layout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { hideServerShell } from "@/lib/dom/server-shell";
import {
  getPublicEventCutoffDate,
  isPublicEventVisibleByDate,
} from "@/lib/events/publicVisibility";
import { localizeEvents } from "@/lib/events/i18n";
import {
  getEventCompactDateRangeLabel,
  getEventDateBadgeParts,
  getEventMonthHeading,
} from "@/lib/events/dateDisplay";
import { getLocalizedEventPriceRange } from "@/lib/events/display";
import { FavoriteButton } from "@/components/ui/favorite-button";

type EventGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;

export interface EventsClientProps {
  initialEvents: CalendarEvent[];
  initialGlobalSettings: EventGlobalSetting[];
}

const EVENTS_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

async function fetchPublishedEvents(
  category?: EventCategory | "all",
  _timeFilter: "upcoming" | "past" | "all" = "upcoming",
) {
  const today = getPublicEventCutoffDate();
  let query = supabase
    .from("events")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("status", "published")
    .gte("end_date", today);

  query = query.order("start_date", { ascending: true });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CalendarEvent[];
}

async function fetchEventGlobalSettings() {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...EVENTS_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventGlobalSetting[];
}

function EventsClientInner({ initialEvents, initialGlobalSettings }: EventsClientProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const locale = useCurrentLocale();
  const { isFavorite, toggleFavorite } = useFavoriteEvents();

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");

  const categories = Object.entries(eventCategoryLabels) as [EventCategory, string][];

  const getEventCategoryLabel = (category: EventCategory) => {
    const translationKeyMap: Record<string, string> = {
      festival: "events.categories.festival",
      market: "events.categories.market",
      "golf-tournament": "events.categories.golfTournament",
      gastronomy: "events.categories.gastronomy",
      music: "events.categories.music",
      cultural: "events.categories.cultural",
      sporting: "events.categories.sporting",
      seasonal: "events.categories.seasonal",
    };
    return t(translationKeyMap[category] || category, eventCategoryLabels[category]);
  };
  const getEventHref = (event: Pick<CalendarEvent, "slug">) => l(event.slug ? `/events/${event.slug}` : "/events");

  const timeFilter = "upcoming";

  const { data: events = [] } = useQuery({
    queryKey: ["events", "published", selectedCategory, timeFilter, locale],
    queryFn: async () => localizeEvents(await fetchPublishedEvents(selectedCategory, timeFilter), locale),
    placeholderData: selectedCategory === "all" && timeFilter === "upcoming" ? localizeEvents(initialEvents, locale) : undefined,
    staleTime: 60 * 1000,
  });

  useQuery({
    queryKey: ["events-page", "global-settings"],
    queryFn: fetchEventGlobalSettings,
    placeholderData: initialGlobalSettings,
    staleTime: 0,
  });

  const visibleEvents = events.filter((event) => isPublicEventVisibleByDate(event));
  const featuredEvents = visibleEvents.filter((event) => event.is_featured).slice(0, 3);
  const upcomingEvents = visibleEvents.filter((event) => !featuredEvents.some((featured) => featured.id === event.id));
  const pageConfigText = (() => {
    const pageConfigSetting = initialGlobalSettings.find((setting) => setting.key === CMS_GLOBAL_SETTING_KEYS.pageConfigs)?.value;
    if (!pageConfigSetting) return {} as Record<string, string>;
    try {
      const parsed = JSON.parse(pageConfigSetting) as Record<string, { text?: Record<string, string> }>;
      return parsed?.events?.text ?? {};
    } catch {
      return {} as Record<string, string>;
    }
  })();
  const cmsText = (key: string, fallback: string) => pageConfigText[key] ?? fallback;

  const eventsByMonth: Record<string, CalendarEvent[]> = {};
  upcomingEvents.forEach((event) => {
    const monthKey = event.start_date.slice(0, 7);
    if (!eventsByMonth[monthKey]) eventsByMonth[monthKey] = [];
    eventsByMonth[monthKey].push(event);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
          <LiveStyleHero
            badge={t("sections.events.label")}
            title={t("sections.events.title")}
            subtitle={t(
              "sections.events.subtitle",
            )}
            media={
              <HeroBackgroundMedia
                mediaType={cmsText("hero.mediaType", "image")}
                imageUrl={cmsText("hero.imageUrl", "")}
                videoUrl={cmsText("hero.videoUrl", "")}
                youtubeUrl={cmsText("hero.youtubeUrl", "")}
                posterUrl={cmsText("hero.posterUrl", "")}
                alt={t("events.hero.alt")}
                fallback={<PageHeroImage page="events" alt={t("events.hero.alt")} />}
              />
            }
            ctas={
              <>
                <Link href={l("/experiences")}>
                  <Button variant="gold" size="lg">
                    {t("events.hero.ctaPrimary")}
                  </Button>
                </Link>
                <Link href={l("/contact")}>
                  <Button variant="heroOutline" size="lg">
                    {t("events.hero.ctaSecondary")}
                  </Button>
                </Link>
              </>
            }
          >
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as EventCategory | "all")}
              >
                <SelectTrigger className="w-full max-w-[260px] bg-card/90 border-border text-foreground sm:w-[220px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("sections.events.allCategories")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">{t("sections.events.allCategories")}</SelectItem>
                  {[...categories]
                    .map(([key]) => ({ key, label: getEventCategoryLabel(key) }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map(({ key, label }) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </LiveStyleHero>
        </section>

        {featuredEvents.length > 0 ? (
          <section className="py-12 app-container content-max">
            <h2 className="mb-8 flex items-center gap-2 text-title font-serif font-semibold">
              <Star className="h-6 w-6 text-primary" />
              {t("sections.events.featured")}
            </h2>
            <div className="grid-adaptive">
              {featuredEvents.map((event, index) => {
                const dateBadge = getEventDateBadgeParts(event, locale);
                const priceRangeLabel = getLocalizedEventPriceRange(event.price_range, t);

                return (
                  <m.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="relative h-full rounded-lg">
                      <Link
                        href={getEventHref(event)}
                        aria-label={t("events.openEvent", { title: event.title })}
                        className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Card className="group h-full cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/30">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={event.image ?? "/og-image.png"}
                            alt={event.title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute bottom-3 right-3 rounded-lg border border-border/50 bg-background/95 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
                            <span className="block text-3xl font-bold leading-none text-primary">
                              {dateBadge.primary}
                            </span>
                            <span className="block text-sm font-medium uppercase tracking-wide text-foreground">
                              {dateBadge.secondary}
                            </span>
                          </div>
                          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                            <Badge className={eventCategoryColors[event.category as EventCategory]}>
                              {getEventCategoryLabel(event.category as EventCategory)}
                            </Badge>
                            <Badge className="bg-primary text-primary-foreground">
                              {t("sections.events.featuredBadge")}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="mb-2 line-clamp-2 text-lg font-serif font-semibold transition-colors group-hover:text-primary">
                            {event.title}
                          </h3>
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {event.short_description}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{getEventCompactDateRangeLabel(event, locale)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue || event.location}</span>
                            </div>
                            {priceRangeLabel ? (
                              <div className="flex items-center gap-2 text-primary">
                                <Ticket className="h-4 w-4" />
                                <span>{priceRangeLabel}</span>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                        </Card>
                      </Link>
                      <div className="absolute right-3 top-3 z-20">
                        <FavoriteButton
                          isFavorite={isFavorite(event)}
                          onToggle={() => void toggleFavorite(event)}
                          size="md"
                          variant="glassmorphism"
                          className="bg-white/90 backdrop-blur border-white/20 hover:bg-white hover:border-red-400/30 [&_svg]:text-neutral-700 [&_svg]:hover:text-red-400"
                        />
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="py-12 app-container content-max">
          <h2 className="mb-8 text-title font-serif font-semibold">
            {t("common.upcomingEvents")}
          </h2>

          {Object.entries(eventsByMonth).length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-16 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-serif font-semibold">{t("sections.events.noUpcoming")}</h3>
                <p className="text-muted-foreground">{t("sections.events.noUpcomingHint")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
                <div key={monthKey}>
                  <h3 className="mb-4 border-b border-border pb-2 text-lg font-medium text-muted-foreground">
                    {getEventMonthHeading(monthKey, locale)}
                  </h3>
                  <div className="grid-adaptive">
                    {monthEvents.map((event, index) => {
                      const dateBadge = getEventDateBadgeParts(event, locale);

                      return (
                        <m.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <div className="relative rounded-lg">
                            <Link
                              href={getEventHref(event)}
                              aria-label={t("events.openEvent", { title: event.title })}
                              className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <Card className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/30">
                              <div className="flex flex-col sm:flex-row">
                                <div className="flex w-full flex-row items-center justify-center gap-1 bg-muted p-3 sm:w-24 sm:flex-shrink-0 sm:flex-col sm:gap-0">
                                  <span className="text-2xl font-bold text-primary">
                                    {dateBadge.primary}
                                  </span>
                                  <span className="text-xs uppercase text-muted-foreground">
                                    {dateBadge.secondary}
                                  </span>
                                </div>
                                <CardContent className="min-w-0 flex-1 p-4 pr-14">
                                  <Badge className={`${eventCategoryColors[event.category as EventCategory]} mb-2 max-w-full text-xs`}>
                                    {getEventCategoryLabel(event.category as EventCategory)}
                                  </Badge>
                                  <h4 className="line-clamp-2 break-words font-medium transition-colors group-hover:text-primary sm:line-clamp-1">
                                    {event.title}
                                  </h4>
                                  <div className="mt-1 flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
                                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                    <span className="line-clamp-3 break-words">{event.location}</span>
                                  </div>
                                </CardContent>
                              </div>
                              </Card>
                            </Link>
                            <div className="absolute right-3 top-3 z-20">
                              <FavoriteButton
                                isFavorite={isFavorite(event)}
                                onToggle={() => void toggleFavorite(event)}
                                size="sm"
                                variant="solid"
                              />
                            </div>
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function EventsClient(props: EventsClientProps) {
  const mounted = useHydrated();

  useEffect(() => {
    return hideServerShell("events-server-shell");
  }, []);

  if (!mounted) {
    return null;
  }

  return <EventsClientInner {...props} />;
}

export default EventsClient;
