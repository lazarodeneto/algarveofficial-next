import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "overview";

  if (type === "overview") {
    const [
      { count: totalListings },
      { count: publishedListings },
      { count: pendingReview },
      { count: totalUsers },
      { count: vipMembers },
      { data: ownersData },
      { count: totalFavorites },
      { count: totalMessages },
      { count: curatedListings },
    ] = await Promise.all([
      auth.userClient.from("listings").select("id", { count: "exact", head: true }),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      auth.userClient.from("profiles").select("id", { count: "exact", head: true }),
      auth.userClient.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "viewer_logged"),
      auth.userClient.from("listings").select("owner_id"),
      auth.userClient.from("favorites").select("id", { count: "exact", head: true }),
      auth.userClient.from("chat_messages").select("id", { count: "exact", head: true }),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("tier", "signature"),
    ]);

    const activeOwners = new Set((ownersData ?? []).map((o) => o.owner_id).filter(Boolean)).size;

    return NextResponse.json({
      ok: true,
      data: {
        totalListings: totalListings ?? 0,
        publishedListings: publishedListings ?? 0,
        pendingReview: pendingReview ?? 0,
        totalUsers: totalUsers ?? 0,
        vipMembers: vipMembers ?? 0,
        activeOwners,
        totalFavorites: totalFavorites ?? 0,
        totalMessages: totalMessages ?? 0,
        curatedListings: curatedListings ?? 0,
      },
    });
  }

  if (type === "tier-distribution") {
    const [signature, verified, unverified] = await Promise.all([
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("tier", "signature"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("tier", "verified"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("tier", "unverified"),
    ]);

    return NextResponse.json({
      ok: true,
      data: [
        { name: "Signature", value: signature.count ?? 0 },
        { name: "Verified", value: verified.count ?? 0 },
        { name: "Unverified", value: unverified.count ?? 0 },
      ],
    });
  }

  if (type === "status-distribution") {
    const [published, pending, draft, rejected] = await Promise.all([
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "published"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "draft"),
      auth.userClient.from("listings").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);

    return NextResponse.json({
      ok: true,
      data: [
        { name: "Published", value: published.count ?? 0 },
        { name: "Pending Review", value: pending.count ?? 0 },
        { name: "Draft", value: draft.count ?? 0 },
        { name: "Rejected", value: rejected.count ?? 0 },
      ],
    });
  }

  return NextResponse.json({ ok: false, error: "Unknown analytics type" }, { status: 400 });
}
