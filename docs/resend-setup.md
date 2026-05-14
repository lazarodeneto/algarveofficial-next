# Resend Setup

This document covers the AlgarveOfficial Resend communication setup. It does not include real secrets.

## Required Environment Variables

Set these in Vercel Production, Preview, and local development:

```dotenv
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
RESEND_REPLY_TO_EMAIL=
RESEND_NEWSLETTER_SEGMENT_ID=
RESEND_NEWSLETTER_TOPIC_ID=
RESEND_AUDIENCE_ID=
RESEND_WEBHOOK_SECRET=
NEWSLETTER_TOKEN_SECRET=
ADMIN_NOTIFICATION_EMAILS=
CONTACT_NOTIFICATION_EMAIL=
CLAIM_NOTIFICATION_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Temporary legacy aliases are still supported while older code paths are migrated:

```dotenv
EMAIL_FROM=
EMAIL_REPLY_TO=
RESEND_TRANSACTIONAL_FROM=
```

Do not prefix server-only Resend values with `NEXT_PUBLIC_`.

## Sender Strategy

All email must be sent from a verified Resend domain. The app uses:

- `RESEND_FROM_EMAIL` as the canonical sender mailbox.
- `RESEND_FROM_NAME` as the display name.
- `RESEND_REPLY_TO_EMAIL` as the default reply-to mailbox.

Recommended transactional sender:

```text
AlgarveOfficial <hello@verified-domain>
```

Recommended notifications sender:

```text
AlgarveOfficial Notifications <notifications@verified-domain>
```

User-submitted addresses must never be used as `FROM`. Use them as `replyTo` only when appropriate.

## Admin Notification Strategy

- Contact/enquiry flows use `CONTACT_NOTIFICATION_EMAIL`.
- Claim flows use `CLAIM_NOTIFICATION_EMAIL`.
- `ADMIN_NOTIFICATION_EMAILS` is the global fallback and supports comma-separated recipients.

## Resend Domain Verification

1. Add the production domain in Resend.
2. Add the DNS records Resend provides.
3. Wait until Resend shows the domain as verified.
4. Ensure `RESEND_FROM_EMAIL` uses that verified domain.
5. Use a preview-safe verified sender/domain for Vercel Preview when required.

## Newsletter Contacts, Segments, And Topics

Resend's current model should be used for newsletter marketing preferences:

1. Create a Segment for confirmed newsletter subscribers.
2. Add its ID to `RESEND_NEWSLETTER_SEGMENT_ID`.
3. Create a newsletter Topic if topic-level preferences are enabled.
4. Add its ID to `RESEND_NEWSLETTER_TOPIC_ID`.
5. Keep `RESEND_AUDIENCE_ID` only as a legacy fallback for older Resend Audience setups.

The app only syncs a contact to Resend after double opt-in confirmation. Pending subscribers remain local and are not added to marketing contacts, segments, topics, or legacy audiences.

Recommended Audience name if legacy Audiences remain enabled:

```text
AlgarveOfficial Newsletter
```

Recommended contact properties:

- `first_name`
- `locale`
- `source`
- `city`
- `listing_interest`
- `subscribed_at`
- `tier_interest`

## Webhook Setup

Add this endpoint in the Resend dashboard for each deployed environment:

```text
https://YOUR_DOMAIN.com/api/webhooks/resend
```

Enable these events where available:

- `email.sent`
- `email.delivered`
- `email.delivery_delayed`
- `email.bounced`
- `email.complained`
- `email.failed`
- `email.suppressed`
- `contact.updated`
- `contact.unsubscribed` if exposed by the dashboard

The route also accepts `email.opened` and `email.clicked` events if Resend sends them, but AlgarveOfficial should not enable tracking unless the privacy policy explicitly covers it.

Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET` in Vercel Production, Preview, and local development where webhook testing is needed. In production, unsigned webhook events are rejected.

Hard bounces, complaints, suppressions, and contact unsubscribes update local newsletter subscriber status so future marketing sends can exclude those addresses.

## Current App Architecture

Server-side email code lives in `lib/email/`:

- `email-config.ts` reads and validates server env.
- `resend-client.ts` creates the single Resend SDK client.
- `send-email.ts` validates recipients/content, sends through Resend, and records structured results.
- `email-events.ts` logs transactional attempts to Supabase.
- `templates/` contains HTML and plain-text template builders.

The current implementation sends directly through Resend and preserves the existing `external_outbox` fallback where routes already used it.

Newsletter code now includes:

- `POST /api/newsletter/subscribe` for double opt-in signup.
- `GET /api/newsletter/confirm` for confirmation.
- `GET /api/newsletter/unsubscribe` for one-click unsubscribe.
- `GET /newsletter/preferences?token=...` for token-based preference management.
- `GET /api/newsletter/preferences` and `POST /api/newsletter/preferences` for safe preference state and updates.
- `lib/email/resend-contacts.ts` for confirmed contact sync to Contacts, Segments, Topics, or legacy Audiences.
- `lib/newsletter/newsletter-tokens.ts` for HMAC-hashed confirmation and unsubscribe tokens.

Public contact, partner claim, and business claim routes use shared abuse protection with honeypot checks, hashed IP/email identifiers, and Supabase-backed rate counters.

Operational visibility is available at `/admin/communications`. The page reads sanitized data from `transactional_email_events`, `webhook_event_receipts`, `email_subscribers`, and `external_outbox` without exposing raw webhook payloads or full recipient addresses.

## Deferred To Later Phases

The following are intentionally deferred:

- Broadcast/newsletter sending.
- Further preference center expansion beyond the current newsletter topic.
- Legal/privacy approval for open/click tracking if the business chooses to enable it later.

## Manual Verification Checklist

1. Confirm all required env vars exist in Vercel Production.
2. Confirm all required env vars exist in Vercel Preview.
3. Confirm `.env.local` has the same contract for development.
4. Confirm sender and reply-to domains are verified in Resend.
5. Confirm `NEWSLETTER_TOKEN_SECRET` is set in Production and Preview.
6. Configure the Resend Segment and Topic IDs in Vercel when available.
7. Configure the Resend webhook endpoint and signing secret.
8. Test newsletter subscribe, confirm, and unsubscribe in Preview.
9. Test `/newsletter/preferences?token=...` in Preview.
10. Submit a contact form in Preview and verify admin notification delivery.
11. Submit a claim request in Preview and verify admin and claimant emails.
12. Check `transactional_email_events` for sent, failed, skipped, and webhook-updated records.
13. Check `webhook_event_receipts` for Resend webhook deliveries.
14. Check `external_outbox` only for fallback jobs when Resend is unavailable or fails.
15. Run `COMMUNICATION_SMOKE_BASE_URL=https://YOUR_PREVIEW_DOMAIN npm run smoke:communications:dry` against Preview for validation that does not send email.
