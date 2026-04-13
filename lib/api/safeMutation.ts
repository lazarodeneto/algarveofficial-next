import { z } from "zod";
import type { ZodSchema } from "zod";

export interface SafeMutationOptions<T extends ZodSchema> {
  schema: T;
  payload: unknown;
}

export interface SafeMutationResult<T extends ZodSchema> {
  success: boolean;
  data?: z.infer<T>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export async function safeMutation<
  T extends ZodSchema,
>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<z.infer<T>>,
  payload: unknown,
): Promise<SafeMutationResult<T>> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const data = await handler(result.data);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "HANDLER_ERROR",
        message: err instanceof Error ? err.message : "Handler failed",
      },
    };
  }
}

export async function safeMutationSync<
  T extends ZodSchema,
>(
  schema: T,
  handler: (data: z.infer<T>) => z.infer<T>,
  payload: unknown,
): Promise<SafeMutationResult<T>> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const data = handler(result.data);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "HANDLER_ERROR",
        message: err instanceof Error ? err.message : "Handler failed",
      },
    };
  }
}