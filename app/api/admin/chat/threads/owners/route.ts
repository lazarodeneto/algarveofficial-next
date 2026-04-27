import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const { data: threads, error } = await auth.userClient
    .from("chat_threads")
    .select("owner_id");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const ownerIds = [...new Set((threads ?? []).map((t) => t.owner_id).filter(Boolean))];
  if (ownerIds.length === 0) return NextResponse.json({ ok: true, data: [] });

  const { data: profiles, error: profilesError } = await auth.userClient
    .from("profiles")
    .select("id, full_name")
    .in("id", ownerIds);

  if (profilesError) return NextResponse.json({ ok: false, error: profilesError.message }, { status: 500 });

  return NextResponse.json({ ok: true, data: profiles ?? [] });
}
