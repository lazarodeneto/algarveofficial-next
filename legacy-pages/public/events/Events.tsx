import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO, isAfter, startOfDay, addMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Filter,
  Star,
  Archive
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventCategoryLabels, eventCategoryColors, type EventCategory } from '@/types/events';
import { usePublishedEvents } from '@/hooks/useEvents';
import { SeoHead } from '@/components/seo/SeoHead';

export default function Events() {
  const { t } = useTranslation();
  const today = startOfDay(new Date());
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [showPast, setShowPast] = useState(false);

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
  const timeFilter = showPast ? 'past' : 'upcoming';
  const { data: events = [], isLoading } = usePublishedEvents(selectedCategory, timeFilter);
  const featuredEvents = showPast ? [] : events.filter((e) => e.is_featured).slice(0, 3);
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
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Algarve Events Calendar"
        description="Browse festivals, golf tournaments, gastronomy events, and seasonal highlights across the Algarve with regularly updated event listings."
        canonicalUrl="https://algarveofficial.com/events"
        keywords="Algarve events, Algarve festivals, Portugal events calendar, golf tournaments Algarve, gastronomy Algarve"
      />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
          <div className="relative app-container text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-6"
            >
              {t('sections.events.label', 'Algarve Calendar')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-hero font-serif font-medium text-foreground"
            >
              {t('sections.events.title', 'Events & Season')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto readable"
            >
              {t('sections.events.subtitle', 'Festivals, markets, and seasonal highlights across Portugal\'s stunning southern coast.')}
            </motion.p>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mt-10"
            >
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as EventCategory | 'all')}
              >
                <SelectTrigger className="w-[200px] glass-box border border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="glass-box border border-white/20">
                  <SelectItem value="all">{t('sections.events.allCategories')}</SelectItem>
                  {[...categories]
                    .map(([key]) => ({ key, label: getEventCategoryLabel(key) }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map(({ key, label }) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 glass-box border border-white/20 rounded-md px-4 py-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="past-toggle" className="text-sm cursor-pointer select-none">
                  {t('sections.events.showPast', 'Past Events')}
                </Label>
                <Switch
                  id="past-toggle"
                  checked={showPast}
                  onCheckedChange={setShowPast}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-12 app-container content-max">
            <h2 className="text-title font-serif font-semibold mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              {t('sections.events.featured')}
            </h2>
            <div className="grid-adaptive">
              {featuredEvents.map((event: any, index: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link to={`/events/${event.slug}`}>
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
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Events by Month */}
        <section className="py-12 app-container content-max">
          <h2 className="text-title font-serif font-semibold mb-8">
            {showPast 
              ? t('sections.events.pastEvents', 'Past Events') 
              : t('common.upcomingEvents', 'Upcoming Events')
            }
          </h2>
          
          {Object.entries(eventsByMonth).length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-serif font-semibold mb-2">{t('sections.events.noUpcoming')}</h3>
                <p className="text-muted-foreground">
                  {t('sections.events.noUpcomingHint')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {Object.entries(eventsByMonth).map(([monthKey, events]) => (
                <div key={monthKey}>
                  <h3 className="text-lg font-medium text-muted-foreground mb-4 border-b border-border pb-2">
                    {format(parseISO(`${monthKey}-01`), 'MMMM yyyy')}
                  </h3>
                  <div className="grid-adaptive">
                    {events.map((event: any, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <Link to={`/events/${event.slug}`}>
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
