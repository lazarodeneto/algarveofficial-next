import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database, TablesUpdate } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { bulkTierUpdateSchema } from "@/lib/forms/admin-schemas";

type UserRole = Database["public"]["Enums"]["app_role"];

const VALID_TIERS = new Set(["unverified", "verified", "signature"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

async function requireAdminServiceClient(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      error: NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin writes." },
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
        { error: roleError.message ?? "Failed to verify user role." },
        { status: 403 },
      ),
    };
  }

  if ((requesterRole as UserRole) !== "admin") {
    return { error: NextResponse.json({ error: "Only admins can update listing tiers." }, { status: 403 }) };
  }

  return { serviceClient };
}

interface BulkTierBody {
  ids?: unknown;
  tier?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminServiceClient(request);
  if ("error" in auth) return auth.error;

  let body: BulkTierBody;
  try {
    body = (await request.json()) as BulkTierBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validatePayload(bulkTierUpdateSchema, body, "BULK_TIER");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((value): value is string => typeof value === "string")
    : [];
  const tier = typeof body.tier === "string" ? body.tier : "";

  if (ids.length === 0) {
    return NextResponse.json({ error: "No listing ids provided." }, { status: 400 });
  }
  if (!ids.every((id) => UUID_PATTERN.test(id))) {
    return NextResponse.json({ error: "One or more listing ids are invalid." }, { status: 400 });
  }
  if (!VALID_TIERS.has(tier)) {
    return NextResponse.json({ error: "Invalid tier value." }, { status: 400 });
  }

  const { error } = await auth.serviceClient
    .from("listings")
    .update({ tier: tier as TablesUpdate<"listings">["tier"] })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, updated: ids.length, tier });
}
