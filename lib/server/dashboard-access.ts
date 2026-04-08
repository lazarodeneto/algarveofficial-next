import { redirect } from "next/navigation";

import type { Database } from "@/integrations/supabase/types";
import { buildLocalizedPath } from "@/lib/i18n/routing";
import { createClient } from "@/lib/supabase/server";

type UserRole = Database["public"]["Enums"]["app_role"];

interface GuardDashboardRouteParams {
  locale: string;
  basePath: "/admin" | "/owner" | "/dashboard";
  slug?: string[];
  allowedRoles: UserRole[];
}

function getDashboardPathForRole(locale: string, role: UserRole): string {
  switch (role) {
    case "admin":
    case "editor":
      return buildLocalizedPath(locale, "/admin");
    case "owner":
      return buildLocalizedPath(locale, "/owner");
    case "viewer_logged":
    default:
      return buildLocalizedPath(locale, "/dashboard");
  }
}

function getRequestedPath(locale: string, basePath: GuardDashboardRouteParams["basePath"], slug?: string[]) {
  const nestedPath = slug?.length ? `/${slug.join("/")}` : "";
  return buildLocalizedPath(locale, `${basePath}${nestedPath}`);
}

async function resolveServerUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_role", { _user_id: userId });

  if (error) {
    console.warn("[dashboard-access] falling back to viewer role after get_user_role failure", {
      userId,
      message: error.message,
    });
    return "viewer_logged";
  }

  return (data as UserRole | null) ?? "viewer_logged";
}

export async function guardDashboardRoute({
  locale,
  basePath,
  slug,
  allowedRoles,
}: GuardDashboardRouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const requestedPath = getRequestedPath(locale, basePath, slug);

  if (error || !user) {
    redirect(buildLocalizedPath(locale, `/login?next=${encodeURIComponent(requestedPath)}`));
  }

  const role = await resolveServerUserRole(user.id);

  if (!allowedRoles.includes(role)) {
    redirect(getDashboardPathForRole(locale, role));
  }

  return { userId: user.id, role };
}
