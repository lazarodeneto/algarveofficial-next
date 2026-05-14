import { NextRequest } from "next/server";

import { markNewsletterContactUnsubscribed } from "@/lib/email/resend-contacts";
import { hashNewsletterToken } from "@/lib/newsletter/newsletter-tokens";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscriberRow {
  id: string;
  email: string;
}

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

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return htmlPage("Subscription updated", "If this unsubscribe link was valid, the subscription has been updated.");
  }

  const writeClient = createServiceRoleClient();
  if (!writeClient) {
    return htmlPage("Newsletter unavailable", "Newsletter preferences are temporarily unavailable.", 503);
  }

  const tokenHash = hashNewsletterToken(token);
  const { data } = await writeClient
    .from("email_subscribers" as never)
    .select("id, email")
    .eq("unsubscribe_token_hash", tokenHash)
    .maybeSingle();

  const subscriber = data as SubscriberRow | null;
  if (subscriber) {
    const now = new Date().toISOString();
    await writeClient
      .from("email_subscribers" as never)
      .update({
        status: "unsubscribed",
        is_subscribed: false,
        unsubscribed_at: now,
        updated_at: now,
      } as never)
      .eq("id", subscriber.id);

    const sync = await markNewsletterContactUnsubscribed(subscriber.email);
    await writeClient
      .from("email_subscribers" as never)
      .update({
        resend_sync_status: sync.status,
        resend_synced_at: sync.success ? now : null,
        updated_at: now,
      } as never)
      .eq("id", subscriber.id);
  }

  return htmlPage("Subscription updated", "Your AlgarveOfficial newsletter subscription preferences have been updated.");
}
