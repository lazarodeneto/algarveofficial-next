import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

type UserRole = Database["public"]["Enums"]["app_role"];

export interface AdminWriteAuth {
  userId: string;
  writeClient: SupabaseClient<Database>;
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

export async function requireAdminWriteClient(
  request: NextRequest,
  forbiddenMessage = "Only admins can perform this action.",
) {
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

  if ((requesterRole as UserRole) !== "admin") {
    return {
      error: adminErrorResponse(403, "AUTH_FORBIDDEN", forbiddenMessage),
    };
  }

  const serviceClient = createServiceRoleClient();
  return {
    userId: userData.user.id,
    writeClient: (serviceClient ?? userClient) as SupabaseClient<Database>,
  } satisfies AdminWriteAuth;
}
