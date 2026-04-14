// Shared auth helper for owner-scoped API routes (billing portal, change plan,
// current subscription). Validates Bearer token and confirms the user has the
// owner or admin role.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export interface OwnerAuth {
  userId: string;
}

export interface OwnerAuthError {
  error: NextResponse;
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export async function requireAuthenticatedOwner(
  request: NextRequest,
): Promise<OwnerAuth | OwnerAuthError> {
  const token = getBearerToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const { url, anonKey } = getSupabasePublicEnv();
  const userClient = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: userRole, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userData.user.id,
  });

  if (roleError) {
    return {
      error: NextResponse.json(
        { error: roleError.message ?? "Failed to verify user role." },
        { status: 403 },
      ),
    };
  }

  if (userRole !== "owner" && userRole !== "admin") {
    return {
      error: NextResponse.json({ error: "Owner access required." }, { status: 403 }),
    };
  }

  return { userId: userData.user.id };
}
