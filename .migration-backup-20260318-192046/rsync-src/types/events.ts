export type EventCategory =
  | "festival"
  | "market"
  | "golf-tournament"
  | "gastronomy"
  | "music"
  | "cultural"
  | "sporting"
  | "seasonal";

export type EventStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export interface EventCity {
  id: string;
  name: string;
  slug?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  category: EventCategory | string;
  status?: EventStatus | string;
  start_date: string;
  end_date: string;
  city_id?: string | null;
  city?: EventCity | null;
  is_featured?: boolean;
  description?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  venue?: string | null;
  external_url?: string | null;
  ticket_url?: string | null;
  [key: string]: unknown;
}

export interface EventFormData {
  title: string;
  slug: string;
  category: EventCategory | string;
  start_date: string;
  end_date: string;
  city_id: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  venue?: string;
  external_url?: string;
  ticket_url?: string;
  is_featured?: boolean;
  status?: EventStatus | string;
  [key: string]: unknown;
}

export const eventCategoryLabels: Record<EventCategory, string> = {
  festival: "Festival",
  market: "Market",
  "golf-tournament": "Golf Tournament",
  gastronomy: "Gastronomy",
  music: "Music",
  cultural: "Cultural",
  sporting: "Sporting",
  seasonal: "Seasonal",
};

export const eventCategoryColors: Record<EventCategory, string> = {
  festival: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30",
  market: "bg-amber-500/15 text-amber-100 border-amber-400/30",
  "golf-tournament": "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
  gastronomy: "bg-orange-500/15 text-orange-100 border-orange-400/30",
  music: "bg-sky-500/15 text-sky-100 border-sky-400/30",
  cultural: "bg-violet-500/15 text-violet-100 border-violet-400/30",
  sporting: "bg-red-500/15 text-red-100 border-red-400/30",
  seasonal: "bg-teal-500/15 text-teal-100 border-teal-400/30",
};
