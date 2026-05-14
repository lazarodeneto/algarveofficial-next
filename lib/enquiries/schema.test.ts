import { describe, expect, it } from "vitest";

import { enquirySchema, normalizeEnquiryPayload } from "./schema";

describe("enquirySchema", () => {
  it("accepts contact form messages that omit optional listing and agent fields", () => {
    const result = enquirySchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      message: "Subject: Website question\n\nHello from the contact form.",
      listing_title: "Website Contact Form",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(normalizeEnquiryPayload(result.data)).toMatchObject({
      name: "Test User",
      email: "test@example.com",
      phone: null,
      listing_id: null,
      listing_title: "Website Contact Form",
      agent_name: null,
      agent_email: null,
      visit_type: null,
    });
  });

  it("normalizes blank optional fields to null", () => {
    const result = enquirySchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      phone: " ",
      message: "Message body",
      listing_id: "",
      listing_title: "",
      agent_name: "",
      agent_email: "",
      visit_type: "",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const payload = normalizeEnquiryPayload(result.data);
    expect(payload.phone).toBeNull();
    expect(payload.listing_id).toBeNull();
    expect(payload.agent_email).toBeNull();
  });
});
