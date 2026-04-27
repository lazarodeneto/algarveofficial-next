export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export async function fetchAdmin(url: string, options?: RequestInit) {
  const start = Date.now();

  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const duration = Date.now() - start;

  if (!res.ok) {
    console.error("[admin:http]", JSON.stringify({
      status: res.status,
      url,
      duration,
    }));
    throw new AdminApiError(`HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!json.ok) {
    console.error("[admin:api]", JSON.stringify({
      error: json.error,
      url,
      duration,
    }));
    throw new AdminApiError(
      json.error?.message || "API error",
      json.error?.code,
      json.error?.requestId
    );
  }

  if (duration > 300) {
    console.warn("[admin:slow]", JSON.stringify({
      url,
      duration,
    }));
  }

  return json;
}