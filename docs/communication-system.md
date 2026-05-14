# AlgarveOfficial Communication System

This document describes the production communication architecture. It contains no secrets.

## Architecture Overview

All direct email sends go through the server-only email layer in `lib/email/`.

- `lib/email/email-config.ts` validates server environment values.
- `lib/email/resend-client.ts` owns the single Resend SDK client.
- `lib/email/send-email.ts` validates recipients/content, sends through Resend, and records attempts.
- `lib/email/email-events.ts` writes operational events to `transactional_email_events`.
- `lib/email/templates/` contains HTML and text transactional templates.
- `lib/communication/` wires email notifications around existing admin, owner, listing, and inbox workflows.

The app preserves `external_outbox` for existing fallback jobs. It is not removed or replaced.

## Env Contract

Required server-side variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_REPLY_TO_EMAIL`
- `RESEND_WEBHOOK_SECRET`
- `ADMIN_NOTIFICATION_EMAILS`
- `CONTACT_NOTIFICATION_EMAIL`
- `CLAIM_NOTIFICATION_EMAIL`
- `NEWSLETTER_TOKEN_SECRET`

Public site URL:

- `NEXT_PUBLIC_SITE_URL`

Newsletter targeting:

- `RESEND_NEWSLETTER_SEGMENT_ID`
- `RESEND_NEWSLETTER_TOPIC_ID`
- `RESEND_AUDIENCE_ID` as legacy fallback only

Transitional aliases:

- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `RESEND_TRANSACTIONAL_FROM`

## Sender Strategy

Use a verified Resend domain for `RESEND_FROM_EMAIL`. User-submitted emails are never used as `FROM`; they are only used as `replyTo` when appropriate.

## Newsletter Flow

`POST /api/newsletter/subscribe` stores a pending subscriber and sends a confirmation email. Pending subscribers are not synced to Resend marketing contacts.

`GET /api/newsletter/confirm` verifies the token hash, subscribes the user, syncs the confirmed subscriber to Resend Contacts/Segments/Topics, and sends a welcome email.

`GET /api/newsletter/unsubscribe` verifies the unsubscribe token hash, marks the subscriber unsubscribed locally, and updates Resend where configured.

`GET /newsletter/preferences?token=...` shows the token-based preference center without exposing the subscriber email.

`GET /api/newsletter/preferences` returns safe preference state for the preference center.

`POST /api/newsletter/preferences` updates local subscription status and syncs Resend Topic/contact state where configured.

## Contact And Enquiry Flow

`POST /api/enquiries` validates and stores the message in `chat_threads` / `chat_messages`, sends the admin notification, sends a user confirmation, and now notifies the listing owner when the message belongs to an owner-managed listing.

If Resend sending fails, saved messages are preserved and existing outbox fallback remains available where already used.

## Business Claim Flow

Structured business claims use `business_claims` and the existing review RPC. Submission, approval, rejection, and needs-more-info emails are handled through the central email wrapper.

## Partner Claim Flow

Partner claims use `listing_claims`. Submission emails use the central wrapper. Claim approval/rejection notifications are now sent around existing admin actions and the approval assignment flow.

## Admin Inbox Notifications

Admin inbox aggregation remains read-only and unchanged. Notification hooks are added only around write events:

- Admin replies in `app/api/admin/chat/message/route.ts`
- Inbox listing moderation approve/reject actions
- Inbox listing claim rejection
- Owner listing contact received

All notification failures are non-blocking.

## Owner And Listing Lifecycle Notifications

Owner/listing lifecycle notification helpers live in `lib/communication/listing-notifications.ts`.

Current wired events:

- Listing status changed
- Listing tier changed
- Listing contact received
- Listing update submitted for admin review
- Listing update approved/rejected
- Partner listing claim approved/rejected

## Webhook Flow

`POST /api/webhooks/resend` verifies Resend webhook signatures, records idempotent receipts in `webhook_event_receipts`, updates `transactional_email_events`, and suppresses newsletter subscribers on bounces, complaints, failures, suppressions, and unsubscribe events.

Open/click events are handled passively only. Do not enable open/click tracking until the privacy policy explicitly covers it.

## Abuse Protection

`lib/security/form-abuse-protection.ts` provides honeypot checks, hashed IP/email identifiers, user-agent hashing, cooldown windows, and Supabase-backed counters.

Protected public routes:

- newsletter subscribe
- contact/enquiry
- partner claim
- business claim

## Admin Visibility

`/admin/communications` and `GET /api/admin/communications` expose sanitized diagnostics:

- recent transactional email events
- failed/skipped/bounced/suppressed email sends
- Resend webhook receipts
- newsletter subscriber counts and recent masked subscribers
- external outbox counts and open alert count

Recipients are masked and raw webhook payloads are not exposed.

## Database Tables And Migrations

Core communication tables:

- `transactional_email_events`
- `webhook_event_receipts`
- `email_subscribers`
- `communication_rate_limits`
- `chat_threads`
- `chat_messages`
- `business_claims`
- `listing_claims`
- `external_outbox`
- `admin_external_outbox_health`

Recent communication migrations:

- `20260514235930_create_transactional_email_events.sql`
- `20260514235940_add_newsletter_double_opt_in.sql`
- `20260514235950_add_communication_rate_limits.sql`
- `20260514235960_extend_transactional_email_event_statuses.sql`

## Production Checklist

1. Apply the communication migrations.
2. Confirm `.env.example` is tracked while real env files remain ignored.
3. Add the Resend and newsletter env vars in Vercel Production and Preview.
4. Configure the Resend Segment and Topic IDs.
5. Configure the Resend webhook endpoint.
6. Test newsletter subscribe, confirm, and unsubscribe in Preview.
7. Test contact and claim forms in Preview.
8. Test admin inbox reply notifications.
9. Test listing claim approval/rejection notifications.
10. Inspect `transactional_email_events`.
11. Inspect `webhook_event_receipts`.
12. Inspect `external_outbox` and `admin_external_outbox_health`.

## Deferred Items

- Final decision on open/click tracking and privacy policy language.
- Supabase Edge Function source restoration or formal deprecation for `external_outbox` processing.
- Live Preview smoke checks must be run manually with `COMMUNICATION_SMOKE_BASE_URL=https://YOUR_PREVIEW_DOMAIN npm run smoke:communications:dry`.
