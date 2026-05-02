export function safeJsonParse<T>(
  value: unknown,
  fallback: T,
  context: string,
): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;

  try {
    return (JSON.parse(value) ?? fallback) as T;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[safeJsonParse] ${context}`, {
        error,
        preview: value.slice(0, 1200),
      });
    }
    return fallback;
  }
}

