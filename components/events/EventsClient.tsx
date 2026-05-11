"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Filter,
  Star,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategoryLabels, type CalendarEvent, type EventCategory } from "@/types/events";
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
import { getEventMonthHeading } from "@/lib/events/dateDisplay";
import { PIXABAY_EVENT_IMAGE_FALLBACK } from "@/lib/events/cardStyles";
import { EventTicketCard } from "@/components/events/EventTicketCard";

const EventMapDirectory = dynamic(
  () => import("@/components/events/EventMapDirectory").then((module) => module.EventMapDirectory),
  { ssr: false },
);

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
  const [activeMapEventId, setActiveMapEventId] = useState<string | null>(null);

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
              {featuredEvents.map((event, index) => (
                <m.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onMouseEnter={() => setActiveMapEventId(event.id)}
                  onFocus={() => setActiveMapEventId(event.id)}
                >
                  <EventTicketCard
                    event={event}
                    locale={locale}
                    href={getEventHref(event)}
                    categoryLabel={getEventCategoryLabel(event.category as EventCategory)}
                    featuredLabel={t("sections.events.featuredBadge")}
                    showFeaturedBadge
                    imageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                    isFavorite={isFavorite(event)}
                    onToggleFavorite={() => void toggleFavorite(event)}
                    t={t}
                  />
                </m.div>
              ))}
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
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,42%)]">
              <div className="space-y-12">
                {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
                  <div key={monthKey}>
                    <h3 className="mb-4 border-b border-border pb-2 text-lg font-medium text-muted-foreground">
                      {getEventMonthHeading(monthKey, locale)}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 3xl:grid-cols-2">
                      {monthEvents.map((event, index) => (
                        <m.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          onMouseEnter={() => setActiveMapEventId(event.id)}
                          onFocus={() => setActiveMapEventId(event.id)}
                        >
                          <EventTicketCard
                            event={event}
                            locale={locale}
                            href={getEventHref(event)}
                            categoryLabel={getEventCategoryLabel(event.category as EventCategory)}
                            imageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                            isFavorite={isFavorite(event)}
                            onToggleFavorite={() => void toggleFavorite(event)}
                            t={t}
                          />
                        </m.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <aside className="hidden xl:block">
                <div className="sticky top-28">
                  <EventMapDirectory
                    events={visibleEvents}
                    locale={locale}
                    activeEventId={activeMapEventId}
                    onEventSelect={setActiveMapEventId}
                    getEventHref={getEventHref}
                    eventImageFallback={PIXABAY_EVENT_IMAGE_FALLBACK}
                  />
                </div>
              </aside>
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
