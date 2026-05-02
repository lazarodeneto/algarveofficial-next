import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

export type SecretVerificationResult = "authorized" | "unauthorized" | "missing-config";

interface VerifyServerSecretOptions {
  envName: string;
  headerNames: string[];
}

export function verifyServerSecret(
  request: NextRequest,
  { envName, headerNames }: VerifyServerSecretOptions,
): SecretVerificationResult {
  const configured = process.env[envName]?.trim();
  if (!configured) return "missing-config";

  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const headerSecret = headerNames
    .map((name) => request.headers.get(name)?.trim())
    .find((value): value is string => Boolean(value));
  const incoming = bearer || headerSecret;

  if (!incoming) return "unauthorized";

  try {
    return timingSafeEqual(Buffer.from(incoming), Buffer.from(configured))
      ? "authorized"
      : "unauthorized";
  } catch {
    return "unauthorized";
  }
}
