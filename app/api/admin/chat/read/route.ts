import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  let body: { threadId?: string; threadIds?: string[] };
  try {
    body = await request.json() as { threadId?: string; threadIds?: string[] };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const ids: string[] = body.threadId ? [body.threadId] : Array.isArray(body.threadIds) ? body.threadIds.filter(Boolean) as string[] : [];
  if (ids.length === 0) return NextResponse.json({ ok: true });

  const { error } = await auth.userClient
    .from("chat_messages")
    .update({ delivery_status: "read" })
    .in("thread_id", ids)
    .neq("sender_type", "admin")
    .neq("delivery_status", "read");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}