// Shared auth helper for owner-scoped API routes (billing portal, change plan,
// current subscription). Validates Bearer token and confirms the user has the
// owner or admin role.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { type OwnerAccessRole, isOwnerAccessRole } from "@/lib/auth/roles";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export interface OwnerAuth {
  userId: string;
  email: string | null;
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

function ownerAuthError(status: number, error: string): OwnerAuthError {
  return { error: NextResponse.json({ error }, { status }) };
}

async function roleForUser(
  userClient: SupabaseClient,
  userId: string,
): Promise<OwnerAccessRole | OwnerAuthError> {
  const { data: userRole, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userId,
  });

  if (roleError) {
    return ownerAuthError(403, roleError.message ?? "Failed to verify user role.");
  }

  if (!isOwnerAccessRole(userRole)) {
    return ownerAuthError(403, "Owner access required.");
  }

  return userRole;
}

async function requireOwnerFromCookies(): Promise<OwnerAuth | OwnerAuthError | null> {
  const cookieClient = await createCookieClient();
  const { data: userData, error: userError } = await cookieClient.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const role = await roleForUser(cookieClient, userData.user.id);
  if (typeof role !== "string") return role;

  return {
    userId: userData.user.id,
    email: userData.user.email ?? null,
  };
}

async function requireOwnerFromBearer(request: NextRequest): Promise<OwnerAuth | OwnerAuthError> {
  const token = getBearerToken(request);
  if (!token) {
    return ownerAuthError(401, "Missing authorization token.");
  }

  const { url, anonKey } = getSupabasePublicEnv();
  const userClient = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return ownerAuthError(401, "Unauthorized.");
  }

  const role = await roleForUser(userClient, userData.user.id);
  if (typeof role !== "string") return role;

  return { userId: userData.user.id, email: userData.user.email ?? null };
}

export async function requireAuthenticatedOwner(
  request: NextRequest,
): Promise<OwnerAuth | OwnerAuthError> {
  const cookieAuth = await requireOwnerFromCookies();
  if (cookieAuth) return cookieAuth;

  return requireOwnerFromBearer(request);
}
