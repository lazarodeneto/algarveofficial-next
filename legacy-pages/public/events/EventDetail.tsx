import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { m } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  ExternalLink,
  ArrowLeft,
  Share2,
  Users,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { eventCategoryLabels, eventCategoryColors, type EventCategory } from '@/types/events';
import { useEventBySlug, useRelatedEvents } from '@/hooks/useEvents';
import { eventCategoryTemplates } from '@/lib/eventCategoryTemplates';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, error } = useEventBySlug(slug || '');
  
  // Fetch related events
  const { data: relatedEvents } = useRelatedEvents(
    event?.id,
    event?.category,
    event?.city_id,
    4
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="app-container content-max">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
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
        <main className="pt-32 pb-16">
          <div className="app-container text-center">
            <h1 className="text-4xl font-serif font-medium text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <Button variant="gold" asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
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
  
  // Get category-specific template for displaying event_data fields
  const categoryTemplate = eventCategoryTemplates[event.category as EventCategory];
  const eventData = event.event_data || {};

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.short_description || event.description?.slice(0, 150),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://algarveofficial.com/" },
          { name: "Events", url: "https://algarveofficial.com/events" },
          { name: event.title, url: `https://algarveofficial.com/events/${event.slug}` },
        ]}
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="app-container content-max">
          {/* Back Link */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              href="/events" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </m.div>

          {/* Hero Image */}
          {event.image && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Large Date Badge */}
              <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-5 py-4 text-center border border-border/50 shadow-xl">
                <span className="block text-4xl lg:text-5xl font-bold text-primary leading-none">
                  {isSingleDay 
                    ? format(startDate, 'd')
                    : `${format(startDate, 'd')} - ${format(endDate, 'd')}`
                  }
                </span>
                <span className="block text-sm lg:text-base font-medium text-foreground uppercase tracking-wide mt-1">
                  {format(startDate, 'MMM')}
                </span>
              </div>
              
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge className={eventCategoryColors[event.category as EventCategory]}>
                  {eventCategoryLabels[event.category as EventCategory]}
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>
            </m.div>
          )}

          {/* Title & Actions */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-medium text-foreground mb-2">
                {event.title}
              </h1>
              {event.short_description && (
                <p className="text-lg text-muted-foreground">
                  {event.short_description}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {event.ticket_url && (
                <Button variant="gold" size="sm" asChild>
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                    <Ticket className="h-4 w-4 mr-2" />
                    Get Tickets
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </m.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Description */}
              {event.description && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-serif">About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      {event.description.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="text-muted-foreground mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Category-Specific Details */}
              {categoryTemplate && Object.keys(eventData).length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-serif">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {categoryTemplate.fields.map((field) => {
                        const value = eventData[field.name];
                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                          return null;
                        }
                        
                        let displayValue: React.ReactNode = String(value);
                        
                        if (field.type === 'checkbox') {
                          displayValue = value ? 'Yes' : 'No';
                        } else if (field.type === 'multiselect' || field.type === 'tags') {
                          displayValue = (
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(value) ? value : []).map((v: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          );
                        } else if (field.type === 'select' && field.options) {
                          const option = field.options.find(o => o.value === value);
                          displayValue = option?.label || String(value);
                        }
                        
                        return (
                          <div key={field.name} className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                              {field.label}
                            </span>
                            <span className="text-foreground">
                              {displayValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </m.div>

            {/* Sidebar */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Date & Time Card */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-foreground font-medium">
                      {isSingleDay 
                        ? format(startDate, 'EEEE, MMMM d, yyyy')
                        : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
                      }
                    </p>
                  </div>
                  {(event.start_time || event.end_time) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {event.start_time && format(parseISO(`2000-01-01T${event.start_time}`), 'h:mm a')}
                        {event.start_time && event.end_time && ' - '}
                        {event.end_time && format(parseISO(`2000-01-01T${event.end_time}`), 'h:mm a')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Card */}
              {(event.venue || event.location) && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.venue && (
                      <p className="text-foreground font-medium">{event.venue}</p>
                    )}
                    {event.location && (
                      <p className="text-muted-foreground text-sm">{event.location}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pricing Card */}
              {event.price_range && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-primary" />
                      Admission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-primary">{event.price_range}</p>
                    {event.ticket_url && (
                      <Button variant="gold" className="w-full mt-4" asChild>
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                          Purchase Tickets
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </m.div>
          </div>

          {/* Related Events Section */}
          {relatedEvents && relatedEvents.length > 0 && (
            <m.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-medium text-foreground">
                  Related Events
                </h2>
                <Link 
                  href="/events" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedEvents.map((relatedEvent) => {
                  const relStartDate = parseISO(relatedEvent.start_date);
                  const relEndDate = parseISO(relatedEvent.end_date);
                  const relIsSingleDay = relatedEvent.start_date === relatedEvent.end_date;
                  
                  return (
                    <Link
                      key={relatedEvent.id}
                      href={`/events/${relatedEvent.slug}`}
                      className="group"
                    >
                      <Card className="bg-card border-border overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5 h-full">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {relatedEvent.image ? (
                            <img
                              src={relatedEvent.image}
                              alt={relatedEvent.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Calendar className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Date Badge */}
                          <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-sm rounded-md px-2 py-1 text-center border border-border/50">
                            <span className="block text-lg font-bold text-primary leading-none">
                              {relIsSingleDay 
                                ? format(relStartDate, 'd')
                                : `${format(relStartDate, 'd')}-${format(relEndDate, 'd')}`
                              }
                            </span>
                            <span className="block text-xs font-medium text-foreground uppercase">
                              {format(relStartDate, 'MMM')}
                            </span>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-2 left-2">
                            <Badge 
                              className={`text-xs ${eventCategoryColors[relatedEvent.category as EventCategory]}`}
                            >
                              {eventCategoryLabels[relatedEvent.category as EventCategory]}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-3">
                          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                            {relatedEvent.title}
                          </h3>
                          {relatedEvent.city && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {relatedEvent.city.name}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </m.section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
