import { describe, expect, it } from "vitest";

import { enforceFormAbuseProtection } from "@/lib/security/form-abuse-protection";

describe("form abuse protection", () => {
  it("blocks honeypot submissions before storage", async () => {
    const result = await enforceFormAbuseProtection({
      request: new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.10", "user-agent": "test-agent" },
      }),
      scope: "test",
      email: "reader@example.com",
      honeypot: "bot-filled-value",
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("honeypot");
    expect(result.ipHash).toHaveLength(64);
    expect(result.emailHash).toHaveLength(64);
  });
});
