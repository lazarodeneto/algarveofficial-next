/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("error" in auth) return auth.error;

  let body: { items: { id: string; rank: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Items array required" }, { status: 400 });
  }

  const { error } = await auth.userClient.rpc("set_featured_ranks" as any, {
    payload: JSON.stringify(items),
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
