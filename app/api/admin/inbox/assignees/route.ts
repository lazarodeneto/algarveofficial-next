import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

type UserRole = Database["public"]["Enums"]["app_role"];

interface AssigneeProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

const MAX_ASSIGNEES = 12;

function normalizeSearch(value: string | null) {
  return (value ?? "").trim().toLowerCase().slice(0, 80);
}

function profileMatchesSearch(profile: AssigneeProfile, search: string) {
  if (!search) return true;
  return [profile.full_name, profile.email, profile.id]
    .filter((value): value is string => typeof value === "string")
    .some((value) => value.toLowerCase().includes(search));
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can search inbox assignees.",
    {
      allowedRoles: ["admin"],
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin assignee search.",
    },
  );
  if ("error" in auth) return auth.error;

  const search = normalizeSearch(new URL(request.url).searchParams.get("query"));

  const { data: roleRows, error: roleError } = await auth.writeClient
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin")
    .limit(100);

  if (roleError) {
    return adminErrorResponse(500, "ASSIGNEE_ROLES_FAILED", roleError.message);
  }

  const adminUserIds = Array.from(
    new Set(
      (roleRows ?? [])
        .filter((row) => (row.role as UserRole | null) === "admin")
        .map((row) => row.user_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  if (adminUserIds.length === 0) {
    return NextResponse.json({ ok: true, assignees: [] });
  }

  const { data: profiles, error: profilesError } = await auth.writeClient
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", adminUserIds);

  if (profilesError) {
    return adminErrorResponse(500, "ASSIGNEE_PROFILES_FAILED", profilesError.message);
  }

  const assignees = ((profiles ?? []) as AssigneeProfile[])
    .filter((profile) => profileMatchesSearch(profile, search))
    .sort((a, b) => {
      const aLabel = (a.full_name || a.email || a.id).toLowerCase();
      const bLabel = (b.full_name || b.email || b.id).toLowerCase();
      return aLabel.localeCompare(bLabel);
    })
    .slice(0, MAX_ASSIGNEES)
    .map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: "admin" as const,
    }));

  return NextResponse.json({ ok: true, assignees });
}
