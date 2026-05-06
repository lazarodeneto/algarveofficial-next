import type { ErrorEvent } from "@sentry/core";

const REDACTED = "[redacted]";

const SENSITIVE_KEY_PATTERNS = [
  /authorization/i,
  /cookie/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[-_]?key/i,
  /service[-_]?role/i,
  /stripe[-_]?signature/i,
  /resend/i,
];

function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[max-depth]";
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : scrubValue(entry, depth + 1),
    ]),
  );
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;

    if (event.request.data) {
      event.request.data = scrubValue(event.request.data);
    }
  }

  if (event.extra) {
    event.extra = scrubValue(event.extra) as ErrorEvent["extra"];
  }

  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as ErrorEvent["contexts"];
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }

  return event;
}
