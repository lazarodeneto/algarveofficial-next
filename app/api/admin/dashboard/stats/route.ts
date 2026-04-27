import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";
import { logAdminRequest, logAdminError, createRequestId } from "@/lib/server/observability";

export async function GET(request: NextRequest) {
  logAdminRequest(request);
  const requestId = createRequestId();

  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const totalRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true });

  if (totalRes.error) {
    logAdminError("STATS_TOTAL_FAILED", totalRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: totalRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const publishedRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (publishedRes.error) {
    logAdminError("STATS_PUBLISHED_FAILED", publishedRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: publishedRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const pendingReviewRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");

  if (pendingReviewRes.error) {
    logAdminError("STATS_PENDING_FAILED", pendingReviewRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: pendingReviewRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const unverifiedRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("tier", "unverified");

  if (unverifiedRes.error) {
    logAdminError("STATS_UNVERIFIED_FAILED", unverifiedRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: unverifiedRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const nullTierRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .is("tier", null);

  if (nullTierRes.error) {
    logAdminError("STATS_NULL_TIER_FAILED", nullTierRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: nullTierRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const verifiedRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("tier", "verified");

  if (verifiedRes.error) {
    logAdminError("STATS_VERIFIED_FAILED", verifiedRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: verifiedRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const signatureRes = await auth.userClient
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("tier", "signature");

  if (signatureRes.error) {
    logAdminError("STATS_SIGNATURE_FAILED", signatureRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: signatureRes.error.message, requestId } },
      { status: 500 },
    );
  }

  const recentRes = await auth.userClient
    .from("listings")
    .select("id, name, tier, status, city:cities(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentRes.error) {
    logAdminError("STATS_RECENT_FAILED", recentRes.error, { requestId });
    return NextResponse.json(
      { ok: false, error: { message: recentRes.error.message, requestId } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    stats: {
      totalListings: totalRes.count ?? 0,
      publishedListings: publishedRes.count ?? 0,
      pendingReview: pendingReviewRes.count ?? 0,
      tierDistribution: {
        unverified: (unverifiedRes.count ?? 0) + (nullTierRes.count ?? 0),
        verified: verifiedRes.count ?? 0,
        signature: signatureRes.count ?? 0,
      },
    },
    recentListings: recentRes.data ?? [],
  });
}