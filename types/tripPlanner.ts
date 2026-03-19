export interface TripEvent {
  id: string;
  trip_id: string;
  listing_id: string;
  date: string; // ISO date string
  time_slot?: string; // e.g., "09:00", "14:00"
  notes?: string;
  estimated_cost?: number;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  events: TripEvent[];
  total_estimated_cost?: number;
  created_at: string;
  updated_at: string;
}

export type CalendarView = 'day' | 'week';
