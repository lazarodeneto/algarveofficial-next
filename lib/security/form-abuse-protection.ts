import { createHash } from "node:crypto";

import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export interface FormAbuseProtectionInput {
  request: Request;
  client?: ServiceClient | null;
  scope: string;
  email?: string | null;
  honeypot?: string | null;
  submittedAt?: number | string | null;
  maxAttempts?: number;
  windowSeconds?: number;
  minSubmitMs?: number;
}

export interface FormAbuseProtectionResult {
  allowed: boolean;
  reason: "honeypot" | "too_fast" | "rate_limited" | null;
  ipHash: string;
  emailHash: string | null;
  userAgentHash: string | null;
}

function hashValue(value: string) {
  const salt = process.env.NEWSLETTER_TOKEN_SECRET
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || "development-form-abuse-salt";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor
    || request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function normalizeSubmittedAt(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function extractFormAbuseFields(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { honeypot: null, submittedAt: null };
  }

  const record = value as Record<string, unknown>;
  const honeypot = record.honeypot ?? record.website ?? record.company ?? record.url;
  const submittedAt = record.submittedAt ?? record.submitted_at ?? record.formStartedAt;

  return {
    honeypot: typeof honeypot === "string" ? honeypot : null,
    submittedAt: typeof submittedAt === "string" || typeof submittedAt === "number" ? submittedAt : null,
  };
}

async function checkRateLimit(args: {
  client: ServiceClient;
  scope: string;
  identifierHash: string;
  maxAttempts: number;
  windowSeconds: number;
}) {
  const { client, scope, identifierHash, maxAttempts, windowSeconds } = args;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  try {
    const { data, error } = await client
      .from("communication_rate_limits" as never)
      .select("id, count, window_start")
      .eq("scope", scope)
      .eq("identifier_hash", identifierHash)
      .maybeSingle();

    if (error) return false;

    const row = data as { id?: string; count?: number; window_start?: string } | null;
    const rowWindowStart = row?.window_start ? new Date(row.window_start) : null;
    const inCurrentWindow = Boolean(rowWindowStart && rowWindowStart > windowStart);

    if (row && inCurrentWindow && (row.count ?? 0) >= maxAttempts) {
      return true;
    }

    if (row?.id && inCurrentWindow) {
      await client
        .from("communication_rate_limits" as never)
        .update({
          count: (row.count ?? 0) + 1,
          last_seen_at: now.toISOString(),
        } as never)
        .eq("id", row.id);
      return false;
    }

    await client
      .from("communication_rate_limits" as never)
      .upsert({
        scope,
        identifier_hash: identifierHash,
        count: 1,
        window_start: now.toISOString(),
        last_seen_at: now.toISOString(),
      } as never, { onConflict: "scope,identifier_hash" });

    return false;
  } catch {
    return false;
  }
}

export async function enforceFormAbuseProtection(input: FormAbuseProtectionInput): Promise<FormAbuseProtectionResult> {
  const maxAttempts = input.maxAttempts ?? 8;
  const windowSeconds = input.windowSeconds ?? 60 * 60;
  const minSubmitMs = input.minSubmitMs ?? 700;
  const ip = getClientIp(input.request);
  const userAgent = input.request.headers.get("user-agent")?.trim() || null;
  const normalizedEmail = input.email?.trim().toLowerCase() || null;
  const ipHash = hashValue(`ip:${ip}`);
  const emailHash = normalizedEmail ? hashValue(`email:${normalizedEmail}`) : null;
  const userAgentHash = userAgent ? hashValue(`ua:${userAgent}`) : null;

  if (input.honeypot?.trim()) {
    return { allowed: false, reason: "honeypot", ipHash, emailHash, userAgentHash };
  }

  const submittedAt = normalizeSubmittedAt(input.submittedAt);
  if (submittedAt && Date.now() - submittedAt >= 0 && Date.now() - submittedAt < minSubmitMs) {
    return { allowed: false, reason: "too_fast", ipHash, emailHash, userAgentHash };
  }

  if (input.client) {
    const ipLimited = await checkRateLimit({
      client: input.client,
      scope: `${input.scope}:ip`,
      identifierHash: ipHash,
      maxAttempts,
      windowSeconds,
    });

    if (ipLimited) {
      return { allowed: false, reason: "rate_limited", ipHash, emailHash, userAgentHash };
    }

    if (emailHash) {
      const emailLimited = await checkRateLimit({
        client: input.client,
        scope: `${input.scope}:email`,
        identifierHash: emailHash,
        maxAttempts: Math.max(3, Math.ceil(maxAttempts / 2)),
        windowSeconds,
      });

      if (emailLimited) {
        return { allowed: false, reason: "rate_limited", ipHash, emailHash, userAgentHash };
      }
    }
  }

  return { allowed: true, reason: null, ipHash, emailHash, userAgentHash };
}
