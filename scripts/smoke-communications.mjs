#!/usr/bin/env node

const REQUIRED_ENV = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_FROM_NAME",
  "RESEND_REPLY_TO_EMAIL",
  "RESEND_WEBHOOK_SECRET",
  "ADMIN_NOTIFICATION_EMAILS",
  "CONTACT_NOTIFICATION_EMAIL",
  "CLAIM_NOTIFICATION_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
  "NEWSLETTER_TOKEN_SECRET",
];

function boolEnv(name) {
  return ["1", "true", "yes"].includes(String(process.env[name] ?? "").toLowerCase());
}

function isDryRun() {
  if (typeof process.env.DRY_RUN === "undefined") return true;
  return boolEnv("DRY_RUN");
}

function baseUrl() {
  const raw = process.env.COMMUNICATION_SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    throw new Error("COMMUNICATION_SMOKE_BASE_URL or NEXT_PUBLIC_SITE_URL is required for communication smoke checks.");
  }

  try {
    return new URL(raw).toString().replace(/\/+$/, "");
  } catch {
    throw new Error("COMMUNICATION_SMOKE_BASE_URL or NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }
}

async function postJson(url, body, headers = {}) {
  return fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function record(results, name, pass, detail) {
  results.push({ name, pass, detail });
}

async function main() {
  const dryRun = isDryRun();
  const sendTestEmail = boolEnv("SEND_TEST_EMAIL") && !dryRun;
  const root = baseUrl();
  const results = [];

  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  record(results, "required env names", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "present");

  try {
    new URL(root);
    record(results, "site url format", true, root);
  } catch (error) {
    record(results, "site url format", false, error instanceof Error ? error.message : "invalid url");
  }

  try {
    const response = await postJson(`${root}/api/newsletter/subscribe`, { email: "not-an-email" });
    record(results, "newsletter invalid email validation", response.status === 400, `status ${response.status}`);
  } catch (error) {
    record(results, "newsletter invalid email validation", false, error instanceof Error ? error.message : "request failed");
  }

  if (sendTestEmail) {
    const testEmail = process.env.COMMUNICATION_SMOKE_TEST_EMAIL;
    if (!testEmail) {
      record(results, "newsletter safe test subscribe", false, "COMMUNICATION_SMOKE_TEST_EMAIL is required when SEND_TEST_EMAIL=true and DRY_RUN=false");
    } else {
      try {
        const response = await postJson(`${root}/api/newsletter/subscribe`, {
          email: testEmail,
          source: "communication_smoke",
          source_url: root,
          submittedAt: Date.now() - 5000,
        });
        record(results, "newsletter safe test subscribe", response.status === 202 || response.status === 200, `status ${response.status}`);
      } catch (error) {
        record(results, "newsletter safe test subscribe", false, error instanceof Error ? error.message : "request failed");
      }
    }
  } else {
    record(results, "newsletter safe test subscribe", true, "skipped; set SEND_TEST_EMAIL=true and DRY_RUN=false to send");
  }

  try {
    const response = await postJson(
      `${root}/api/webhooks/resend`,
      { type: "email.delivered", data: { email_id: "smoke_invalid_signature" } },
      {
        "svix-id": "smoke-invalid",
        "svix-timestamp": String(Math.floor(Date.now() / 1000)),
        "svix-signature": "v1,invalid",
      },
    );
    record(results, "webhook invalid signature rejected", response.status === 401 || response.status === 400, `status ${response.status}`);
  } catch (error) {
    record(results, "webhook invalid signature rejected", false, error instanceof Error ? error.message : "request failed");
  }

  try {
    const response = await fetch(`${root}/api/admin/communications`, { cache: "no-store" });
    const passed = response.status === 401 || response.status === 403;
    record(results, "admin communications requires auth", passed, passed ? `status ${response.status}` : `public diagnostic exposure risk: status ${response.status}`);
  } catch (error) {
    record(results, "admin communications requires auth", false, error instanceof Error ? error.message : "request failed");
  }

  const failed = results.filter((item) => !item.pass);
  for (const item of results) {
    const prefix = item.pass ? "PASS" : "FAIL";
    console.log(`${prefix} ${item.name}: ${item.detail}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Communication smoke check failed.");
  process.exit(1);
});
