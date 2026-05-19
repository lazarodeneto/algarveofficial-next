import { NextRequest, NextResponse } from "next/server";

import { enforceFormAbuseProtection } from "@/lib/security/form-abuse-protection";
import { createServiceRoleClient } from "@/lib/supabase/service";

interface EnforceWriteRateLimitInput {
  request: NextRequest;
  scope: string;
  email?: string | null;
  maxAttempts?: number;
  windowSeconds?: number;
}

export async function enforceWriteRateLimit({
  request,
  scope,
  email,
  maxAttempts = 60,
  windowSeconds = 60,
}: EnforceWriteRateLimitInput) {
  const result = await enforceFormAbuseProtection({
    request,
    client: createServiceRoleClient(),
    scope,
    email,
    maxAttempts,
    windowSeconds,
    minSubmitMs: 0,
  });

  if (result.allowed) return null;

  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a moment and try again.",
      },
    },
    { status: 429 },
  );
}
