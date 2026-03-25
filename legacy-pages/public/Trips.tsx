"use client";

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  Trash2,
  Edit2,
  ChevronRight,
  Euro,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTripPlanner } from '@/hooks/useTripPlanner';
import { TripCalendar } from '@/components/trip-planner/TripCalendar';
import { TripEventDialog } from '@/components/trip-planner/TripEventDialog';
import { CreateTripDialog } from '@/components/trip-planner/CreateTripDialog';
import { LoginModal } from '@/components/ui/login-modal';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Trip, TripEvent, CalendarView } from '@/types/tripPlanner';

export default function Trips() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const {
    trips,
    isLoading,
    createTrip,
    updateTrip,
    deleteTrip,
    addEventToTrip,
    updateEvent,
    removeEvent,
  } = useTripPlanner();

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>();
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventDate, setEventDate] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<TripEvent | undefined>();
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<{ tripId: string; eventId: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCreateAction = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setEditingTrip(undefined);
    setShowCreateDialog(true);
  };

  // Handlers
  const handleCreateTrip = (data: { title: string; description?: string; start_date: string; end_date: string }) => {
    if (editingTrip) {
      updateTrip(editingTrip.id, data);
      if (selectedTrip?.id === editingTrip.id) {
        setSelectedTrip({ ...selectedTrip, ...data });
      }
    } else {
      const newTrip = createTrip(data);
      setSelectedTrip(newTrip);
    }
    setEditingTrip(undefined);
  };

  const handleAddEvent = (date: string) => {
    setEventDate(date);
    setEditingEvent(undefined);
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEvent(event);
    setEventDate(event.date);
    setShowEventDialog(true);
  };

  const handleSaveEvent = (eventData: Omit<TripEvent, 'id' | 'trip_id'>) => {
    if (!selectedTrip) return;
    if (editingEvent) {
      updateEvent(selectedTrip.id, editingEvent.id, eventData);
    } else {
      addEventToTrip(selectedTrip.id, eventData);
    }
    const updated = trips.find(t => t.id === selectedTrip.id);
    if (updated) setSelectedTrip(updated);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!selectedTrip) return;
    setEventToDelete({ tripId: selectedTrip.id, eventId });
  };

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      removeEvent(eventToDelete.tripId, eventToDelete.eventId);
      setTimeout(() => {
        const updated = trips.find(t => t.id === eventToDelete.tripId);
        if (updated) setSelectedTrip(updated);
      }, 0);
    }
    setEventToDelete(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    setTripToDelete(tripId);
  };

  const confirmDeleteTrip = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete);
      if (selectedTrip?.id === tripToDelete) {
        setSelectedTrip(null);
      }
    }
    setTripToDelete(null);
  };

  const currentSelectedTrip = selectedTrip
    ? trips.find(t => t.id === selectedTrip.id) || null
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground flex items-center gap-3">
                <CalendarDays className="h-7 w-7 text-primary" />
                {t("dashboard.tripPlanner.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("dashboard.tripPlanner.subtitle")}
              </p>
            </div>
            {isAuthenticated && trips.length > 0 && (
              <Button onClick={handleCreateAction}>
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.tripPlanner.newTrip")}
              </Button>
            )}
          </motion.div>

          {/* Main Content */}
          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="py-16 text-center">
                  <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-semibold mb-2">{t("dashboard.tripPlanner.noTripsYet")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t("dashboard.tripPlanner.noTripsDescription")}
                  </p>
                  <Button onClick={handleCreateAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("dashboard.tripPlanner.createFirstTrip")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : !currentSelectedTrip ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {trips.map((trip, index) => {
                const duration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Card
                      className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-serif text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {trip.title}
                          </CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingTrip(trip); setShowCreateDialog(true); }}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {trip.description && <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d')}</span>
                          </div>
                          <Badge variant="secondary">{t("dashboard.tripPlanner.daysCount", { count: duration })}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {t("dashboard.tripPlanner.activitiesCount", { count: trip.events.length })}
                            </span>
                            {trip.total_estimated_cost && trip.total_estimated_cost > 0 && (
                              <span className="text-primary">
                                <Euro className="h-4 w-4 inline mr-1" />
                                {trip.total_estimated_cost}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTrip(null)}>
                        ← {t("dashboard.tripPlanner.backToTrips")}
                      </Button>
                      <div className="h-6 w-px bg-border" />
                      <CardTitle className="font-serif text-lg">{currentSelectedTrip.title}</CardTitle>
                    </div>
                    <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as CalendarView)}>
                      <TabsList>
                        <TabsTrigger value="day">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {t("dashboard.tripPlanner.day")}
                        </TabsTrigger>
                        <TabsTrigger value="week">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          {t("dashboard.tripPlanner.week")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <TripCalendar
                    trip={currentSelectedTrip}
                    view={calendarView}
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Dialogs */}
        <CreateTripDialog
          open={showCreateDialog}
          onClose={() => { setShowCreateDialog(false); setEditingTrip(undefined); }}
          onSave={handleCreateTrip}
          editTrip={editingTrip}
        />

        <TripEventDialog
          open={showEventDialog}
          onClose={() => { setShowEventDialog(false); setEditingEvent(undefined); }}
          onSave={handleSaveEvent}
          initialDate={eventDate}
          editEvent={editingEvent}
        />

        <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dashboard.tripPlanner.deleteTrip")}</AlertDialogTitle>
              <AlertDialogDescription>{t("dashboard.tripPlanner.deleteTripDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTrip} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dashboard.tripPlanner.removeActivity")}</AlertDialogTitle>
              <AlertDialogDescription>{t("dashboard.tripPlanner.removeActivityDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("dashboard.tripPlanner.remove")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </main>
      <Footer />
    </div>
  );
}
