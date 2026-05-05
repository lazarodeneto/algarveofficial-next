/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload } from "@/lib/api/api-validation";
import { userUpdateSchema } from "@/lib/forms/admin-schemas";

type UserRole = Database["public"]["Enums"]["app_role"];

const ALLOWED_ROLES = new Set<UserRole>(["admin", "editor", "owner", "viewer_logged"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Role guard is centralized in requireAdminWriteClient via get_user_role.
interface UpdateUserBody {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
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

async function getCurrentRole(serviceClient: any, userId: string) {
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

async function countAdmins(serviceClient: any) {
  const { count, error } = await serviceClient
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw error;
  return count ?? 0;
}

async function countOwnedListings(serviceClient: any, userId: string) {
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
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can manage users.",
    { allowedRoles: ["admin"] },
  );
  if ("error" in auth) return auth.error;

  const { userId } = await context.params;
  if (!isValidUuid(userId)) {
    return NextResponse.json({ ok: false, error: "Invalid user id." }, { status: 400 });
  }

  let body: UpdateUserBody;
  try {
    body = (await request.json()) as UpdateUserBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validatePayload(userUpdateSchema, body, "USER");
  if (!validation.success) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const fullName = validation.data.fullName ?? null;
  const email = validation.data.email ?? null;
  const phone = validation.data.phone ?? null;
  const role = validation.data.role;

  const serviceClient = auth.writeClient;
  const currentRoleState = await getCurrentRole(serviceClient, userId);

  if (role && currentRoleState.role === "admin" && role !== "admin") {
    const adminCount = await countAdmins(serviceClient);
    if (adminCount <= 1) {
      return NextResponse.json({ ok: false, error: "Cannot demote the last admin." }, { status: 409 });
    }
  }

  const { data: authUserResult, error: authLookupError } = await serviceClient.auth.admin.getUserById(userId);
  if (authLookupError || !authUserResult.user) {
    return NextResponse.json(
      { ok: false, error: authLookupError?.message ?? "User not found in auth." },
      { status: 404 },
    );
  }

  const authPayload: Parameters<typeof serviceClient.auth.admin.updateUserById>[1] = {};
  if (email !== null) {
    authPayload.email = email;
    authPayload.email_confirm = true;
  }
  if (fullName !== null) {
    authPayload.user_metadata = {
      ...(authUserResult.user.user_metadata ?? {}),
      full_name: fullName,
    };
  }

  if (Object.keys(authPayload).length > 0) {
    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(userId, authPayload);
    if (authUpdateError) {
      return NextResponse.json({ ok: false, error: authUpdateError.message }, { status: 400 });
    }
  }

  const profilePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (fullName !== null) profilePayload.full_name = fullName;
  if (email !== null) profilePayload.email = email;
  if (phone !== null) profilePayload.phone = phone;

  if (Object.keys(profilePayload).length > 1) {
    const { error: profileUpdateError } = await serviceClient
      .from("profiles")
      .update(profilePayload)
      .eq("id", userId);

    if (profileUpdateError) {
      return NextResponse.json({ ok: false, error: profileUpdateError.message }, { status: 400 });
    }
  }

  if (role && role !== currentRoleState.role) {
    if (currentRoleState.rowId) {
      const { error: roleUpdateError } = await serviceClient
        .from("user_roles")
        .update({ role })
        .eq("id", currentRoleState.rowId);

      if (roleUpdateError) {
        return NextResponse.json({ ok: false, error: roleUpdateError.message }, { status: 400 });
      }
    } else {
      const { error: roleInsertError } = await serviceClient
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleInsertError) {
        return NextResponse.json({ ok: false, error: roleInsertError.message }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can delete users.",
    { allowedRoles: ["admin"] },
  );
  if ("error" in auth) return auth.error;

  const { userId } = await context.params;
  if (!isValidUuid(userId)) {
    return NextResponse.json({ ok: false, error: "Invalid user id." }, { status: 400 });
  }

  const serviceClient = auth.writeClient;
  if (userId === auth.userId) {
    return NextResponse.json({ ok: false, error: "Admins cannot delete their own account." }, { status: 409 });
  }

  const currentRoleState = await getCurrentRole(serviceClient, userId);
  if (currentRoleState.role === "admin") {
    const adminCount = await countAdmins(serviceClient);
    if (adminCount <= 1) {
      return NextResponse.json({ ok: false, error: "Cannot delete the last admin." }, { status: 409 });
    }
  }

  const ownedListingsCount = await countOwnedListings(serviceClient, userId);
  if (ownedListingsCount > 0) {
    return NextResponse.json(
      { ok: false, error: "Reassign or remove user listings before deletion." },
      { status: 409 },
    );
  }

  const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId, false);
  if (authDeleteError) {
    return NextResponse.json({ ok: false, error: authDeleteError.message }, { status: 400 });
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
