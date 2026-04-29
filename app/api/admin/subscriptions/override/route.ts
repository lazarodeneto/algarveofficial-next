import { NextRequest, NextResponse } from "next/server";

import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logSubscriptionMutation } from "@/lib/subscriptions/audit";
import {
  applyAdminTierOverride,
  applyTierToListings,
  findByOwner,
} from "@/lib/subscriptions/db";
import type { EffectiveTier } from "@/lib/subscriptions/types";

const VALID_TIERS = new Set<EffectiveTier>(["unverified", "verified", "signature"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface OverrideBody {
  ownerId?: unknown;
  tier?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can set subscription tier overrides.",
    {
      requireServiceRole: true,
      allowedRoles: ["admin"],
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin subscription override writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: OverrideBody;
  try {
    body = (await request.json()) as OverrideBody;
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const ownerId = typeof body.ownerId === "string" ? body.ownerId.trim() : "";
  const tier = typeof body.tier === "string" ? body.tier.trim() : "";

  if (!ownerId || !UUID_PATTERN.test(ownerId)) {
    return adminErrorResponse(400, "INVALID_OWNER_ID", "ownerId must be a valid UUID.");
  }

  if (!VALID_TIERS.has(tier as EffectiveTier)) {
    return adminErrorResponse(
      400,
      "INVALID_TIER",
      "tier must be one of: unverified, verified, signature.",
    );
  }

  const previous = await findByOwner(auth.writeClient, ownerId);
  await applyAdminTierOverride(auth.writeClient, ownerId, tier as EffectiveTier);
  const next = await findByOwner(auth.writeClient, ownerId);

  if (next) {
    await applyTierToListings(auth.writeClient, ownerId, next);
  }

  await logSubscriptionMutation(auth.writeClient, {
    ownerId,
    action: "admin.subscription.tier-override",
    previous,
    next,
  });

  return NextResponse.json({
    ok: true,
    ownerId,
    tier: next?.tier ?? tier,
    tier_source: next?.tier_source ?? "admin",
  });
}
