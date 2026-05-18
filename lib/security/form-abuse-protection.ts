import { createHash } from "node:crypto";

import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;
type RateLimitRpcClient = ServiceClient & {
  rpc: (
    fn: "check_communication_rate_limit",
    args: {
      p_scope: string;
      p_identifier_hash: string;
      p_max_attempts: number;
      p_window_seconds: number;
      p_metadata?: Record<string, unknown>;
    },
  ) => Promise<{ data: boolean | null; error: { message?: string; code?: string } | null }>;
};

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

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function isTrustedPlatformHeader(name: string) {
  if (name === "x-vercel-forwarded-for") return true;
  if (name === "cf-connecting-ip") return true;
  if (name === "x-real-ip") return true;
  return false;
}

function getClientIp(request: Request) {
  const trustedHeaders = [
    "x-vercel-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
  ];

  for (const header of trustedHeaders) {
    const value = getFirstHeaderValue(request.headers.get(header));
    if (value && isTrustedPlatformHeader(header)) return value;
  }

  if (process.env.NODE_ENV !== "production") {
    return getFirstHeaderValue(request.headers.get("x-forwarded-for")) ?? "unknown";
  }

  return "unknown";
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

  try {
    const { data, error } = await (client as RateLimitRpcClient).rpc(
      "check_communication_rate_limit",
      {
        p_scope: scope,
        p_identifier_hash: identifierHash,
        p_max_attempts: maxAttempts,
        p_window_seconds: windowSeconds,
        p_metadata: {},
      },
    );

    if (error) return false;
    return data === true;
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
    if (ip !== "unknown") {
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
