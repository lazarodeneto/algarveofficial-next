import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = request.nextUrl;
  const threadId = searchParams.get("threadId") ?? undefined;

  if (threadId) {
    const { data, error } = await auth.userClient
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ ok: true, data, error: error?.message ?? null });
  }

  let query = auth.userClient
    .from("chat_threads")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const status = searchParams.get("status");
  const ownerId = searchParams.get("ownerId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (ownerId) {
    query = query.eq("owner_id", ownerId);
  }
  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }
  if (dateTo) {
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endOfDay.toISOString());
  }

  const { data: threads, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!threads?.length) return NextResponse.json({ ok: true, data: [], threads: [], messages: [] });

  const viewerIds = [...new Set(threads.map((t) => t.viewer_id).filter((id): id is string => Boolean(id)))];
  const ownerIds = [...new Set(threads.map((t) => t.owner_id).filter((id): id is string => Boolean(id)))];
  const listingIds = [...new Set(threads.map((t) => t.listing_id).filter((id): id is string => Boolean(id)))];
  const ids = threads.map((t) => t.id);

  const [viewersResult, ownersResult, listingsResult, messagesResult] = await Promise.all([
    viewerIds.length ? auth.userClient.from("profiles").select("id, full_name").in("id", viewerIds) : Promise.resolve({ data: [] as any[], error: null }),
    ownerIds.length ? auth.userClient.from("profiles").select("id, full_name").in("id", ownerIds) : Promise.resolve({ data: [] as any[], error: null }),
    listingIds.length ? auth.userClient.from("listings").select("id, name, slug").in("id", listingIds) : Promise.resolve({ data: [] as any[], error: null }),
    ids.length ? auth.userClient.from("chat_messages").select("thread_id").in("thread_id", ids) : Promise.resolve({ data: [] as any[], error: null }),
  ]);

  const viewerMap = new Map((viewersResult.data ?? []).map((v) => [v.id, v]));
  const ownerMap = new Map((ownersResult.data ?? []).map((o) => [o.id, o]));
  const listingMap = new Map((listingsResult.data ?? []).map((l) => [l.id, l]));

  const messageCountMap = new Map<string, number>();
  (messagesResult.data ?? []).forEach((m) => {
    messageCountMap.set(m.thread_id, (messageCountMap.get(m.thread_id) ?? 0) + 1);
  });

  const enriched = threads.map((t) => ({
    ...t,
    viewer: viewerMap.get(t.viewer_id),
    owner: ownerMap.get(t.owner_id),
    listing: listingMap.get(t.listing_id),
    message_count: messageCountMap.get(t.id) ?? 0,
  }));

  return NextResponse.json({ ok: true, data: enriched, threads: enriched, messages: [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  let body: { threadId: string; status: string };
  try {
    body = await request.json() as { threadId: string; status: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await auth.userClient
    .from("chat_threads")
    .update({ status: body.status })
    .eq("id", body.threadId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  let body: { threadId: string };
  try {
    body = await request.json() as { threadId: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { error } = await auth.userClient.rpc("admin_delete_chat_thread" as any, { p_thread_id: body.threadId });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}