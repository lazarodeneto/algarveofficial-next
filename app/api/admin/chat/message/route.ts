/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can send admin chat messages.",
    {
      auditAction: "admin.chat.send-message",
    },
  );
  if ("error" in auth) return auth.error;

  let body: { threadId?: unknown; messageText?: unknown };
  try {
    body = (await request.json()) as { threadId?: unknown; messageText?: unknown };
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const threadId = typeof body.threadId === "string" ? body.threadId.trim() : "";
  const messageText = typeof body.messageText === "string" ? body.messageText.trim() : "";

  if (!threadId || !UUID_PATTERN.test(threadId)) {
    return adminErrorResponse(400, "INVALID_THREAD_ID", "threadId must be a valid UUID.");
  }

  if (!messageText) {
    return adminErrorResponse(400, "INVALID_MESSAGE_TEXT", "messageText is required.");
  }

  if (messageText.length > 4000) {
    return adminErrorResponse(400, "MESSAGE_TOO_LONG", "messageText must be 4,000 characters or fewer.");
  }

  const { data: thread, error: threadError } = await auth.userClient
    .from("chat_threads")
    .select("id, owner_id, viewer_id")
    .eq("id", threadId)
    .maybeSingle();

  if (threadError) return adminErrorResponse(500, "CHAT_THREAD_LOOKUP_FAILED", threadError.message);
  if (!thread) return adminErrorResponse(404, "CHAT_THREAD_NOT_FOUND", "Chat thread was not found.");

  const createdAt = new Date().toISOString();
  const { data: message, error: insertError } = await auth.userClient
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      body_text: messageText,
      sender_type: "admin",
      recipient_id: thread.viewer_id ?? thread.owner_id ?? null,
      direction: "outbound",
      delivery_status: "delivered",
      created_at: createdAt,
    })
    .select("*")
    .single();

  if (insertError) return adminErrorResponse(500, "CHAT_MESSAGE_CREATE_FAILED", insertError.message);

  const { error: threadUpdateError } = await auth.userClient
    .from("chat_threads")
    .update({ last_message_at: createdAt, status: "active" })
    .eq("id", threadId);

  if (threadUpdateError) {
    return adminErrorResponse(500, "CHAT_THREAD_UPDATE_FAILED", threadUpdateError.message);
  }

  return NextResponse.json({ ok: true, data: message });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins or editors can delete admin chat messages.",
    {
      auditAction: "admin.chat.delete-message",
    },
  );
  if ("error" in auth) return auth.error;

  let body: { messageId: string };
  try {
    body = await request.json() as { messageId: string };
  } catch {
    return adminErrorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (!body.messageId || typeof body.messageId !== "string") {
    return adminErrorResponse(400, "INVALID_MESSAGE_ID", "messageId is required.");
  }

  const { error } = await auth.userClient.rpc("admin_delete_chat_message" as any, { p_message_id: body.messageId });
  if (error) return adminErrorResponse(500, "CHAT_MESSAGE_DELETE_FAILED", error.message);
  return NextResponse.json({ ok: true });
}
