/**
 * Executes a Supabase query with a timeout.
 * Prevents serverless functions from hanging and hitting Vercel's gateway timeout (504).
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
  fallbackValue: T | null = null
): Promise<T | null> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`[Database] Query timed out after ${timeoutMs}ms`);
      resolve(null);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result as T | null;
  } catch (error) {
    console.error("[Database] Query error:", error);
    return fallbackValue;
  } finally {
    clearTimeout(timeoutId!);
  }
}
