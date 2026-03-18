type SupabaseFunctionErrorLike = {
  message?: string;
  details?: string;
  context?: unknown;
};

interface ErrorPayload {
  error?: string;
  message?: string;
  details?: string;
}

function extractPayloadMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const candidate = payload as ErrorPayload;
  if (typeof candidate.error === "string" && candidate.error.trim()) return candidate.error.trim();
  if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message.trim();
  if (typeof candidate.details === "string" && candidate.details.trim()) return candidate.details.trim();
  return "";
}

export async function getSupabaseFunctionErrorMessage(
  error: unknown,
  fallback = "Request failed",
): Promise<string> {
  if (!error) return fallback;
  if (typeof error === "string" && error.trim()) return error.trim();

  const candidate = error as SupabaseFunctionErrorLike;
  const context = candidate?.context;

  if (context instanceof Response) {
    const payload = (await context.clone().json().catch(() => null)) as unknown;
    const payloadMessage = extractPayloadMessage(payload);
    if (payloadMessage) return payloadMessage;

    const bodyText = await context.clone().text().catch(() => "");
    if (bodyText.trim()) return bodyText.trim().slice(0, 500);
  }

  if (typeof context === "string" && context.trim()) {
    return context.trim();
  }

  if (typeof candidate?.details === "string" && candidate.details.trim()) {
    return candidate.details.trim();
  }

  if (typeof candidate?.message === "string" && candidate.message.trim()) {
    return candidate.message.trim();
  }

  return fallback;
}
