import { describe, expect, it } from "vitest";

import {
  CONTACT_FORM_VALIDATION_MESSAGES,
  buildContactFormMessage,
  toContactEnquiryPayload,
  validateContactFormData,
} from "./contact-form";

describe("contact form enquiry payload", () => {
  it("blocks one-character sender names before submitting to the API", () => {
    const result = validateContactFormData({
      name: "L",
      email: "lnet@example.com",
      subject: "Website question",
      message: "Can you help?",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.name).toBe(CONTACT_FORM_VALIDATION_MESSAGES.nameMin);
  });

  it("builds the exact enquiry API payload used by the public contact form", () => {
    const payload = toContactEnquiryPayload({
      name: "  Test Sender  ",
      email: "  sender@example.com  ",
      subject: " Availability ",
      message: " Hello from the contact form. ",
    });

    expect(payload).toEqual({
      name: "Test Sender",
      email: "sender@example.com",
      phone: null,
      message: "Subject: Availability\n\nHello from the contact form.",
      listing_id: null,
      listing_title: "Website Contact Form",
      agent_name: null,
      agent_email: null,
      visit_type: null,
    });
  });

  it("keeps the combined subject and message within the server-side message limit", () => {
    const result = validateContactFormData({
      name: "Test Sender",
      email: "sender@example.com",
      subject: "A".repeat(180),
      message: "B".repeat(4000),
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.message).toBe(CONTACT_FORM_VALIDATION_MESSAGES.messageMax);
  });

  it("uses the documented subject prefix for admin inbox messages", () => {
    expect(buildContactFormMessage("General question", "Hello")).toBe("Subject: General question\n\nHello");
  });
});
