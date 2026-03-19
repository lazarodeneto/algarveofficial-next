export type CalendarView = "day" | "week";

export interface TripEvent {
  id: string;
  trip_id: string;
  listing_id: string;
  date: string;
  time_slot?: string;
  notes?: string;
  estimated_cost?: number;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  events: TripEvent[];
  total_estimated_cost: number;
  created_at: string;
  updated_at: string;
}
