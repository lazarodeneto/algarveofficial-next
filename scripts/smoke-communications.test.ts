import { execFile } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function withSmokeServer<T>(callback: (baseUrl: string, stats: { safeSubscribeHits: number }) => Promise<T>) {
  const stats = { safeSubscribeHits: 0 };
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");

    if (request.method === "POST" && url.pathname === "/api/newsletter/subscribe") {
      const rawBody = await readBody(request);
      const body = rawBody ? JSON.parse(rawBody) as { email?: string } : {};
      if (body.email === "not-an-email") {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false }));
        return;
      }

      stats.safeSubscribeHits += 1;
      response.writeHead(202, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/webhooks/resend") {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/communications") {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: false }));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Smoke test server did not bind to a local port.");
  }

  try {
    return await callback(`http://127.0.0.1:${address.port}`, stats);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function smokeEnv(baseUrl: string, overrides: NodeJS.ProcessEnv = {}) {
  return {
    ...process.env,
    COMMUNICATION_SMOKE_BASE_URL: baseUrl,
    NEXT_PUBLIC_SITE_URL: baseUrl,
    RESEND_API_KEY: "re_test",
    RESEND_FROM_EMAIL: "hello@example.com",
    RESEND_FROM_NAME: "AlgarveOfficial",
    RESEND_REPLY_TO_EMAIL: "reply@example.com",
    RESEND_WEBHOOK_SECRET: "whsec_test",
    ADMIN_NOTIFICATION_EMAILS: "admin@example.com",
    CONTACT_NOTIFICATION_EMAIL: "contact@example.com",
    CLAIM_NOTIFICATION_EMAIL: "claim@example.com",
    NEWSLETTER_TOKEN_SECRET: "test-newsletter-secret",
    ...overrides,
  };
}

afterEach(() => {
  delete process.env.SEND_TEST_EMAIL;
  delete process.env.DRY_RUN;
});

describe("communication smoke script", () => {
  it("does not send the safe newsletter test email in dry-run mode", async () => {
    await withSmokeServer(async (baseUrl, stats) => {
      const { stdout } = await execFileAsync("node", ["scripts/smoke-communications.mjs"], {
        cwd: process.cwd(),
        env: smokeEnv(baseUrl, { DRY_RUN: "true", SEND_TEST_EMAIL: "true" }),
      });

      expect(stdout).toContain("PASS newsletter invalid email validation: status 400");
      expect(stdout).toContain("PASS webhook invalid signature rejected: status 401");
      expect(stdout).toContain("PASS admin communications requires auth: status 401");
      expect(stdout).toContain("PASS newsletter safe test subscribe: skipped");
      expect(stats.safeSubscribeHits).toBe(0);
    });
  });

  it("refuses live test email mode without COMMUNICATION_SMOKE_TEST_EMAIL", async () => {
    await withSmokeServer(async (baseUrl) => {
      await expect(execFileAsync("node", ["scripts/smoke-communications.mjs"], {
        cwd: process.cwd(),
        env: smokeEnv(baseUrl, { DRY_RUN: "false", SEND_TEST_EMAIL: "true" }),
      })).rejects.toMatchObject({
        stdout: expect.stringContaining("COMMUNICATION_SMOKE_TEST_EMAIL is required"),
      });
    });
  });
});
