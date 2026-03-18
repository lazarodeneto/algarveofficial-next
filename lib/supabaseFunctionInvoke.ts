import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken, SESSION_EXPIRED_MESSAGE } from "@/lib/authToken";
import { getSupabaseFunctionErrorMessage } from "@/lib/supabaseFunctionError";

type InvokeOptions = Parameters<typeof supabase.functions.invoke>[1];
type InvokeResult<T> = Awaited<ReturnType<typeof supabase.functions.invoke<T>>>;

const AUTH_RETRY_PATTERN = /(invalid\s+jwt|jwt\s+expired|invalid\s+token|unauthorized)/i;
const SESSION_EXPIRED_PATTERN = /(invalid\s+jwt|jwt\s+expired|invalid\s+token)/i;

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized = new Headers(headers ?? {});
  const output: Record<string, string> = {};
  normalized.forEach((value, key) => {
    output[key] = value;
  });
  return output;
}

async function invokeWithToken<T>(
  functionName: string,
  options?: InvokeOptions,
  forceRefresh = false,
): Promise<InvokeResult<T>> {
  const token = await getValidAccessToken({ forceRefresh });
  const headers = normalizeHeaders(options?.headers);
  headers.Authorization = `Bearer ${token}`;
  return supabase.functions.invoke<T>(functionName, { ...options, headers });
}

export async function invokeFunctionWithAuthRetry<T = unknown>(
  functionName: string,
  options?: InvokeOptions,
): Promise<InvokeResult<T>> {
  const firstAttempt = await invokeWithToken<T>(functionName, options, false);
  if (!firstAttempt.error) {
    return firstAttempt;
  }

  const firstMessage = await getSupabaseFunctionErrorMessage(firstAttempt.error, "");
  if (!AUTH_RETRY_PATTERN.test(firstMessage)) {
    return firstAttempt;
  }

  try {
    const secondAttempt = await invokeWithToken<T>(functionName, options, true);
    if (!secondAttempt.error) {
      return secondAttempt;
    }

    const secondMessage = await getSupabaseFunctionErrorMessage(secondAttempt.error, "");
    if (SESSION_EXPIRED_PATTERN.test(secondMessage)) {
      return {
        data: secondAttempt.data,
        error: new Error(SESSION_EXPIRED_MESSAGE),
      } as InvokeResult<T>;
    }

    return secondAttempt;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(SESSION_EXPIRED_MESSAGE),
    } as InvokeResult<T>;
  }
}
