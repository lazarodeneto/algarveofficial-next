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

const AUTH_ERROR_PATTERN = /(invalid\s+jwt|jwt\s+expired|invalid\s+token|unauthorized|forbidden)/i;
const TRANSPORT_ERROR_PATTERN =
  /(failed to send a request to the edge function|failed to fetch|fetch failed|network error|network request failed|load failed)/i;

function extractPayloadMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const candidate = payload as ErrorPayload;
  if (typeof candidate.error === "string" && candidate.error.trim()) return candidate.error.trim();
  if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message.trim();
  if (typeof candidate.details === "string" && candidate.details.trim()) return candidate.details.trim();
  return "";
}

function getContextStatus(error: unknown): number | null {
  const candidate = error as SupabaseFunctionErrorLike;
  const context = candidate?.context;

  if (context instanceof Response) {
    return context.status;
  }

  if (context && typeof context === "object") {
    const status = (context as { status?: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }

  return null;
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

    const statusSummary = `HTTP ${context.status}${context.statusText ? ` ${context.statusText}` : ""}`.trim();
    if (statusSummary !== "HTTP 0") {
      if (typeof candidate?.message === "string" && candidate.message.trim()) {
        return `${candidate.message.trim()} (${statusSummary})`;
      }
      return statusSummary;
    }
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

export async function isSupabaseFunctionAuthError(error: unknown): Promise<boolean> {
  const status = getContextStatus(error);
  if (status === 401 || status === 403) {
    return true;
  }

  const message = await getSupabaseFunctionErrorMessage(error, "");
  return AUTH_ERROR_PATTERN.test(message);
}

export async function isSupabaseFunctionTransportError(error: unknown): Promise<boolean> {
  const status = getContextStatus(error);
  if (status === 0) {
    return true;
  }

  const message = await getSupabaseFunctionErrorMessage(error, "");
  return TRANSPORT_ERROR_PATTERN.test(message);
}
