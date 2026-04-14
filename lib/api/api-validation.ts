import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

export function validatePayload<T>(
  schema: ZodSchema<T>,
  payload: unknown,
  errorPrefix = "PAYLOAD",
): { success: true; data: T } | { success: false; error: { code: string; message: string } } {
  const result = schema.safeParse(payload);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.issues[0];
  const path = firstError?.path?.join(".") ?? "unknown";
  const message = firstError?.message ?? "Invalid payload";

  return {
    success: false,
    error: {
      code: `${errorPrefix}_VALIDATION_ERROR`,
      message: `${path}: ${message}`,
    },
  };
}

export function parseJsonBody<T>(request: NextRequest): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    return { success: true, data: request.json() as T };
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { ok: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
        { status: 400 },
      ),
    };
  }
}

export function jsonErrorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}