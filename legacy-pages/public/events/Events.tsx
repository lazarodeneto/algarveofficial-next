"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Filter,
  Star
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { RouteMessageState } from '@/components/layout/RouteMessageState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventCategoryLabels, type CalendarEvent, type EventCategory } from '@/types/events';
import { usePublishedEvents } from '@/hooks/useEvents';
import { useFavoriteEvents } from '@/hooks/useFavoriteEvents';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { useLocalePath } from '@/hooks/useLocalePath';
import { useCmsPageBuilder } from '@/hooks/useCmsPageBuilder';
import { CmsBlock } from '@/components/cms/CmsBlock';
import { LiveStyleHero } from '@/components/sections/LiveStyleHero';
import { HeroBackgroundMedia } from '@/components/sections/HeroBackgroundMedia';
import { PageHeroImage } from '@/components/sections/PageHeroImage';
import {
  STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
  STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";
import { getEventMonthHeading } from "@/lib/events/dateDisplay";
import { PIXABAY_EVENT_IMAGE_FALLBACK } from "@/lib/events/cardStyles";
import { isPublicEventVisibleByDate } from "@/lib/events/publicVisibility";
import { EventTicketCard } from "@/components/events/EventTicketCard";

const EventMapDirectory = dynamic(
  () => import("@/components/events/EventMapDirectory").then((module) => module.EventMapDirectory),
  { ssr: false },
);

export default function Events() {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const { getText, isBlockEnabled } = useCmsPageBuilder("events");
  const heroEnabled = isBlockEnabled("hero", true);
  const eventImageFallback = PIXABAY_EVENT_IMAGE_FALLBACK;
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [activeMapEventId, setActiveMapEventId] = useState<string | null>(null);

  const categories = Object.entries(eventCategoryLabels) as [EventCategory, string][];

  // Helper to get translated event category label
  const getEventCategoryLabel = (category: EventCategory) => {
    const translationKeyMap: Record<string, string> = {
      'festival': 'events.categories.festival',
      'market': 'events.categories.market',
      'golf-tournament': 'events.categories.golfTournament',
      'gastronomy': 'events.categories.gastronomy',
      'music': 'events.categories.music',
      'cultural': 'events.categories.cultural',
      'sporting': 'events.categories.sporting',
      'seasonal': 'events.categories.seasonal',
    };
    return t(translationKeyMap[category] || category, eventCategoryLabels[category]);
  };
  const getEventHref = (event: { slug?: string | null }) =>
    l(event.slug ? `/events/${event.slug}` : "/events");

  // Fetch events from database
  const timeFilter = 'upcoming';
  const { data: events = [] } = usePublishedEvents(selectedCategory, timeFilter);
  const { isFavorite, toggleFavorite } = useFavoriteEvents();
  const visibleEvents = events.filter((event) => isPublicEventVisibleByDate(event));
  const featuredEvents = visibleEvents.filter((e) => e.is_featured).slice(0, 3);
  const upcomingEvents = visibleEvents.filter((e) => !featuredEvents.includes(e));

  // Group by month
  const eventsByMonth: Record<string, CalendarEvent[]> = {};
  upcomingEvents.forEach((event) => {
    const monthKey = event.start_date.slice(0, 7);
    if (!eventsByMonth[monthKey]) eventsByMonth[monthKey] = [];
    eventsByMonth[monthKey].push(event);
  });

  return (
    <div className="min-h-screen bg-background" data-cms-page="events">
      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main>
        {heroEnabled ? (
          <CmsBlock pageId="events" blockId="hero" as="section" className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
            <LiveStyleHero
              badge={getText("hero.badge", t("sections.events.label"))}
              title={getText("hero.title", t("sections.events.title"))}
              subtitle={getText("hero.subtitle", t("sections.events.subtitle"))}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
                  alt={getText("hero.alt", t("events.hero.alt"))}
                  fallback={<PageHeroImage page="events" alt={getText("hero.alt", t("events.hero.alt"))} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/experiences")}>
                    <Button variant="gold" size="lg">
                      {getText("hero.cta.primary", t("events.hero.ctaPrimary"))}
                    </Button>
                  </Link>
                  <Link href={l("/contact")}>
                    <Button variant="heroOutline" size="lg">
                      {getText("hero.cta.secondary", t("events.hero.ctaSecondary"))}
                    </Button>
                  </Link>
                </>
              }
            >
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v as EventCategory | 'all')}
                >
                  <SelectTrigger className="w-[220px] bg-card/90 border-border text-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={getText("filters.allCategories", t("sections.events.allCategories"))} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">{getText("filters.allCategories", t("sections.events.allCategories"))}</SelectItem>
                    {[...categories]
                      .map(([key]) => ({ key, label: getEventCategoryLabel(key) }))
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map(({ key, label }) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </LiveStyleHero>
          </CmsBlock>
        ) : null}

        {/* Featured Events */}
        {isBlockEnabled("featured", true) && featuredEvents.length > 0 && (
          <section className={`${heroEnabled ? "py-12" : "pb-12"} app-container content-max`}>
            <h2 className="text-title font-serif font-semibold mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {getText("featured.title", t("sections.events.featured"))}
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
                    featuredLabel={getText("featured.badge", t("sections.events.featuredBadge"))}
                    showFeaturedBadge
                    imageFallback={eventImageFallback}
                    isFavorite={isFavorite(event)}
                    onToggleFavorite={() => void toggleFavorite(event)}
                    t={t}
                  />
                </m.div>
              ))}
            </div>
          </section>
        )}

        {/* All Events by Month */}
        {isBlockEnabled("timeline", true) ? (
        <section
          className={`${featuredEvents.length > 0 || heroEnabled ? "py-12" : "pb-12"} app-container content-max`}
        >
          <h2 className="text-title font-serif font-semibold mb-8">
            {getText("timeline.title", t("common.upcomingEvents"))}
          </h2>
          
          {Object.entries(eventsByMonth).length === 0 ? (
            <RouteMessageState
              eyebrow={getText("hero.badge", t("sections.events.label"))}
              title={getText("timeline.emptyTitle", t("sections.events.noUpcoming"))}
              description={getText("timeline.emptyDescription", t("sections.events.noUpcomingHint"))}
              icon={<Calendar className="h-16 w-16" />}
              minHeightClassName="min-h-[22rem]"
            />
          ) : (
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,38%)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40%)] xl:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] 3xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,36%)]">
              <div className="space-y-12">
                {Object.entries(eventsByMonth).map(([monthKey, events]) => (
                  <div key={monthKey}>
                    <h3 className="text-lg font-medium text-muted-foreground mb-4 border-b border-border pb-2">
                      {getEventMonthHeading(monthKey, locale)}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                      {events.map((event, index) => (
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
                            imageFallback={eventImageFallback}
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
              <aside className="hidden md:block">
                <div className="sticky top-28">
                  <EventMapDirectory
                    events={visibleEvents}
                    locale={locale}
                    activeEventId={activeMapEventId}
                    onEventSelect={setActiveMapEventId}
                    getEventHref={getEventHref}
                    eventImageFallback={eventImageFallback}
                  />
                </div>
              </aside>
            </div>
          )}
        </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
