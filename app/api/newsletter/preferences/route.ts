import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  syncNewsletterSubscriberToResend,
  updateNewsletterTopicSubscription,
} from "@/lib/email/resend-contacts";
import { hashNewsletterToken } from "@/lib/newsletter/newsletter-tokens";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const preferenceSchema = z.object({
  token: z.string().trim().min(16).max(500),
  action: z.enum(["stay_subscribed", "subscribe", "unsubscribe"]),
});

interface SubscriberRow {
  id: string;
  email: string;
  full_name: string | null;
  status: string | null;
  is_subscribed: boolean | null;
  confirmed_at: string | null;
  locale: string | null;
  source: string | null;
}

type SafePreferenceStatus = "subscribed" | "unsubscribed" | "invalid" | "blocked";

const SUBSCRIBER_SELECT = [
  "id",
  "email",
  "full_name",
  "status",
  "is_subscribed",
  "confirmed_at",
  "locale",
  "source",
].join(", ");

function safeStatus(subscriber: SubscriberRow | null): SafePreferenceStatus {
  if (!subscriber) return "invalid";
  const status = subscriber.status ?? (subscriber.is_subscribed ? "subscribed" : "unsubscribed");
  if (status === "subscribed") return "subscribed";
  if (status === "unsubscribed") return "unsubscribed";
  if (status === "bounced" || status === "complained" || status === "failed") return "blocked";
  return "invalid";
}

function safeResponse(status: SafePreferenceStatus, httpStatus = 200) {
  return NextResponse.json({
    ok: status !== "invalid",
    status,
    message: messageForStatus(status),
  }, { status: httpStatus });
}

function messageForStatus(status: SafePreferenceStatus) {
  switch (status) {
    case "subscribed":
      return "Your AlgarveOfficial newsletter preference is active.";
    case "unsubscribed":
      return "Your AlgarveOfficial newsletter preference is unsubscribed.";
    case "blocked":
      return "This newsletter preference cannot be changed from this link.";
    default:
      return "This preferences link is invalid or expired.";
  }
}

async function findSubscriberByToken(token: string) {
  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return {
      client: null,
      subscriber: null,
      unavailable: true,
    };
  }

  const tokenHash = hashNewsletterToken(token);
  const { data, error } = await writeClient
    .from("email_subscribers" as never)
    .select(SUBSCRIBER_SELECT)
    .eq("unsubscribe_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    return { client: writeClient, subscriber: null, unavailable: true };
  }

  return {
    client: writeClient,
    subscriber: data as SubscriberRow | null,
    unavailable: false,
  };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) return safeResponse("invalid", 400);

  const { subscriber, unavailable } = await findSubscriberByToken(token);
  if (unavailable) {
    return NextResponse.json({
      ok: false,
      status: "invalid",
      message: "Newsletter preferences are temporarily unavailable.",
    }, { status: 503 });
  }

  const status = safeStatus(subscriber);
  return safeResponse(status, status === "invalid" ? 400 : 200);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return safeResponse("invalid", 400);
  }

  const parsed = preferenceSchema.safeParse(body);
  if (!parsed.success) return safeResponse("invalid", 400);

  const { token, action } = parsed.data;
  const { client, subscriber, unavailable } = await findSubscriberByToken(token);
  if (unavailable || !client) {
    return NextResponse.json({
      ok: false,
      status: "invalid",
      message: "Newsletter preferences are temporarily unavailable.",
    }, { status: 503 });
  }

  const currentStatus = safeStatus(subscriber);
  if (!subscriber || currentStatus === "invalid") return safeResponse("invalid", 400);
  if (currentStatus === "blocked") return safeResponse("blocked", 409);

  const now = new Date().toISOString();

  if (action === "unsubscribe") {
    const { error } = await client
      .from("email_subscribers" as never)
      .update({
        status: "unsubscribed",
        is_subscribed: false,
        unsubscribed_at: now,
        updated_at: now,
      } as never)
      .eq("id", subscriber.id);

    if (error) {
      return NextResponse.json({
        ok: false,
        status: currentStatus,
        message: "Newsletter preferences could not be updated.",
      }, { status: 500 });
    }

    const sync = await updateNewsletterTopicSubscription(subscriber.email, "opt_out");
    await client
      .from("email_subscribers" as never)
      .update({
        resend_sync_status: sync.status,
        resend_synced_at: sync.success ? now : null,
        updated_at: now,
      } as never)
      .eq("id", subscriber.id);

    return safeResponse("unsubscribed");
  }

  if (currentStatus !== "subscribed" && action === "stay_subscribed") {
    return safeResponse(currentStatus);
  }

  const { data: updatedData, error: updateError } = await client
    .from("email_subscribers" as never)
    .update({
      status: "subscribed",
      is_subscribed: true,
      confirmed_at: subscriber.confirmed_at ?? now,
      subscribed_at: now,
      unsubscribed_at: null,
      updated_at: now,
    } as never)
    .eq("id", subscriber.id)
    .select(SUBSCRIBER_SELECT)
    .single();

  if (updateError || !updatedData) {
    return NextResponse.json({
      ok: false,
      status: currentStatus,
      message: "Newsletter preferences could not be updated.",
    }, { status: 500 });
  }

  const updated = updatedData as SubscriberRow;
  await syncNewsletterSubscriberToResend({
    client,
    subscriber: {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      locale: updated.locale,
      source: updated.source,
      confirmedAt: updated.confirmed_at,
    },
  });

  return safeResponse("subscribed");
}
