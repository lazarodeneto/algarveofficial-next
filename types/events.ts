export type EventStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'cancelled';

export type EventCategory = 
  | 'festival'
  | 'market'
  | 'golf-tournament'
  | 'gastronomy'
  | 'music'
  | 'cultural'
  | 'sporting'
  | 'seasonal';

export const eventCategoryLabels: Record<EventCategory, string> = {
  'festival': 'Festivals',
  'market': 'Markets',
  'golf-tournament': 'Golf Tournaments',
  'gastronomy': 'Gastronomy',
  'music': 'Music & Concerts',
  'cultural': 'Cultural Events',
  'sporting': 'Sporting Events',
  'seasonal': 'Seasonal Highlights',
};

export const eventCategoryColors: Record<EventCategory, string> = {
  'festival': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'market': 'bg-green-500/20 text-green-400 border-green-500/30',
  'golf-tournament': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'gastronomy': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'music': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'cultural': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'sporting': 'bg-red-500/20 text-red-400 border-red-500/30',
  'seasonal': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export const eventStatusLabels: Record<EventStatus, string> = {
  'draft': 'Draft',
  'pending_review': 'Pending Review',
  'published': 'Published',
  'rejected': 'Rejected',
  'cancelled': 'Cancelled',
};

export const eventStatusColors: Record<EventStatus, string> = {
  'draft': 'bg-muted text-muted-foreground',
  'pending_review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'published': 'bg-green-500/20 text-green-400 border-green-500/30',
  'rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
  'cancelled': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image: string | null;
  category: EventCategory;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  venue: string | null;
  city_id: string;
  ticket_url: string | null;
  price_range: string | null;
  is_featured: boolean;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  related_listing_ids: string[];
  tags: string[];
  status: EventStatus;
  rejection_reason: string | null;
  submitter_id: string;
  meta_title: string | null;
  meta_description: string | null;
  event_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  city?: {
    id: string;
    name: string;
    slug: string;
  };
  submitter?: {
    id: string;
    full_name: string | null;
  };
}

export interface EventFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  image: string;
  category: EventCategory;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  venue: string;
  city_id: string;
  ticket_url: string;
  price_range: string;
  is_featured: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  related_listing_ids: string[];
  tags: string[];
  status: EventStatus;
  meta_title: string;
  meta_description: string;
  event_data: Record<string, unknown>;
}
