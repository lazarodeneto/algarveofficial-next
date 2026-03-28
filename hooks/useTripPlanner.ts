"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Trip, TripEvent } from '@/types/tripPlanner';

const STORAGE_KEY = 'algarve_trip_planner';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadTrips(): Trip[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function useTripPlanner() {
  const isBrowser = typeof window !== "undefined";
  const [trips, setTrips] = useState<Trip[]>(() => (isBrowser ? loadTrips() : []));
  const isLoading = false;

  // Save trips whenever they change
  useEffect(() => {
    if (!isBrowser) return;
    if (!isLoading) {
      saveTrips(trips);
    }
  }, [isBrowser, trips, isLoading]);

  const createTrip = useCallback((data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
  }): Trip => {
    const newTrip: Trip = {
      id: generateId(),
      user_id: 'user-1', // Mock user
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      events: [],
      total_estimated_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTrips(prev => {
      const nextTrips = [...prev, newTrip];
      // Persist immediately so navigation right after creation keeps the new trip.
      saveTrips(nextTrips);
      return nextTrips;
    });
    return newTrip;
  }, []);

  const updateTrip = useCallback((tripId: string, data: Partial<Omit<Trip, 'id' | 'user_id' | 'created_at'>>): void => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const updated = { ...trip, ...data, updated_at: new Date().toISOString() };
      // Recalculate total cost if events changed
      if (data.events) {
        updated.total_estimated_cost = data.events.reduce((sum, e) => sum + (e.estimated_cost || 0), 0);
      }
      return updated;
    }));
  }, []);

  const deleteTrip = useCallback((tripId: string): void => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  }, []);

  const addEventToTrip = useCallback((tripId: string, event: Omit<TripEvent, 'id' | 'trip_id'>): void => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const newEvent: TripEvent = {
        ...event,
        id: generateId(),
        trip_id: tripId,
      };
      const events = [...trip.events, newEvent];
      return {
        ...trip,
        events,
        total_estimated_cost: events.reduce((sum, e) => sum + (e.estimated_cost || 0), 0),
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const updateEvent = useCallback((tripId: string, eventId: string, data: Partial<Omit<TripEvent, 'id' | 'trip_id'>>): void => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const events = trip.events.map(e => e.id === eventId ? { ...e, ...data } : e);
      return {
        ...trip,
        events,
        total_estimated_cost: events.reduce((sum, e) => sum + (e.estimated_cost || 0), 0),
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const removeEvent = useCallback((tripId: string, eventId: string): void => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const events = trip.events.filter(e => e.id !== eventId);
      return {
        ...trip,
        events,
        total_estimated_cost: events.reduce((sum, e) => sum + (e.estimated_cost || 0), 0),
        updated_at: new Date().toISOString(),
      };
    }));
  }, []);

  const getTripById = useCallback((tripId: string): Trip | undefined => {
    return trips.find(t => t.id === tripId);
  }, [trips]);

  const getEventsForDate = useCallback((tripId: string, date: string): TripEvent[] => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return [];
    return trip.events.filter(e => e.date === date).sort((a, b) => {
      if (!a.time_slot) return 1;
      if (!b.time_slot) return -1;
      return a.time_slot.localeCompare(b.time_slot);
    });
  }, [trips]);

  return {
    trips,
    isLoading,
    createTrip,
    updateTrip,
    deleteTrip,
    addEventToTrip,
    updateEvent,
    removeEvent,
    getTripById,
    getEventsForDate,
  };
}
