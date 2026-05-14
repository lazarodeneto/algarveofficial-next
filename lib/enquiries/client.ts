"use client";

export interface EnquiryPayload {
  name: string;
  email: string;
  message: string;
  phone?: string | null;
  listing_id?: string | null;
  listing_title?: string | null;
  agent_name?: string | null;
  agent_email?: string | null;
  visit_type?: string | null;
}

export interface EnquiryResponse {
  data: {
    threadId: string;
    messageId: string;
  };
  warnings: string[];
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function sendEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  const response = await fetch("/api/enquiries", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => null) as unknown;

  if (!response.ok) {
    throw new Error(getErrorMessage(json, "Failed to send message"));
  }

  if (json && typeof json === "object" && (json as { ok?: unknown }).ok === false) {
    throw new Error(getErrorMessage(json, "Failed to send message"));
  }

  if (!json || typeof json !== "object" || (json as { ok?: unknown }).ok !== true) {
    throw new Error(getErrorMessage(json, "Failed to send message"));
  }

  const result = json as { data?: EnquiryResponse["data"]; warnings?: string[] };
  if (
    !result.data ||
    typeof result.data.threadId !== "string" ||
    typeof result.data.messageId !== "string"
  ) {
    throw new Error("Message delivery response was incomplete.");
  }

  return {
    data: result.data,
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
  };
}
