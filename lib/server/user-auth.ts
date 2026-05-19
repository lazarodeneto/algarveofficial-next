import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export interface UserAuth {
  userId: string;
  email: string | null;
}

export interface UserAuthError {
  error: NextResponse;
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

function authError(status: number, error: string): UserAuthError {
  return { error: NextResponse.json({ error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: error } }, { status }) };
}

async function getUserFromClient(client: SupabaseClient<Database>): Promise<UserAuth | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return {
    userId: data.user.id,
    email: data.user.email ?? null,
  };
}

async function requireUserFromCookies(): Promise<UserAuth | null> {
  const cookieClient = await createCookieClient();
  return getUserFromClient(cookieClient);
}

async function requireUserFromBearer(request: NextRequest): Promise<UserAuth | UserAuthError> {
  const token = getBearerToken(request);
  if (!token) return authError(401, "Missing authorization token.");

  const { url, anonKey } = getSupabasePublicEnv();
  const userClient = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const auth = await getUserFromClient(userClient);
  return auth ?? authError(401, "Unauthorized.");
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<UserAuth | UserAuthError> {
  const cookieAuth = await requireUserFromCookies();
  if (cookieAuth) return cookieAuth;
  return requireUserFromBearer(request);
}
