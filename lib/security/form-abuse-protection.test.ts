import { afterEach, describe, expect, it, vi } from "vitest";

import { enforceFormAbuseProtection } from "@/lib/security/form-abuse-protection";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("does not let spoofed x-forwarded-for change the production rate-limit identity", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const seenHashes: string[] = [];
    const client = {
      rpc: vi.fn(async (_name: string, args: { p_identifier_hash: string }) => {
        seenHashes.push(args.p_identifier_hash);
        return { data: false, error: null };
      }),
    };

    await enforceFormAbuseProtection({
      request: new Request("http://localhost/api/test", {
        headers: { "x-real-ip": "192.0.2.55", "x-forwarded-for": "203.0.113.10" },
      }),
      client: client as never,
      scope: "test",
      email: null,
    });
    await enforceFormAbuseProtection({
      request: new Request("http://localhost/api/test", {
        headers: { "x-real-ip": "192.0.2.55", "x-forwarded-for": "198.51.100.20" },
      }),
      client: client as never,
      scope: "test",
      email: null,
    });

    expect(seenHashes).toHaveLength(2);
    expect(seenHashes[0]).toBe(seenHashes[1]);
  });

  it("uses the atomic rate-limit RPC and blocks once the RPC reports a limit", async () => {
    let attempts = 0;
    const client = {
      rpc: vi.fn(async () => {
        attempts += 1;
        return { data: attempts > 2, error: null };
      }),
    };

    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        enforceFormAbuseProtection({
          request: new Request("http://localhost/api/test", {
            headers: { "x-real-ip": "203.0.113.10" },
          }),
          client: client as never,
          scope: "test",
          email: null,
          maxAttempts: 2,
        }),
      ),
    );

    expect(client.rpc).toHaveBeenCalledWith(
      "check_communication_rate_limit",
      expect.objectContaining({
        p_scope: "test:ip",
        p_max_attempts: 2,
      }),
    );
    expect(results.map((result) => result.reason)).toEqual([
      null,
      null,
      "rate_limited",
      "rate_limited",
    ]);
  });
});
