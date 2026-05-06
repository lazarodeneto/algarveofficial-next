import { NextRequest, NextResponse } from "next/server";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can mark admin chat threads as read.",
    {
      auditAction: "admin.chat.mark-read",
    },
  );
  if ("error" in auth) return auth.error;

  let body: { threadId?: string; threadIds?: string[] };
  try {
    body = await request.json() as { threadId?: string; threadIds?: string[] };
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const ids: string[] = body.threadId ? [body.threadId] : Array.isArray(body.threadIds) ? body.threadIds.filter(Boolean) as string[] : [];
  if (ids.length === 0) return NextResponse.json({ ok: true });
  if (ids.some((id) => !UUID_PATTERN.test(id))) {
    return adminErrorResponse(400, "INVALID_THREAD_ID", "All thread ids must be valid UUIDs.");
  }

  const { error } = await auth.userClient
    .from("chat_messages")
    .update({ delivery_status: "read" })
    .in("thread_id", ids)
    .neq("sender_type", "admin")
    .neq("delivery_status", "read");

  if (error) return adminErrorResponse(500, "CHAT_MARK_READ_FAILED", error.message);
  return NextResponse.json({ ok: true });
}
