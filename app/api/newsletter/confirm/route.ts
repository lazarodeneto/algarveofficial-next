import { NextRequest } from "next/server";

import { syncNewsletterSubscriberToResend } from "@/lib/email/resend-contacts";
import { sendEmail } from "@/lib/email/send-email";
import { newsletterWelcomeTemplate } from "@/lib/email/templates/newsletter-welcome";
import {
  createUnsubscribeToken,
  hashNewsletterToken,
  isConfirmationTokenExpired,
} from "@/lib/newsletter/newsletter-tokens";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscriberRow {
  id: string;
  email: string;
  full_name: string | null;
  status: string | null;
  confirmation_token_hash: string | null;
  unsubscribe_token_hash: string | null;
  last_confirmation_sent_at: string | null;
  locale: string | null;
  source: string | null;
  confirmed_at: string | null;
  welcome_sent_at: string | null;
}

const SUBSCRIBER_SELECT = [
  "id",
  "email",
  "full_name",
  "status",
  "confirmation_token_hash",
  "unsubscribe_token_hash",
  "last_confirmation_sent_at",
  "locale",
  "source",
  "confirmed_at",
  "welcome_sent_at",
].join(", ");

function htmlPage(title: string, body: string, status = 200) {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;background:#f8f5ef;color:#111827;margin:0;display:grid;min-height:100vh;place-items:center;padding:24px}
    main{max-width:620px;background:#fff;border:1px solid #e6ddcf;border-radius:18px;padding:32px;box-shadow:0 18px 60px rgba(17,24,39,.08)}
    h1{font-family:Georgia,serif;font-size:32px;line-height:1.1;margin:0 0 12px}
    p{line-height:1.65;color:#475569}
    a{color:#047857;font-weight:700}
  </style>
</head>
<body><main><h1>${title}</h1><p>${body}</p><p><a href="/">Return to AlgarveOfficial</a></p></main></body>
</html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function unsubscribeUrl(request: NextRequest, token: string) {
  const url = new URL("/api/newsletter/unsubscribe", request.url);
  url.searchParams.set("token", token);
  return url.toString();
}

function preferencesUrl(request: NextRequest, token: string) {
  const url = new URL("/newsletter/preferences", request.url);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return htmlPage("Confirmation link invalid", "This newsletter confirmation link is missing or invalid.", 400);
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return htmlPage("Newsletter unavailable", "Newsletter confirmation is temporarily unavailable.", 503);
  }

  const tokenHash = hashNewsletterToken(token);
  const { data, error } = await writeClient
    .from("email_subscribers" as never)
    .select(SUBSCRIBER_SELECT)
    .eq("confirmation_token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return htmlPage("Confirmation link invalid", "This link is invalid or has already been used.", 400);
  }

  const subscriber = data as SubscriberRow;
  if (subscriber.status === "subscribed") {
    return htmlPage("Subscription already confirmed", "Your AlgarveOfficial newsletter subscription is already active.");
  }

  if (subscriber.status !== "pending" || isConfirmationTokenExpired(subscriber.last_confirmation_sent_at)) {
    return htmlPage("Confirmation link expired", "This confirmation link has expired. Please subscribe again to receive a new link.", 400);
  }

  const unsubscribe = createUnsubscribeToken();
  const now = new Date().toISOString();
  const { data: updatedData, error: updateError } = await writeClient
    .from("email_subscribers" as never)
    .update({
      status: "subscribed",
      is_subscribed: true,
      confirmed_at: subscriber.confirmed_at ?? now,
      subscribed_at: now,
      confirmation_token_hash: null,
      unsubscribe_token_hash: unsubscribe.tokenHash,
      unsubscribed_at: null,
      updated_at: now,
    } as never)
    .eq("id", subscriber.id)
    .select(SUBSCRIBER_SELECT)
    .single();

  if (updateError || !updatedData) {
    return htmlPage("Confirmation failed", "Newsletter confirmation could not be completed. Please try again later.", 500);
  }

  const updated = updatedData as SubscriberRow;
  await syncNewsletterSubscriberToResend({
    client: writeClient,
    subscriber: {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      locale: updated.locale,
      source: updated.source,
      confirmedAt: updated.confirmed_at,
    },
  });

  if (!updated.welcome_sent_at) {
    const content = newsletterWelcomeTemplate({
      preferencesUrl: preferencesUrl(request, unsubscribe.token),
      unsubscribeUrl: unsubscribeUrl(request, unsubscribe.token),
    });

    const welcome = await sendEmail({
      to: updated.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
      templateKey: "newsletter_welcome",
      relatedEntityType: "newsletter_subscriber",
      relatedEntityId: updated.id,
      idempotencyKey: `newsletter/${updated.id}/welcome`,
      metadata: { locale: updated.locale, source: updated.source },
      tags: [
        { name: "template", value: "newsletter_welcome" },
        { name: "source", value: "newsletter" },
      ],
    });

    if (welcome.success || welcome.skipped) {
      await writeClient
        .from("email_subscribers" as never)
        .update({ welcome_sent_at: now, updated_at: now } as never)
        .eq("id", updated.id);
    }
  }

  return htmlPage("Subscription confirmed", "Your AlgarveOfficial newsletter subscription is confirmed. Thank you for joining.");
}
