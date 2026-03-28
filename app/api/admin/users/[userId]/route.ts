import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

type UserRole = Database["public"]["Enums"]["app_role"];

const ALLOWED_ROLES = new Set<UserRole>(["admin", "editor", "owner", "viewer_logged"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface UpdateUserBody {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

function isValidUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRole(value: unknown): UserRole | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim() as UserRole;
  return ALLOWED_ROLES.has(normalized) ? normalized : undefined;
}

async function createAuthorizedClients(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      error: NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin user management." },
        { status: 500 },
      ),
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
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: requesterRole, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userData.user.id,
  });

  if (roleError) {
    return {
      error: NextResponse.json(
        { error: roleError.message || "Failed to verify user role." },
        { status: 403 },
      ),
    };
  }

  if (requesterRole !== "admin") {
    return { error: NextResponse.json({ error: "Only admins can manage users." }, { status: 403 }) };
  }

  return {
    serviceClient,
    requesterId: userData.user.id,
  };
}

async function getCurrentRole(
  serviceClient: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  userId: string,
) {
  const { data: roleRow, error } = await serviceClient
    .from("user_roles")
    .select("id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return {
    rowId: roleRow?.id ?? null,
    role: (roleRow?.role ?? "viewer_logged") as UserRole,
  };
}

async function countAdmins(serviceClient: NonNullable<ReturnType<typeof createServiceRoleClient>>) {
  const { count, error } = await serviceClient
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw error;
  return count ?? 0;
}

async function countOwnedListings(
  serviceClient: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  userId: string,
) {
  const { count, error } = await serviceClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const clients = await createAuthorizedClients(request);
  if ("error" in clients) return clients.error;

  const { userId } = await context.params;
  if (!isValidUuid(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  let body: UpdateUserBody;
  try {
    body = (await request.json()) as UpdateUserBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const fullName = normalizeOptionalString(body.fullName);
  const email = normalizeEmail(body.email);
  const phone = normalizeOptionalString(body.phone);
  const role = normalizeRole(body.role);

  if (body.email !== undefined && !email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (body.role !== undefined && !role) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { serviceClient } = clients;
  const currentRoleState = await getCurrentRole(serviceClient, userId);
  const nextEmail = email ?? undefined;

  if (role && currentRoleState.role === "admin" && role !== "admin") {
    const adminCount = await countAdmins(serviceClient);
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot demote the last admin." }, { status: 409 });
    }
  }

  const { data: authUserResult, error: authLookupError } = await serviceClient.auth.admin.getUserById(userId);
  if (authLookupError || !authUserResult.user) {
    return NextResponse.json(
      { error: authLookupError?.message || "User not found in auth." },
      { status: 404 },
    );
  }

  const authPayload: Parameters<typeof serviceClient.auth.admin.updateUserById>[1] = {};
  if (nextEmail !== undefined) {
    authPayload.email = nextEmail;
    authPayload.email_confirm = true;
  }
  if (fullName !== undefined) {
    authPayload.user_metadata = {
      ...(authUserResult.user.user_metadata ?? {}),
      full_name: fullName ?? "",
    };
  }

  if (Object.keys(authPayload).length > 0) {
    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(userId, authPayload);
    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 400 });
    }
  }

  const profilePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (fullName !== undefined) profilePayload.full_name = fullName;
  if (nextEmail !== undefined) profilePayload.email = nextEmail;
  if (phone !== undefined) profilePayload.phone = phone;

  if (Object.keys(profilePayload).length > 1) {
    const { error: profileUpdateError } = await serviceClient
      .from("profiles")
      .update(profilePayload)
      .eq("id", userId);

    if (profileUpdateError) {
      return NextResponse.json({ error: profileUpdateError.message }, { status: 400 });
    }
  }

  if (role && role !== currentRoleState.role) {
    if (currentRoleState.rowId) {
      const { error: roleUpdateError } = await serviceClient
        .from("user_roles")
        .update({ role })
        .eq("id", currentRoleState.rowId);

      if (roleUpdateError) {
        return NextResponse.json({ error: roleUpdateError.message }, { status: 400 });
      }
    } else {
      const { error: roleInsertError } = await serviceClient
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleInsertError) {
        return NextResponse.json({ error: roleInsertError.message }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const clients = await createAuthorizedClients(request);
  if ("error" in clients) return clients.error;

  const { userId } = await context.params;
  if (!isValidUuid(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const { serviceClient, requesterId } = clients;
  if (userId === requesterId) {
    return NextResponse.json({ error: "Admins cannot permanently delete their own account here." }, { status: 409 });
  }

  const currentRoleState = await getCurrentRole(serviceClient, userId);
  if (currentRoleState.role === "admin") {
    const adminCount = await countAdmins(serviceClient);
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin." }, { status: 409 });
    }
  }

  const ownedListingsCount = await countOwnedListings(serviceClient, userId);
  if (ownedListingsCount > 0) {
    return NextResponse.json(
      {
        error:
          "This user still owns published or draft listings. Reassign or remove those listings before deleting the account.",
      },
      { status: 409 },
    );
  }

  const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId, false);
  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 400 });
  }

  const cleanupTargets: Array<{ table: string; column: string }> = [
    { table: "admin_notifications", column: "owner_id" },
    { table: "admin_rate_limits", column: "user_id" },
    { table: "analytics_events", column: "user_id" },
    { table: "blog_comments", column: "user_id" },
    { table: "chat_threads", column: "viewer_id" },
    { table: "chat_threads", column: "owner_id" },
    { table: "conversations", column: "user_id" },
    { table: "conversations", column: "owner_id" },
    { table: "email_contacts", column: "user_id" },
    { table: "favorites", column: "user_id" },
    { table: "listing_claims", column: "user_id" },
    { table: "listing_reviews", column: "user_id" },
    { table: "owner_subscriptions", column: "owner_id" },
    { table: "reviews", column: "user_id" },
    { table: "security_audit_log", column: "user_id" },
    { table: "user_roles", column: "user_id" },
    { table: "whatsapp_accounts", column: "owner_id" },
    { table: "profiles", column: "id" },
  ];

  const cleanupErrors: string[] = [];
  for (const target of cleanupTargets) {
    const { error } = await serviceClient
      .from(target.table as never)
      .delete()
      .eq(target.column as never, userId);

    if (error) cleanupErrors.push(`${target.table}: ${error.message}`);
  }

  return NextResponse.json({
    ok: true,
    warning: cleanupErrors.length > 0 ? cleanupErrors.join(" | ") : null,
  });
}
