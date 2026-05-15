import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email/send-email";
import { newsletterConfirmationTemplate } from "@/lib/email/templates/newsletter-confirmation";
import {
  createConfirmationToken,
  createUnsubscribeToken,
} from "@/lib/newsletter/newsletter-tokens";
import {
  enforceFormAbuseProtection,
  extractFormAbuseFields,
} from "@/lib/security/form-abuse-protection";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_NEWSLETTER_MESSAGE = "If this email can be subscribed, we’ll send a confirmation link.";
const CONFIRMATION_COOLDOWN_MS = 15 * 60 * 1000;

const subscribeSchema = z.object({
  email: z.string().trim().email().max(255),
  fullName: z.string().trim().max(160).optional().nullable(),
  locale: z.string().trim().max(16).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
  source_url: z.string().trim().url().max(500).optional().nullable(),
  sourceUrl: z.string().trim().url().max(500).optional().nullable(),
  honeypot: z.string().trim().max(500).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
  submittedAt: z.union([z.number(), z.string()]).optional().nullable(),
});

interface SubscriberRow {
  id: string;
  email: string;
  full_name: string | null;
  status: string | null;
  is_subscribed: boolean;
  confirmation_token_hash: string | null;
  unsubscribe_token_hash: string | null;
  last_confirmation_sent_at: string | null;
  created_at: string;
}

const SUBSCRIBER_SELECT = [
  "id",
  "email",
  "full_name",
  "status",
  "is_subscribed",
  "confirmation_token_hash",
  "unsubscribe_token_hash",
  "last_confirmation_sent_at",
  "created_at",
].join(", ");

function genericResponse(status = 200) {
  return NextResponse.json({
    ok: true,
    message: GENERIC_NEWSLETTER_MESSAGE,
  }, { status });
}

function validationResponse() {
  return NextResponse.json({
    ok: false,
    error: {
      code: "NEWSLETTER_INVALID_EMAIL",
      message: "Please enter a valid email address.",
    },
  }, { status: 400 });
}

function cleanOptional(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function confirmationUrl(request: NextRequest, token: string) {
  const url = new URL("/api/newsletter/confirm", request.url);
  url.searchParams.set("token", token);
  return url.toString();
}

function shouldSendConfirmation(existing: SubscriberRow | null) {
  if (!existing) return true;
  const status = existing.status ?? (existing.is_subscribed ? "subscribed" : "unsubscribed");
  if (status === "subscribed" || status === "bounced" || status === "complained" || status === "failed") return false;
  if (!existing.last_confirmation_sent_at) return true;
  return Date.now() - Date.parse(existing.last_confirmation_sent_at) > CONFIRMATION_COOLDOWN_MS;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      ok: false,
      error: { code: "INVALID_JSON", message: "Request body must be valid JSON." },
    }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return validationResponse();
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return NextResponse.json({
      ok: false,
      error: { code: "SERVICE_ROLE_NOT_CONFIGURED", message: "Newsletter storage is not configured." },
    }, { status: 503 });
  }

  const payload = parsed.data;
  const email = payload.email.toLowerCase();
  const abuseFields = extractFormAbuseFields(body);
  const abuse = await enforceFormAbuseProtection({
    request,
    client: writeClient,
    scope: "newsletter_subscribe",
    email,
    honeypot: payload.honeypot ?? payload.website ?? abuseFields.honeypot,
    submittedAt: payload.submittedAt ?? abuseFields.submittedAt,
    maxAttempts: 6,
    windowSeconds: 60 * 60,
  });

  if (!abuse.allowed) {
    return genericResponse();
  }

  const source = cleanOptional(payload.source) ?? "newsletter";
  const sourceUrl = cleanOptional(payload.source_url ?? payload.sourceUrl);
  const locale = cleanOptional(payload.locale);

  const { data: existingData, error: lookupError } = await writeClient
    .from("email_subscribers" as never)
    .select(SUBSCRIBER_SELECT)
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({
      ok: false,
      error: { code: "NEWSLETTER_LOOKUP_FAILED", message: "Newsletter signup could not be processed." },
    }, { status: 500 });
  }

  const existing = existingData as SubscriberRow | null;
  const sendConfirmation = shouldSendConfirmation(existing);
  const now = new Date().toISOString();
  let subscriber = existing;
  let confirmationToken: string | null = null;

  if (sendConfirmation) {
    const confirmation = createConfirmationToken();
    const unsubscribe = existing?.unsubscribe_token_hash ? null : createUnsubscribeToken();
    confirmationToken = confirmation.token;

    const values = {
      email,
      full_name: cleanOptional(payload.fullName),
      is_subscribed: false,
      status: "pending",
      confirmation_token_hash: confirmation.tokenHash,
      unsubscribe_token_hash: existing?.unsubscribe_token_hash ?? unsubscribe?.tokenHash ?? null,
      last_confirmation_sent_at: now,
      unsubscribed_at: null,
      source,
      source_url: sourceUrl,
      locale,
      ip_hash: abuse.ipHash,
      user_agent_hash: abuse.userAgentHash,
      subscribed_at: existing?.created_at ?? now,
      metadata: {
        last_signup_source: source,
      },
      updated_at: now,
    };

    const query = existing
      ? writeClient
        .from("email_subscribers" as never)
        .update(values as never)
        .eq("id", existing.id)
        .select(SUBSCRIBER_SELECT)
        .single()
      : writeClient
        .from("email_subscribers" as never)
        .insert(values as never)
        .select(SUBSCRIBER_SELECT)
        .single();

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({
        ok: false,
        error: { code: "NEWSLETTER_SAVE_FAILED", message: "Newsletter signup could not be processed." },
      }, { status: 500 });
    }
    subscriber = data as SubscriberRow;
  }

  if (sendConfirmation && confirmationToken && subscriber) {
    const content = newsletterConfirmationTemplate({
      confirmationUrl: confirmationUrl(request, confirmationToken),
    });

    await sendEmail({
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
      templateKey: "newsletter_confirmation",
      relatedEntityType: "newsletter_subscriber",
      relatedEntityId: subscriber.id,
      idempotencyKey: `newsletter/${subscriber.id}/confirmation/${subscriber.confirmation_token_hash?.slice(0, 16) ?? "token"}`,
      metadata: { source, locale, sourceUrl },
      tags: [
        { name: "template", value: "newsletter_confirmation" },
        { name: "source", value: "newsletter" },
      ],
    });
  }

  return genericResponse(202);
}
