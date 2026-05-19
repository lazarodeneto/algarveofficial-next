"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Trip, TripEvent } from "@/types/tripPlanner";

const STORAGE_KEY = "algarve_trip_planner";

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function loadLocalTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalTrips(trips: Trip[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function clearLocalTrips(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body?.error?.message ??
      body?.error ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

async function apiRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(path, {
    method,
    credentials: "include",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  return readJson<T>(response);
}

function recalculateTrip(trip: Trip): Trip {
  return {
    ...trip,
    total_estimated_cost: trip.events.reduce((sum, event) => sum + (event.estimated_cost || 0), 0),
    updated_at: new Date().toISOString(),
  };
}

function eventPayload(
  event: Omit<TripEvent, "id" | "trip_id"> | Partial<Omit<TripEvent, "id" | "trip_id">>,
  mode: "create" | "patch" = "create",
) {
  const payload: Record<string, unknown> = {};

  if (mode === "create" || "event_type" in event) payload.event_type = event.event_type ?? "listing";
  if (mode === "create" || "listing_id" in event) payload.listing_id = event.listing_id || null;
  if (mode === "create" || "title" in event) payload.title = event.title;
  if (mode === "create" || "notes" in event) payload.notes = event.notes;
  if (mode === "create" || "day_date" in event || "date" in event) payload.day_date = event.day_date ?? event.date;
  if (mode === "create" || "start_time" in event || "time_slot" in event) payload.start_time = event.start_time ?? event.time_slot;
  if (mode === "create" || "end_time" in event) payload.end_time = event.end_time;
  if (mode === "create" || "estimated_cost" in event) payload.estimated_cost = event.estimated_cost;
  if (mode === "create" || "estimated_cost_cents" in event) payload.estimated_cost_cents = event.estimated_cost_cents;
  if (mode === "create" || "currency" in event) payload.currency = event.currency ?? "EUR";
  if (mode === "create" || "snapshot" in event) payload.snapshot = event.snapshot;
  if (mode === "create" || "metadata" in event) payload.metadata = event.metadata;

  return payload;
}

export function useTripPlanner() {
  const { isAuthenticated, user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>(() => loadLocalTrips());
  const [isLoading, setIsLoading] = useState(false);
  const migratedForUserRef = useRef<string | null>(null);
  const migrationInFlightRef = useRef(false);

  const persistLocal = useCallback((nextTrips: Trip[]) => {
    setTrips(nextTrips);
    if (!isAuthenticated) saveLocalTrips(nextTrips);
  }, [isAuthenticated]);

  const refreshServerTrips = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setIsLoading(true);
    try {
      const localDrafts = loadLocalTrips();
      if (localDrafts.length > 0 && migratedForUserRef.current !== user.id && !migrationInFlightRef.current) {
        migrationInFlightRef.current = true;
        for (const trip of localDrafts) {
          await apiRequest<{ trip: Trip }>("/api/trips", "POST", {
            title: trip.title,
            description: trip.description,
            start_date: trip.start_date || null,
            end_date: trip.end_date || null,
            party_size: trip.party_size,
            currency: trip.currency ?? "EUR",
            status: trip.status ?? "planning",
            metadata: {
              ...(trip.metadata ?? {}),
              source: "localStorage_import",
              localDraftId: trip.id,
            },
            events: trip.events.map((event) =>
              eventPayload({
                ...event,
                metadata: {
                  ...(event.metadata ?? {}),
                  source: "localStorage_import",
                  localDraftId: trip.id,
                  localEventId: event.id,
                },
              }),
            ),
          });
        }
        clearLocalTrips();
        migratedForUserRef.current = user.id;
        migrationInFlightRef.current = false;
      }

      const body = await apiRequest<{ trips: Trip[] }>("/api/trips", "GET");
      setTrips(body.trips);
    } catch (error) {
      console.error("Failed to load trips:", error);
      migrationInFlightRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshServerTrips();
      return;
    }

    setTrips(loadLocalTrips());
  }, [isAuthenticated, refreshServerTrips, user?.id]);

  const createTrip = useCallback((data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
  }): Trip => {
    const optimisticTrip: Trip = {
      id: generateId(),
      user_id: user?.id ?? "local-user",
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      events: [],
      total_estimated_cost: 0,
      currency: "EUR",
      status: "planning",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTrips((previous) => {
      const next = [optimisticTrip, ...previous];
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated) {
      apiRequest<{ trip: Trip }>("/api/trips", "POST", {
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
      })
        .then(({ trip }) => {
          setTrips((previous) => previous.map((item) => item.id === optimisticTrip.id ? trip : item));
        })
        .catch((error) => {
          console.error("Failed to create trip:", error);
          setTrips((previous) => previous.filter((item) => item.id !== optimisticTrip.id));
        });
    }

    return optimisticTrip;
  }, [isAuthenticated, user?.id]);

  const updateTrip = useCallback((tripId: string, data: Partial<Omit<Trip, "id" | "user_id" | "created_at">>): void => {
    setTrips((previous) => {
      const next = previous.map((trip) => trip.id === tripId ? recalculateTrip({ ...trip, ...data }) : trip);
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated && !tripId.startsWith("local-")) {
      apiRequest<{ trip: Trip }>(`/api/trips/${tripId}`, "PATCH", data)
        .then(({ trip }) => {
          if (trip) setTrips((previous) => previous.map((item) => item.id === tripId ? trip : item));
        })
        .catch((error) => console.error("Failed to update trip:", error));
    }
  }, [isAuthenticated]);

  const deleteTrip = useCallback((tripId: string): void => {
    setTrips((previous) => {
      const next = previous.filter((trip) => trip.id !== tripId);
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated && !tripId.startsWith("local-")) {
      apiRequest<{ ok: boolean }>(`/api/trips/${tripId}`, "DELETE")
        .catch((error) => console.error("Failed to delete trip:", error));
    }
  }, [isAuthenticated]);

  const addEventToTrip = useCallback((tripId: string, event: Omit<TripEvent, "id" | "trip_id">): void => {
    const optimisticEvent: TripEvent = {
      ...event,
      id: generateId(),
      trip_id: tripId,
      date: event.date || event.day_date || "",
      title: event.title ?? "Trip activity",
    };

    setTrips((previous) => {
      const next = previous.map((trip) => (
        trip.id === tripId ? recalculateTrip({ ...trip, events: [...trip.events, optimisticEvent] }) : trip
      ));
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated && !tripId.startsWith("local-")) {
      apiRequest<{ event: TripEvent }>(`/api/trips/${tripId}/events`, "POST", eventPayload(event))
        .then(({ event: savedEvent }) => {
          setTrips((previous) => previous.map((trip) => {
            if (trip.id !== tripId) return trip;
            return recalculateTrip({
              ...trip,
              events: trip.events.map((item) => item.id === optimisticEvent.id ? savedEvent : item),
            });
          }));
        })
        .catch((error) => console.error("Failed to add trip event:", error));
    }
  }, [isAuthenticated]);

  const updateEvent = useCallback((tripId: string, eventId: string, data: Partial<Omit<TripEvent, "id" | "trip_id">>): void => {
    setTrips((previous) => {
      const next = previous.map((trip) => {
        if (trip.id !== tripId) return trip;
        const events = trip.events.map((event) => event.id === eventId ? { ...event, ...data } : event);
        return recalculateTrip({ ...trip, events });
      });
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated && !tripId.startsWith("local-") && !eventId.startsWith("local-")) {
      apiRequest<{ event: TripEvent }>(`/api/trips/${tripId}/events/${eventId}`, "PATCH", eventPayload(data, "patch"))
        .then(({ event: savedEvent }) => {
          setTrips((previous) => previous.map((trip) => {
            if (trip.id !== tripId) return trip;
            return recalculateTrip({
              ...trip,
              events: trip.events.map((event) => event.id === eventId ? savedEvent : event),
            });
          }));
        })
        .catch((error) => console.error("Failed to update trip event:", error));
    }
  }, [isAuthenticated]);

  const removeEvent = useCallback((tripId: string, eventId: string): void => {
    setTrips((previous) => {
      const next = previous.map((trip) => {
        if (trip.id !== tripId) return trip;
        return recalculateTrip({ ...trip, events: trip.events.filter((event) => event.id !== eventId) });
      });
      if (!isAuthenticated) saveLocalTrips(next);
      return next;
    });

    if (isAuthenticated && !tripId.startsWith("local-") && !eventId.startsWith("local-")) {
      apiRequest<{ ok: boolean }>(`/api/trips/${tripId}/events/${eventId}`, "DELETE")
        .catch((error) => console.error("Failed to delete trip event:", error));
    }
  }, [isAuthenticated]);

  const getTripById = useCallback((tripId: string): Trip | undefined => {
    return trips.find((trip) => trip.id === tripId);
  }, [trips]);

  const getEventsForDate = useCallback((tripId: string, date: string): TripEvent[] => {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip) return [];
    return trip.events
      .filter((event) => event.date === date || event.day_date === date)
      .sort((a, b) => {
        const left = a.time_slot ?? a.start_time ?? "";
        const right = b.time_slot ?? b.start_time ?? "";
        if (!left) return 1;
        if (!right) return -1;
        return left.localeCompare(right);
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
    refreshTrips: refreshServerTrips,
  };
}
