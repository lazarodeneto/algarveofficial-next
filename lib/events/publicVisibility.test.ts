import { describe, expect, it } from "vitest";

import {
  hasPublicEventRealDateRange,
  isPublicEventPast,
  isPublicEventVisibleByDate,
  toPublicEventDateKey,
} from "@/lib/events/publicVisibility";

describe("public event visibility", () => {
  const now = new Date("2026-05-12T12:00:00Z");

  it("accepts valid date-only keys and rejects impossible dates", () => {
    expect(toPublicEventDateKey("2026-05-17")).toBe("2026-05-17");
    expect(toPublicEventDateKey("2026-02-31")).toBeNull();
    expect(toPublicEventDateKey(null)).toBeNull();
  });

  it("does not treat placeholder pending dates as real public dates", () => {
    const event = {
      start_date: "2026-08-01",
      end_date: "2026-08-01",
      event_data: {
        start_date: null,
        end_date: null,
        date_status: "2026 return confirmed; exact dates pending",
        date_placeholder: {
          start_date: "2026-08-01",
          end_date: "2026-08-01",
        },
      },
    };

    expect(hasPublicEventRealDateRange(event)).toBe(false);
    expect(isPublicEventVisibleByDate(event, now)).toBe(false);
  });

  it("keeps upcoming and past visibility separate", () => {
    const upcoming = {
      start_date: "2026-05-12",
      end_date: "2026-05-17",
      event_data: {},
    };
    const past = {
      start_date: "2026-05-01",
      end_date: "2026-05-02",
      event_data: {},
    };

    expect(isPublicEventVisibleByDate(upcoming, now)).toBe(true);
    expect(isPublicEventPast(upcoming, now)).toBe(false);
    expect(isPublicEventVisibleByDate(past, now)).toBe(false);
    expect(isPublicEventPast(past, now)).toBe(true);
  });

  it("treats events ending today in Lisbon as upcoming, not past", () => {
    const today = {
      start_date: "2026-05-10",
      end_date: "2026-05-12",
      event_data: {},
    };

    expect(isPublicEventVisibleByDate(today, now)).toBe(true);
    expect(isPublicEventPast(today, now)).toBe(false);
  });

  it("classifies invalid date ranges as neither upcoming nor past", () => {
    const invalidRange = {
      start_date: "2026-05-20",
      end_date: "2026-05-10",
      event_data: {},
    };

    expect(hasPublicEventRealDateRange(invalidRange)).toBe(false);
    expect(isPublicEventVisibleByDate(invalidRange, now)).toBe(false);
    expect(isPublicEventPast(invalidRange, now)).toBe(false);
  });
});
