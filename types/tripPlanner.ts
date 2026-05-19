export interface TripEvent {
  id: string;
  trip_id: string;
  listing_id: string;
  event_type?: string;
  title?: string;
  date: string; // ISO date string, kept for existing UI compatibility
  day_date?: string;
  time_slot?: string; // e.g., "09:00", "14:00"
  start_time?: string;
  end_time?: string;
  notes?: string;
  estimated_cost?: number;
  estimated_cost_cents?: number;
  currency?: string;
  snapshot?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  party_size?: number;
  currency?: string;
  status?: "planning" | "active" | "completed" | "archived";
  metadata?: Record<string, unknown>;
  events: TripEvent[];
  total_estimated_cost?: number;
  created_at: string;
  updated_at: string;
}

export type CalendarView = 'day' | 'week';
