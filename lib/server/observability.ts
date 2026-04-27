import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function logAdminRequest(req: Request, meta?: Record<string, unknown>) {
  const url = req instanceof Request ? req.url : "";
  const path = url ? new URL(url).pathname : "unknown";
  console.info("[admin:req]", JSON.stringify({
    path,
    method: req.method,
    ...meta,
  }));
}

export function logAdminError(code: string, err: unknown, meta?: Record<string, unknown>) {
  console.error("[admin:err]", JSON.stringify({
    code,
    message: err instanceof Error ? err.message : String(err),
    ...meta,
  }));
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export interface AdminErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export function adminErrorWithId(
  status: number,
  code: string,
  message: string,
  requestId: string,
): NextResponse<AdminErrorResponse> {
  return NextResponse.json(
    { ok: false, error: { code, message, requestId } },
    { status },
  );
}