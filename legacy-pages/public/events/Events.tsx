"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { format, parseISO, isAfter, startOfDay, addMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Filter,
  Star
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RouteMessageState } from '@/components/layout/RouteMessageState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventCategoryLabels, eventCategoryColors, type EventCategory } from '@/types/events';
import { usePublishedEvents } from '@/hooks/useEvents';
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

export default function Events() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { getText, isBlockEnabled } = useCmsPageBuilder("events");
  const today = startOfDay(new Date());
  const heroEnabled = isBlockEnabled("hero", true);
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');

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

  // Fetch events from database
  const timeFilter = 'upcoming';
  const { data: events = [], isLoading } = usePublishedEvents(selectedCategory, timeFilter);
  const featuredEvents = events.filter((e) => e.is_featured).slice(0, 3);
  const upcomingEvents = events.filter((e) => !featuredEvents.includes(e));

  // Group by month
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, typeof upcomingEvents> = {};
    upcomingEvents.forEach((event: any) => {
      const monthKey = format(parseISO(event.start_date), 'yyyy-MM');
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(event);
    });
    return grouped;
  }, [upcomingEvents]);

  return (
    <div className="min-h-screen bg-background" data-cms-page="events">
      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main>
        {heroEnabled ? (
          <CmsBlock pageId="events" blockId="hero" as="section" className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
            <LiveStyleHero
              badge={t('sections.events.label')}
              title={t('sections.events.title')}
              subtitle={t('sections.events.subtitle')}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
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
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v as EventCategory | 'all')}
                >
                  <SelectTrigger className="w-[220px] bg-card/90 border-border text-foreground">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">{t('sections.events.allCategories')}</SelectItem>
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
        {featuredEvents.length > 0 && (
          <section className={`${heroEnabled ? "py-12" : "pb-12"} app-container content-max`}>
            <h2 className="text-title font-serif font-semibold mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {t('sections.events.featured')}
            </h2>
            <div className="grid-adaptive">
              {featuredEvents.map((event: any, index: number) => (
                <m.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link href={`/events/${event.slug}`}>
                    <Card className="h-full overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Large Date Badge */}
                        <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-3 text-center border border-border/50 shadow-lg">
                          <span className="block text-3xl font-bold text-primary leading-none">
                            {event.start_date === event.end_date 
                              ? format(parseISO(event.start_date), 'd')
                              : `${format(parseISO(event.start_date), 'd')} - ${format(parseISO(event.end_date), 'd')}`
                            }
                          </span>
                          <span className="block text-sm font-medium text-foreground uppercase tracking-wide">
                            {format(parseISO(event.start_date), 'MMM')}
                          </span>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className={eventCategoryColors[event.category as EventCategory]}>
                            {getEventCategoryLabel(event.category as EventCategory)}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground">
                            {t('sections.events.featuredBadge')}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.short_description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(parseISO(event.start_date), 'MMM d')}
                              {event.start_date !== event.end_date && ` - ${format(parseISO(event.end_date), 'MMM d, yyyy')}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venue || event.location}</span>
                          </div>
                          {event.price_range && (
                            <div className="flex items-center gap-2 text-primary">
                              <Ticket className="h-4 w-4" />
                              <span>{event.price_range}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </m.div>
              ))}
            </div>
          </section>
        )}

        {/* All Events by Month */}
        <section
          className={`${featuredEvents.length > 0 || heroEnabled ? "py-12" : "pb-12"} app-container content-max`}
        >
          <h2 className="text-title font-serif font-semibold mb-8">
            {t('common.upcomingEvents')}
          </h2>
          
          {Object.entries(eventsByMonth).length === 0 ? (
            <RouteMessageState
              eyebrow={t('sections.events.label')}
              title={t('sections.events.noUpcoming')}
              description={t('sections.events.noUpcomingHint')}
              icon={<Calendar className="h-16 w-16" />}
              minHeightClassName="min-h-[22rem]"
            />
          ) : (
            <div className="space-y-12">
              {Object.entries(eventsByMonth).map(([monthKey, events]) => (
                <div key={monthKey}>
                  <h3 className="text-lg font-medium text-muted-foreground mb-4 border-b border-border pb-2">
                    {format(parseISO(`${monthKey}-01`), 'MMMM yyyy')}
                  </h3>
                  <div className="grid-adaptive">
                    {events.map((event: any, index: number) => (
                      <m.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Link href={`/events/${event.slug}`}>
                          <Card className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all group">
                            <div className="flex flex-col sm:flex-row">
                              <div className="w-full sm:w-24 flex-shrink-0 bg-muted flex flex-row sm:flex-col items-center justify-center gap-1 sm:gap-0 p-3">
                                <span className="text-2xl font-bold text-primary">
                                  {format(parseISO(event.start_date), 'd')}
                                </span>
                                <span className="text-xs text-muted-foreground uppercase">
                                  {format(parseISO(event.start_date), 'MMM')}
                                </span>
                              </div>
                              <CardContent className="p-4 flex-1 min-w-0">
                                <Badge className={`${eventCategoryColors[event.category as EventCategory]} text-xs mb-2 max-w-full`}>
                                  {getEventCategoryLabel(event.category as EventCategory)}
                                </Badge>
                                <h4 className="font-medium line-clamp-2 sm:line-clamp-1 break-words group-hover:text-primary transition-colors">
                                  {event.title}
                                </h4>
                                <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground min-w-0">
                                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span className="line-clamp-3 break-words">{event.location}</span>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        </Link>
                      </m.div>
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
