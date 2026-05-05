/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  let body: { messageId: string };
  try {
    body = await request.json() as { messageId: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await auth.userClient.rpc("admin_delete_chat_message" as any, { p_message_id: body.messageId });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
