import { describe, expect, it } from "vitest";

import { extractPricingApiErrorMessage } from "@/lib/subscriptions/pricing-api";

describe("pricing api error extraction", () => {
  it("reads structured API error payloads", () => {
    expect(
      extractPricingApiErrorMessage(
        { ok: false, error: { code: "PRICING_UPDATE_FAILED", message: "Update failed." } },
        "Fallback message",
      ),
    ).toBe("Update failed.");
  });

  it("reads legacy string error payloads", () => {
    expect(
      extractPricingApiErrorMessage(
        { error: "Legacy error message" },
        "Fallback message",
      ),
    ).toBe("Legacy error message");
  });

  it("falls back safely when payload is malformed", () => {
    expect(extractPricingApiErrorMessage(null, "Fallback message")).toBe("Fallback message");
    expect(extractPricingApiErrorMessage({ ok: false }, "Fallback message")).toBe("Fallback message");
  });
});
