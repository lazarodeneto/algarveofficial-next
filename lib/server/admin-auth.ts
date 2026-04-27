import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

import type { Database } from "@/integrations/supabase/types";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

type UserRole = Database["public"]["Enums"]["app_role"];

export interface AdminWriteAuth {
  userId: string;
  userClient: SupabaseClient<Database>;
  writeClient: SupabaseClient<Database>;
}

export interface AdminReadAuth {
  userId: string;
  readClient: SupabaseClient<Database>;
}

interface AdminAuthError {
  error: NextResponse;
}

interface AdminBaseAuth {
  userId: string;
  userClient: SupabaseClient<Database>;
}

interface AdminWriteClientOptions {
  requireServiceRole?: boolean;
  missingServiceRoleMessage?: string;
  auditAction?: string;
}

export function adminErrorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

async function requireAdminBase(
  request: NextRequest,
  forbiddenMessage: string,
): Promise<AdminBaseAuth | AdminAuthError> {
  return requireRoleBase(request, forbiddenMessage, ["admin"]);
}

async function requireRoleBase(
  request: NextRequest,
  forbiddenMessage: string,
  allowedRoles: UserRole[],
): Promise<AdminBaseAuth | AdminAuthError> {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: adminErrorResponse(401, "AUTH_MISSING", "Missing authorization token."),
    };
  }

  const { url, anonKey } = getSupabasePublicEnv();
  const userClient = createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return {
      error: adminErrorResponse(401, "AUTH_UNAUTHORIZED", "Unauthorized."),
    };
  }

  const { data: requesterRole, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userData.user.id,
  });

  if (roleError) {
    return {
      error: adminErrorResponse(
        403,
        "AUTH_ROLE_CHECK_FAILED",
        roleError.message || "Failed to verify user role.",
      ),
    };
  }

  if (!allowedRoles.includes(requesterRole as UserRole)) {
    return {
      error: adminErrorResponse(403, "AUTH_FORBIDDEN", forbiddenMessage),
    };
  }

  return {
    userId: userData.user.id,
    userClient,
  } satisfies AdminBaseAuth;
}

export async function requireAdminWriteClient(
  request: NextRequest,
  forbiddenMessage = "Only admins can perform this action.",
  options?: AdminWriteClientOptions,
): Promise<AdminWriteAuth | AdminAuthError> {
  const cookieAuth = await requireAdminSession(request);
  if ("error" in cookieAuth) return cookieAuth;

  const serviceClient = createServiceRoleClient();
  if (options?.requireServiceRole && !serviceClient) {
    return {
      error: adminErrorResponse(
        500,
        "SERVER_MISCONFIGURED",
        options.missingServiceRoleMessage ??
          "Server is missing SUPABASE_SERVICE_ROLE_KEY for privileged admin writes.",
      ),
    };
  }

  let action = options?.auditAction;
  if (!action) {
    try {
      const parsed = new URL(request.url);
      action = `${request.method.toUpperCase()} ${parsed.pathname}`;
    } catch {
      action = request.method.toUpperCase();
    }
  }

  logAdminMutation({
    userId: cookieAuth.userId,
    action,
    payload: {
      requiresServiceRole: options?.requireServiceRole === true,
      usingServiceRoleClient: Boolean(serviceClient),
    },
  });

  return {
    userId: cookieAuth.userId,
    userClient: cookieAuth.userClient,
    writeClient: (serviceClient ?? cookieAuth.userClient) as SupabaseClient<Database>,
  };
}

export async function requireAdminSession(
  request: NextRequest,
): Promise<AdminBaseAuth | AdminAuthError> {
  const { url, anonKey } = getSupabasePublicEnv();
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: adminErrorResponse(401, "AUTH_UNAUTHORIZED", "Unauthorized."),
    };
  }

  const { data: role, error: roleError } = await supabase.rpc("get_user_role", {
    _user_id: user.id,
  });

  if (roleError) {
    return {
      error: adminErrorResponse(
        403,
        "AUTH_ROLE_CHECK_FAILED",
        roleError.message || "Failed to verify user role.",
      ),
    };
  }

  if (role !== "admin" && role !== "editor") {
    return {
      error: adminErrorResponse(403, "AUTH_FORBIDDEN", "Only admins or editors can access this resource."),
    };
  }

  return {
    userId: user.id,
    userClient: supabase,
  };
}
