type Primitive = string | number | boolean | null;

type AuditPayload = Record<string, Primitive | Primitive[] | Record<string, unknown> | undefined>;

function sanitizeValue(value: unknown): Primitive | Primitive[] | Record<string, unknown> {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 50)
      .map((item) => (item === null || ["string", "number", "boolean"].includes(typeof item) ? item : String(item)));
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(record)) {
      if (key.toLowerCase().includes("password") || key.toLowerCase().includes("token")) continue;
      if (typeof item === "string" && item.length > 500) {
        out[key] = `${item.slice(0, 500)}...`;
      } else {
        out[key] = item;
      }
    }
    return out;
  }

  return String(value);
}

export function logAdminMutation(params: {
  userId: string;
  action: string;
  payload?: AuditPayload;
}) {
  const safePayload: Record<string, unknown> = {};
  if (params.payload) {
    for (const [key, value] of Object.entries(params.payload)) {
      if (value === undefined) continue;
      safePayload[key] = sanitizeValue(value);
    }
  }

  // Intentionally structured for ingestion by log drains.
  console.info("[admin-mutation]", {
    userId: params.userId,
    action: params.action,
    timestamp: new Date().toISOString(),
    payload: safePayload,
  });
}
