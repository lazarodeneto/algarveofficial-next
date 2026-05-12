"use client";
import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CalendarEvent, EventStatus, EventCategory, EventFormData } from '@/types/events';
import type { Json } from '@/integrations/supabase/types';
import {
  getDisallowedSlugInputError,
  getSlugValidationError,
  normalizeSlug,
  slugifyEntityName,
} from '@/lib/slugify';
import {
  getPublicEventCutoffDate,
  isPublicEventVisibleByDate,
} from '@/lib/events/publicVisibility';
import { localizeEvent, localizeEvents } from '@/lib/events/i18n';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';
import { invalidateAdminInboxQueries } from '@/lib/query-invalidation';

type AdminEventsFilters = {
  status?: EventStatus;
  category?: EventCategory;
  time?: 'upcoming' | 'past' | 'all';
};

const PENDING_EVENTS_MODERATION_FILTERS: Readonly<AdminEventsFilters> = {
  status: 'pending_review',
  time: 'all',
};

function normalizeEventSlug(value: string | undefined): string {
  const raw = value ?? "";
  const disallowedError = getDisallowedSlugInputError(raw);
  if (disallowedError) throw new Error(disallowedError);

  const slug = normalizeSlug(raw, { entityType: "content" });
  const slugError = getSlugValidationError(slug, { entityType: "content" });
  if (slugError) throw new Error(slugError);

  return slug;
}

function invalidateEventQueries(queryClient: QueryClient, eventId?: string) {
  void invalidateAdminInboxQueries(queryClient);
  void queryClient.invalidateQueries({ queryKey: ['events'], exact: false });
  void queryClient.invalidateQueries({ queryKey: ['event'], exact: false });
  void queryClient.invalidateQueries({ queryKey: ['events-page'], exact: false });
  if (eventId) {
    void queryClient.invalidateQueries({ queryKey: ['event', eventId], exact: true });
  }
}

async function fetchAdminEvents(filters?: AdminEventsFilters): Promise<CalendarEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  let query = supabase
    .from('events')
    .select(`
      *,
      city:cities(id, name, slug)
    `);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const time = filters?.time ?? 'upcoming';
  if (time === 'upcoming') {
    query = query.gte('end_date', today);
  } else if (time === 'past') {
    query = query.lt('end_date', today);
  }

  query = query.order(time === 'past' ? 'end_date' : 'start_date', { ascending: time !== 'past' });

  const { data, error } = await query;
  if (error) throw error;

  const events = (data ?? []) as CalendarEvent[];
  if (events.length === 0) {
    return events;
  }

  const submitterIds = Array.from(
    new Set(events.map((event) => event.submitter_id).filter(Boolean)),
  );

  if (submitterIds.length === 0) {
    return events;
  }

  const { data: submittersData, error: submittersError } = await supabase
    .from('public_profiles')
    .select('id, full_name')
    .in('id', submitterIds);

  if (submittersError || !submittersData) {
    return events;
  }

  const submitterMap = new Map<string, { id: string; full_name: string | null }>();
  for (const submitter of submittersData) {
    if (!submitter.id) continue;
    submitterMap.set(submitter.id, {
      id: submitter.id,
      full_name: submitter.full_name ?? null,
    });
  }

  return events.map((event) => ({
    ...event,
    submitter: submitterMap.get(event.submitter_id),
  }));
}

// Fetch published events for public page
export function usePublishedEvents(category?: EventCategory | 'all', timeFilter: 'upcoming' | 'past' | 'all' = 'upcoming') {
  const isBrowser = typeof window !== "undefined";
  const locale = useCurrentLocale();

  return useQuery({
    queryKey: ['events', 'published', category, timeFilter, locale],
    queryFn: async () => {
      const today = getPublicEventCutoffDate();
      let query = supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('status', 'published')
        .gte('end_date', today);

      query = query.order('start_date', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return localizeEvents((data ?? []) as CalendarEvent[], locale);
    },
    enabled: isBrowser,
    placeholderData: [] as CalendarEvent[],
    staleTime: 60 * 1000,
  });
}

// Fetch all events for admin with filters
export function useAdminEvents(filters?: AdminEventsFilters) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['events', 'admin', filters],
    queryFn: () => fetchAdminEvents(filters),
    enabled: isBrowser,
    initialData: [] as CalendarEvent[],
    staleTime: 0,
  });
}

// Fetch owner's events
export function useOwnerEvents() {
  const { user } = useAuth();
  const isBrowser = typeof window !== "undefined";
  
  return useQuery({
    queryKey: ['events', 'owner', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('submitter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: isBrowser && !!user?.id,
    initialData: [] as CalendarEvent[],
    staleTime: 0,
  });
}

// Fetch single event by ID
export function useEvent(id: string | undefined) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const event = data as CalendarEvent;
      const { data: submitterData } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .eq('id', event.submitter_id)
        .maybeSingle();

      if (!submitterData?.id) {
        return event;
      }

      return {
        ...event,
        submitter: {
          id: submitterData.id,
          full_name: submitterData.full_name ?? null,
        },
      } as CalendarEvent;
    },
    enabled: isBrowser && !!id,
    initialData: null as CalendarEvent | null,
    staleTime: 0,
  });
}

// Fetch single event by slug (for public detail page)
export function useEventBySlug(slug: string, initialEvent?: CalendarEvent | null) {
  const isBrowser = typeof window !== "undefined";
  const locale = useCurrentLocale();
  const normalizedSlug = slug || initialEvent?.slug || "";
  const localizedInitialEvent = localizeEvent(initialEvent ?? null, locale);

  return useQuery({
    queryKey: ['event', 'slug', normalizedSlug, locale],
    queryFn: async () => {
      if (!normalizedSlug) {
        return localizedInitialEvent && isPublicEventVisibleByDate(localizedInitialEvent) ? localizedInitialEvent : null;
      }
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('slug', normalizedSlug)
        .eq('status', 'published')
        .gte('end_date', getPublicEventCutoffDate())
        .maybeSingle();

      if (error) throw error;
      return localizeEvent((data as CalendarEvent | null) ??
        (localizedInitialEvent && isPublicEventVisibleByDate(localizedInitialEvent) ? localizedInitialEvent : null), locale);
    },
    enabled: isBrowser && !!normalizedSlug,
    ...(localizedInitialEvent ? { initialData: localizedInitialEvent, initialDataUpdatedAt: 0 } : {}),
    staleTime: 30 * 1000,
  });
}

// Fetch related events (same category or city, excluding current event)
export function useRelatedEvents(eventId: string | undefined, category: string | undefined, cityId: string | undefined, limit = 4) {
  const isBrowser = typeof window !== "undefined";
  const locale = useCurrentLocale();

  return useQuery({
    queryKey: ['events', 'related', eventId, category, cityId, locale],
    queryFn: async () => {
      if (!eventId) return [];
      
      // Query events that are in the same category OR same city
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('status', 'published')
        .gte('end_date', getPublicEventCutoffDate())
        .neq('id', eventId)
        .or(`category.eq.${category},city_id.eq.${cityId}`)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return localizeEvents((data ?? []) as CalendarEvent[], locale);
    },
    enabled: isBrowser && !!eventId && (!!category || !!cityId),
    initialData: [] as CalendarEvent[],
    staleTime: 60 * 1000,
  });
}

// Count pending events for moderation badge
export function usePendingEventsCount() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['events', 'admin', PENDING_EVENTS_MODERATION_FILTERS],
    queryFn: () => fetchAdminEvents(PENDING_EVENTS_MODERATION_FILTERS),
    select: (events) => events.length,
    enabled: isBrowser,
    initialData: [] as CalendarEvent[],
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const insertData = {
        title: data.title!,
        slug: normalizeEventSlug(data.slug),
        category: data.category!,
        start_date: data.start_date!,
        end_date: data.end_date!,
        city_id: data.city_id!,
        submitter_id: user.id,
        description: data.description ?? null,
        short_description: data.short_description ?? null,
        image: data.image ?? null,
        start_time: data.start_time ?? null,
        end_time: data.end_time ?? null,
        location: data.location ?? null,
        venue: data.venue ?? null,
        ticket_url: data.ticket_url ?? null,
        price_range: data.price_range ?? null,
        is_featured: data.is_featured ?? false,
        is_recurring: data.is_recurring ?? false,
        recurrence_pattern: data.recurrence_pattern ?? null,
        tags: data.tags ?? [],
        status: data.status ?? 'draft',
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
        event_data: (data.event_data || {}) as Json,
      };

      const { data: result, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (event) => {
      invalidateEventQueries(queryClient, event?.id);
    },
  });
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      // Prepare update object, casting event_data and converting empty strings to null for nullable fields
      const { event_data, ...rest } = data;
      const cleaned: Record<string, unknown> = { ...rest };
      if (typeof cleaned.slug === "string") {
        cleaned.slug = normalizeEventSlug(cleaned.slug);
      }
      const nullableStringFields = ['start_time', 'end_time', 'location', 'venue', 'description', 'short_description', 'image', 'ticket_url', 'price_range', 'meta_title', 'meta_description', 'rejection_reason', 'recurrence_pattern'];
      for (const key of nullableStringFields) {
        if (key in cleaned && cleaned[key] === '') {
          cleaned[key] = null;
        }
      }
      const updatePayload = {
        ...cleaned,
        ...(event_data !== undefined ? { event_data: event_data as Json } : {}),
      };
      
      const { data: result, error } = await supabase
        .from('events')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, { id }) => {
      invalidateEventQueries(queryClient, id);
    },
  });
}

// Approve event mutation (admin only)
export function useApproveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_event, id) => {
      invalidateEventQueries(queryClient, id);
    },
  });
}

// Reject event mutation (admin only)
export function useRejectEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_event, variables) => {
      invalidateEventQueries(queryClient, variables.id);
    },
  });
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_event, id) => {
      invalidateEventQueries(queryClient, id);
    },
  });
}

// Helper to generate slug from title
export function generateEventSlug(title: string): string {
  return slugifyEntityName(title, { entityType: "content" });
}
