"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CalendarEvent, EventStatus, EventCategory, EventFormData } from '@/types/events';
import type { Json } from '@/integrations/supabase/types';

type AdminEventsFilters = {
  status?: EventStatus;
  category?: EventCategory;
  time?: 'upcoming' | 'past' | 'all';
};

const PENDING_EVENTS_MODERATION_FILTERS: Readonly<AdminEventsFilters> = {
  status: 'pending_review',
  time: 'all',
};

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

  return useQuery({
    queryKey: ['events', 'published', category, timeFilter],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('status', 'published');

      if (timeFilter === 'upcoming') {
        query = query.gte('end_date', today);
      } else if (timeFilter === 'past') {
        query = query.lt('end_date', today);
      }

      query = query.order('start_date', { ascending: timeFilter !== 'past' });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: isBrowser,
    initialData: [] as CalendarEvent[],
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
  });
}

// Fetch single event by slug (for public detail page)
export function useEventBySlug(slug: string) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['event', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          city:cities(id, name, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as CalendarEvent | null;
    },
    enabled: isBrowser && !!slug,
    initialData: null as CalendarEvent | null,
  });
}

// Fetch related events (same category or city, excluding current event)
export function useRelatedEvents(eventId: string | undefined, category: string | undefined, cityId: string | undefined, limit = 4) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['events', 'related', eventId, category, cityId],
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
        .gte('end_date', new Date().toISOString().split('T')[0])
        .neq('id', eventId)
        .or(`category.eq.${category},city_id.eq.${cityId}`)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: isBrowser && !!eventId && (!!category || !!cityId),
    initialData: [] as CalendarEvent[],
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
        slug: data.slug!,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Helper to generate slug from title
export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
