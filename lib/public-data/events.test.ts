import { describe, expect, it } from "vitest";

import { normalizePublicEvent } from "@/lib/public-data/events";
import type { CalendarEvent } from "@/types/events";

function buildEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "event-1",
    title: "Algarve Smooth Jazz Festival",
    slug: "algarve-smooth-jazz-festival",
    description: null,
    short_description: null,
    image: null,
    category: "music",
    start_date: "2026-05-12",
    end_date: "2026-05-17",
    start_time: null,
    end_time: null,
    location: null,
    venue: null,
    city_id: "city-1",
    ticket_url: null,
    price_range: null,
    is_featured: false,
    is_recurring: false,
    recurrence_pattern: null,
    related_listing_ids: [],
    tags: [],
    status: "published",
    rejection_reason: null,
    submitter_id: "user-1",
    meta_title: null,
    meta_description: null,
    event_data: {},
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

describe("normalizePublicEvent", () => {
  it("keeps missing image as null and exposes a venue label only when real data exists", () => {
    const event = normalizePublicEvent(
      buildEvent({
        image: "   ",
        venue: " Pine Cliffs Resort ",
        location: "Albufeira",
      }),
      "en",
    );

    expect(event).toMatchObject({
      image: null,
      imageUrl: null,
      hasImage: false,
      venue: "Pine Cliffs Resort",
      location: "Albufeira",
      venueLabel: "Pine Cliffs Resort",
      dateRangeLabel: "May 12 - May 17, 2026",
    });
  });

  it("falls back from missing venue to location without inventing a venue", () => {
    const event = normalizePublicEvent(
      buildEvent({
        venue: null,
        location: "Zona Ribeirinha de Portimão",
      }),
      "en",
    );

    expect(event).toMatchObject({
      venue: null,
      location: "Zona Ribeirinha de Portimão",
      venueLabel: "Zona Ribeirinha de Portimão",
    });
  });

  it("rejects events whose public dates are only sortable placeholders", () => {
    const event = normalizePublicEvent(
      buildEvent({
        start_date: "2026-08-01",
        end_date: "2026-08-01",
        event_data: {
          start_date: null,
          end_date: null,
          event_status: "2026 return confirmed; exact dates pending",
          date_placeholder: {
            start_date: "2026-08-01",
            end_date: "2026-08-01",
          },
        },
      }),
      "en",
    );

    expect(event).toBeNull();
  });
});
