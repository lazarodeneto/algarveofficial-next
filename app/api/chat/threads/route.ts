import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ensureOwnerCrmLead } from "@/lib/owner-crm/lead";
import { crmErrorPayload, privateNoStoreHeaders } from "@/lib/owner-crm/server";
import { requireAuthenticatedUser } from "@/lib/server/user-auth";
import { enforceWriteRateLimit } from "@/lib/server/write-rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const createThreadSchema = z.object({
  listingId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser(request);
  if ("error" in auth) return auth.error;

  const rateLimited = await enforceWriteRateLimit({
    request,
    scope: "chat:threads:create",
    email: auth.email,
    maxAttempts: 30,
    windowSeconds: 60,
  });
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(crmErrorPayload("INVALID_JSON", "Request body must be valid JSON."), { status: 400 });
  }

  const parsed = createThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(crmErrorPayload("CHAT_THREAD_VALIDATION_ERROR", "Invalid chat thread payload.", parsed.error.flatten()), {
      status: 400,
    });
  }

  const client = createServiceRoleClient();
  if (!client) {
    return NextResponse.json(crmErrorPayload("SERVICE_UNAVAILABLE", "Chat storage is not configured."), { status: 503 });
  }

  try {
    const { data: listing, error: listingError } = await (client as any)
      .from("listings")
      .select("id,owner_id,name,status")
      .eq("id", parsed.data.listingId)
      .eq("status", "published")
      .maybeSingle();
    if (listingError) throw listingError;
    if (!listing?.owner_id) {
      return NextResponse.json(crmErrorPayload("LISTING_NOT_AVAILABLE", "Listing is not available for messaging."), { status: 404 });
    }
    const ownerId = listing.owner_id;

    const { data: existingThread, error: existingError } = await (client as any)
      .from("chat_threads")
      .select("*")
      .eq("listing_id", parsed.data.listingId)
      .eq("owner_id", ownerId)
      .eq("viewer_id", auth.userId)
      .eq("channel", "whatsapp")
      .maybeSingle();
    if (existingError) throw existingError;

    let thread = existingThread;
    if (!thread) {
      const { data: insertedThread, error: insertError } = await (client as any)
        .from("chat_threads")
        .insert({
          listing_id: parsed.data.listingId,
          owner_id: ownerId,
          viewer_id: auth.userId,
          channel: "whatsapp",
          status: "active",
        })
        .select("*")
        .single();
      if (insertError) throw insertError;
      thread = insertedThread;
    }

    const { data: profile } = await (client as any)
      .from("profiles")
      .select("full_name,email,phone")
      .eq("id", auth.userId)
      .maybeSingle();

    await ensureOwnerCrmLead({
      ownerId,
      listingId: parsed.data.listingId,
      viewerId: auth.userId,
      threadId: thread.id,
      contact: {
        displayName: profile?.full_name ?? auth.email,
        email: profile?.email ?? auth.email,
        phone: profile?.phone ?? null,
      },
      sourceTable: "chat_threads",
      sourceRecordId: thread.id,
      summary: `Inquiry opened for ${listing.name}`,
      metadata: {
        listing_status: listing.status,
      },
    });

    return NextResponse.json({ thread }, { status: existingThread ? 200 : 201, headers: privateNoStoreHeaders });
  } catch (error) {
    return NextResponse.json(
      crmErrorPayload("CHAT_THREAD_CREATE_FAILED", error instanceof Error ? error.message : "Failed to create chat thread."),
      { status: 500 },
    );
  }
}
