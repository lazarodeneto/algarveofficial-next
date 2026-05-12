export const LISTING_PERFORMANCE_EVENT_TYPES = [
  "listing_profile_view",
  "listing_website_click",
  "listing_phone_click",
  "listing_directions_click",
  "listing_whatsapp_click",
  "listing_booking_click",
] as const;

export type ListingPerformanceEventType = (typeof LISTING_PERFORMANCE_EVENT_TYPES)[number];

export type ListingPerformanceMetricKey =
  | "profileViews"
  | "websiteClicks"
  | "phoneClicks"
  | "directionsClicks"
  | "whatsAppClicks"
  | "bookingClicks";

export const LISTING_PERFORMANCE_EVENT_TO_METRIC = {
  listing_profile_view: "profileViews",
  listing_website_click: "websiteClicks",
  listing_phone_click: "phoneClicks",
  listing_directions_click: "directionsClicks",
  listing_whatsapp_click: "whatsAppClicks",
  listing_booking_click: "bookingClicks",
} as const satisfies Record<ListingPerformanceEventType, ListingPerformanceMetricKey>;

export const EMPTY_LISTING_PERFORMANCE_COUNTS: Record<ListingPerformanceMetricKey, number> = {
  profileViews: 0,
  websiteClicks: 0,
  phoneClicks: 0,
  directionsClicks: 0,
  whatsAppClicks: 0,
  bookingClicks: 0,
};

export function isListingPerformanceEventType(value: string): value is ListingPerformanceEventType {
  return LISTING_PERFORMANCE_EVENT_TYPES.includes(value as ListingPerformanceEventType);
}

export function createEmptyListingPerformanceCounts() {
  return { ...EMPTY_LISTING_PERFORMANCE_COUNTS };
}
