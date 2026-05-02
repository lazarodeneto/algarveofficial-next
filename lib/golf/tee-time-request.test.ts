import { describe, expect, it } from "vitest";

import { teeTimeRequestSchema, teeTimeStatusSchema } from "@/lib/golf/tee-time-request";

const LISTING_ID = "550e8400-e29b-41d4-a716-446655440001";
const COURSE_ID = "550e8400-e29b-41d4-a716-446655440002";

describe("teeTimeRequestSchema", () => {
  it("accepts an unauthenticated lead payload for a listing", () => {
    const parsed = teeTimeRequestSchema.safeParse({
      listing_id: LISTING_ID,
      name: "Alex Visitor",
      email: "alex@example.com",
      players: 2,
      preferred_time: "Morning",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts a lead payload for a course", () => {
    const parsed = teeTimeRequestSchema.safeParse({
      course_id: COURSE_ID,
      name: "Alex Visitor",
      email: "alex@example.com",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const parsed = teeTimeRequestSchema.safeParse({
      listing_id: LISTING_ID,
      name: "Alex Visitor",
      email: "not-an-email",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires a course or listing id", () => {
    const parsed = teeTimeRequestSchema.safeParse({
      name: "Alex Visitor",
      email: "alex@example.com",
    });

    expect(parsed.success).toBe(false);
  });

  it("limits players to one through eight", () => {
    const parsed = teeTimeRequestSchema.safeParse({
      listing_id: LISTING_ID,
      name: "Alex Visitor",
      email: "alex@example.com",
      players: 9,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("teeTimeStatusSchema", () => {
  it("accepts admin-supported status transitions", () => {
    expect(
      teeTimeStatusSchema.safeParse({
        id: LISTING_ID,
        status: "sent_to_course",
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported status values", () => {
    expect(
      teeTimeStatusSchema.safeParse({
        id: LISTING_ID,
        status: "booking_confirmed",
      }).success,
    ).toBe(false);
  });
});
