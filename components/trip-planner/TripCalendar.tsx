"use client";

import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, Euro, Trash2, Edit2, CirclePlus, CircleX } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Trip, TripEvent, CalendarView } from '@/types/tripPlanner';
import { usePublishedListings } from '@/hooks/useListings';

interface TripCalendarProps {
  trip: Trip;
  view: CalendarView;
  onAddEvent: (date: string) => void;
  onEditEvent: (event: TripEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function TripCalendar({ trip, view, onAddEvent, onEditEvent, onDeleteEvent }: TripCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => parseISO(trip.start_date));
  const { data: listings = [] } = usePublishedListings();

  const tripStart = parseISO(trip.start_date);
  const tripEnd = parseISO(trip.end_date);

  // Get days to display based on view
  const displayDays = useMemo(() => {
    if (view === 'day') {
      return [currentDate];
    }
    // Week view - show 7 days starting from the week start
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [view, currentDate]);

  // Navigate
  const goNext = () => {
    setCurrentDate(prev => addDays(prev, view === 'day' ? 1 : 7));
  };

  const goPrev = () => {
    setCurrentDate(prev => addDays(prev, view === 'day' ? -1 : -7));
  };

  const goToToday = () => {
    const today = new Date();
    if (isWithinInterval(today, { start: tripStart, end: tripEnd })) {
      setCurrentDate(today);
    } else {
      setCurrentDate(tripStart);
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return trip.events.filter(e => e.date === dateStr).sort((a, b) => {
      if (!a.time_slot) return 1;
      if (!b.time_slot) return -1;
      return a.time_slot.localeCompare(b.time_slot);
    });
  };

  // Get listing info
  const getListingInfo = (listingId: string) => {
    return listings.find(l => l.id === listingId);
  };

  // Check if day is within trip range
  const isDayInTrip = (day: Date) => {
    return isWithinInterval(day, { start: tripStart, end: tripEnd });
  };

  // Check if day is in the past
  const isDayPast = (day: Date) => {
    return isBefore(startOfDay(day), startOfDay(new Date()));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h3 className="text-lg font-serif font-semibold">
          {view === 'day' 
            ? format(currentDate, 'EEEE, MMMM d, yyyy')
            : `${format(displayDays[0], 'MMM d')} - ${format(displayDays[6], 'MMM d, yyyy')}`
          }
        </h3>
        <div className="w-[120px]" /> {/* Spacer for alignment */}
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        "grid gap-4",
        view === 'day' ? 'grid-cols-1' : 'grid-cols-7'
      )}>
        {displayDays.map((day) => {
          const events = getEventsForDay(day);
          const isInTrip = isDayInTrip(day);
          const isToday = isSameDay(day, new Date());
          const isPast = isDayPast(day);
          const isFutureInTrip = isInTrip && !isPast;
          const hasEvents = events.length > 0;

          // Handle full box click for future days without events
          const handleDayClick = () => {
            if (isFutureInTrip && !hasEvents) {
              onAddEvent(format(day, 'yyyy-MM-dd'));
            }
          };

          return (
            <m.div
              key={day.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleDayClick}
              className={cn(
                "min-h-[200px] rounded-lg flex flex-col group",
                // Past days - muted and non-interactive
                isPast && isInTrip && "opacity-50 cursor-not-allowed border border-border/30 bg-muted/30",
                isPast && !isInTrip && "opacity-40 cursor-not-allowed border border-border/20 bg-muted/20",
                // Future days in trip - interactive with solid border
                isFutureInTrip && "border-2 border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all",
                // Future days not in trip - muted
                !isPast && !isInTrip && "opacity-50 border border-border/30 bg-muted/30",
                // Today highlight
                isToday && "ring-2 ring-primary"
              )}
            >
              {/* Day Header */}
              <div className={cn(
                "p-3 border-b",
                isToday ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-border"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-xl font-bold",
                      isToday && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  {/* Show + button only for future days WITH events (quick add) */}
                  {isFutureInTrip && hasEvents && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddEvent(format(day, 'yyyy-MM-dd'));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Events or Icons */}
              <div className="p-2 space-y-2 flex-1 flex flex-col">
                <AnimatePresence>
                  {/* Past day in trip - show CircleX icon */}
                  {isPast && isInTrip && events.length === 0 && (
                    <div className="flex items-center justify-center flex-1 min-h-[100px]">
                      <CircleX className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  
                  {/* Future day in trip without events - show CirclePlus icon */}
                  {isFutureInTrip && events.length === 0 && (
                    <div className="flex items-center justify-center flex-1 min-h-[100px]">
                      <CirclePlus className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                  )}
                  {events.map((event) => {
                    const listing = getListingInfo(event.listing_id);
                    return (
                      <m.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors group">
                          <CardContent className="p-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-1">
                                  {listing?.name ?? 'Unknown Listing'}
                                </p>
                                {event.time_slot && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {event.time_slot}
                                  </div>
                                )}
                                {event.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {event.notes}
                                  </p>
                                )}
                                {event.estimated_cost && event.estimated_cost > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Euro className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">
                                      {event.estimated_cost}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onEditEvent(event)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => onDeleteEvent(event.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </m.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </m.div>
          );
        })}
      </div>

      {/* Trip Info Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
        <span>
          Trip: {format(tripStart, 'MMM d')} - {format(tripEnd, 'MMM d, yyyy')}
        </span>
        <div className="flex items-center gap-4">
          <span>{trip.events.length} activities</span>
          {trip.total_estimated_cost && trip.total_estimated_cost > 0 && (
            <Badge variant="outline" className="text-primary border-primary/30">
              <Euro className="h-3 w-3 mr-1" />
              {trip.total_estimated_cost} estimated
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
