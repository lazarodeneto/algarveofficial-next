"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { NavigationType, Router, createPath, type To } from "react-router";
import { LegacyLink as Link } from "@/components/router/LegacyRouterBridge";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Star,
  Archive,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategoryLabels, eventCategoryColors, type CalendarEvent, type EventCategory } from "@/types/events";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

type HomegrownNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

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

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

async function fetchPublishedEvents(
  category?: EventCategory | "all",
  timeFilter: "upcoming" | "past" | "all" = "upcoming",
) {
  const today = new Date().toISOString().split("T")[0];
  let query = supabase
    .from("events")
    .select(`
      *,
      city:cities(id, name, slug)
    `)
    .eq("status", "published");

  if (timeFilter === "upcoming") {
    query = query.gte("end_date", today);
  } else if (timeFilter === "past") {
    query = query.lt("end_date", today);
  }

  query = query.order("start_date", { ascending: timeFilter !== "past" });

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
  const langPrefix = useLangPrefix();

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [showPast, setShowPast] = useState(false);

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

  const timeFilter = showPast ? "past" : "upcoming";

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", "published", selectedCategory, timeFilter],
    queryFn: () => fetchPublishedEvents(selectedCategory, timeFilter),
    initialData: selectedCategory === "all" && timeFilter === "upcoming" ? initialEvents : undefined,
    staleTime: 1000 * 60 * 5,
  });

  useQuery({
    queryKey: ["events-page", "global-settings"],
    queryFn: fetchEventGlobalSettings,
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 10,
  });

  const featuredEvents = showPast ? [] : events.filter((event) => event.is_featured).slice(0, 3);
  const upcomingEvents = events.filter((event) => !featuredEvents.some((featured) => featured.id === event.id));

  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    upcomingEvents.forEach((event) => {
      const monthKey = format(parseISO(event.start_date), "yyyy-MM");
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(event);
    });
    return grouped;
  }, [upcomingEvents]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="px-0 sm:px-4 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4">
          <LiveStyleHero
            badge={t("sections.events.label", "Algarve Calendar")}
            title={t("sections.events.title", "Events & Season")}
            subtitle={t(
              "sections.events.subtitle",
              "Festivals, markets, and seasonal highlights across Portugal's stunning southern coast.",
            )}
            media={<PageHeroImage page="events" alt={t("events.hero.alt", "Premium Algarve event destination")} />}
            ctas={
              <>
                <Link to={buildLangPath(langPrefix, "/directory")}>
                  <Button variant="gold" size="lg">
                    {t("events.hero.ctaPrimary", "Explore Experiences")}
                  </Button>
                </Link>
                <Link to={buildLangPath(langPrefix, "/contact")}>
                  <Button variant="heroOutline" size="lg">
                    {t("events.hero.ctaSecondary", "Plan My Calendar")}
                  </Button>
                </Link>
              </>
            }
          >
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as EventCategory | "all")}
              >
                <SelectTrigger className="w-[220px] bg-card/90 border-border text-foreground">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
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
              <div className="flex items-center gap-2 rounded-md border border-border bg-card/90 px-4 py-2 text-foreground">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="past-toggle" className="cursor-pointer select-none text-sm">
                  {t("sections.events.showPast", "Past Events")}
                </Label>
                <Switch id="past-toggle" checked={showPast} onCheckedChange={setShowPast} />
              </div>
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
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link to={buildLangPath(langPrefix, `/events/${event.slug}`)}>
                    <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:border-primary/30">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={typeof event.image === "string" ? event.image : "/og-image.jpg"}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute bottom-3 right-3 rounded-lg border border-border/50 bg-background/95 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
                          <span className="block text-3xl font-bold leading-none text-primary">
                            {event.start_date === event.end_date
                              ? format(parseISO(event.start_date), "d")
                              : `${format(parseISO(event.start_date), "d")} - ${format(parseISO(event.end_date), "d")}`}
                          </span>
                          <span className="block text-sm font-medium uppercase tracking-wide text-foreground">
                            {format(parseISO(event.start_date), "MMM")}
                          </span>
                        </div>
                        <div className="absolute left-3 top-3">
                          <Badge className={eventCategoryColors[event.category as EventCategory]}>
                            {getEventCategoryLabel(event.category as EventCategory)}
                          </Badge>
                        </div>
                        <div className="absolute right-3 top-3">
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
                            <span>
                              {format(parseISO(event.start_date), "MMM d")}
                              {event.start_date !== event.end_date
                                ? ` - ${format(parseISO(event.end_date), "MMM d, yyyy")}`
                                : null}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {(typeof event.venue === "string" && event.venue) ||
                                (typeof event.location === "string" ? event.location : "")}
                            </span>
                          </div>
                          {event.price_range ? (
                            <div className="flex items-center gap-2 text-primary">
                              <Ticket className="h-4 w-4" />
                              <span>{typeof event.price_range === "string" ? event.price_range : ""}</span>
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="py-12 app-container content-max">
          <h2 className="mb-8 text-title font-serif font-semibold">
            {showPast
              ? t("sections.events.pastEvents", "Past Events")
              : t("common.upcomingEvents", "Upcoming Events")}
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
                    {format(parseISO(`${monthKey}-01`), "MMMM yyyy")}
                  </h3>
                  <div className="grid-adaptive">
                    {monthEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Link to={buildLangPath(langPrefix, `/events/${event.slug}`)}>
                          <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/30">
                            <div className="flex flex-col sm:flex-row">
                              <div className="flex w-full flex-row items-center justify-center gap-1 bg-muted p-3 sm:w-24 sm:flex-shrink-0 sm:flex-col sm:gap-0">
                                <span className="text-2xl font-bold text-primary">
                                  {format(parseISO(event.start_date), "d")}
                                </span>
                                <span className="text-xs uppercase text-muted-foreground">
                                  {format(parseISO(event.start_date), "MMM")}
                                </span>
                              </div>
                              <CardContent className="min-w-0 flex-1 p-4">
                                <Badge className={`${eventCategoryColors[event.category as EventCategory]} mb-2 max-w-full text-xs`}>
                                  {getEventCategoryLabel(event.category as EventCategory)}
                                </Badge>
                                <h4 className="line-clamp-2 break-words font-medium transition-colors group-hover:text-primary sm:line-clamp-1">
                                  {event.title}
                                </h4>
                                <div className="mt-1 flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
                                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                  <span className="line-clamp-3 break-words">
                                    {typeof event.location === "string" ? event.location : ""}
                                  </span>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
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
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();
  const [mounted, setMounted] = useState(false);

  const search = nextSearchParams?.toString() ?? "";
  const location = useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
      state: null,
      key: `${pathname}${search ? `?${search}` : ""}`,
    }),
    [pathname, search],
  );

  const navigator = useMemo<HomegrownNavigator>(
    () => ({
      createHref: (to) => resolveToPath(to),
      go: (delta) => {
        window.history.go(delta);
      },
      push: (to) => {
        router.push(resolveToPath(to));
      },
      replace: (to) => {
        router.replace(resolveToPath(to));
      },
    }),
    [router],
  );

  useEffect(() => {
    setMounted(true);
    const serverShell = document.getElementById("events-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Router location={location as never} navigator={navigator as never} navigationType={NavigationType.Pop}>
      <EventsClientInner {...props} />
    </Router>
  );
}

export default EventsClient;
