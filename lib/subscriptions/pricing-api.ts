export type PricingApiAction = "created" | "updated";

export interface PricingApiSuccessResponse {
  ok: true;
  id: string;
  action: PricingApiAction;
}

export interface PricingApiError {
  code: string;
  message: string;
}

export interface PricingApiErrorResponse {
  ok: false;
  error: PricingApiError;
}

export type PricingApiResponse = PricingApiSuccessResponse | PricingApiErrorResponse;

export function extractPricingApiErrorMessage(
  payload: unknown,
  fallbackMessage: string,
): string {
  if (typeof payload !== "object" || payload === null) {
    return fallbackMessage;
  }

  const record = payload as Record<string, unknown>;
  const structuredError = record.error;

  if (typeof structuredError === "string" && structuredError.trim()) {
    return structuredError;
  }

  if (typeof structuredError === "object" && structuredError !== null) {
    const structuredRecord = structuredError as Record<string, unknown>;
    const message = structuredRecord.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  const legacyMessage = record.message;
  if (typeof legacyMessage === "string" && legacyMessage.trim()) {
    return legacyMessage;
  }

  return fallbackMessage;
}

export function buildPricingApiErrorResponse(
  code: string,
  message: string,
): PricingApiErrorResponse {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}
