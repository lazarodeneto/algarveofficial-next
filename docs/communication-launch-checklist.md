# Communication Launch Checklist

Use this checklist before launching the Resend communication system in production.

## Pre-Deploy

1. Commit `.env.example`.
2. Confirm real env files remain ignored.
3. Apply Supabase migrations:
   - `20260514235930_create_transactional_email_events.sql`
   - `20260514235940_add_newsletter_double_opt_in.sql`
   - `20260514235950_add_communication_rate_limits.sql`
   - `20260514235960_extend_transactional_email_event_statuses.sql`
4. Verify RLS policies for communication tables.
5. Verify admin-only communication API access.
6. Verify no service-role key is exposed client-side.
7. Confirm `external_outbox` is still available for existing fallback jobs.

## Vercel Environment

Set these in Production and Preview:

1. `RESEND_API_KEY`
2. `RESEND_FROM_EMAIL`
3. `RESEND_FROM_NAME`
4. `RESEND_REPLY_TO_EMAIL`
5. `RESEND_WEBHOOK_SECRET`
6. `RESEND_NEWSLETTER_SEGMENT_ID`
7. `RESEND_NEWSLETTER_TOPIC_ID`
8. `NEWSLETTER_TOKEN_SECRET`
9. `ADMIN_NOTIFICATION_EMAILS`
10. `CONTACT_NOTIFICATION_EMAIL`
11. `CLAIM_NOTIFICATION_EMAIL`
12. `NEXT_PUBLIC_SITE_URL`

Keep transitional aliases only while legacy paths still require them:

- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `RESEND_TRANSACTIONAL_FROM`

## Resend Dashboard

1. Verify sending domain DNS.
2. Verify sender mailbox/domain.
3. Create or verify the Newsletter Segment.
4. Create or verify the Newsletter Topic.
5. Configure webhook endpoint:
   `https://YOUR_DOMAIN.com/api/webhooks/resend`
6. Enable required events:
   - `email.sent`
   - `email.delivered`
   - `email.delivery_delayed`
   - `email.bounced`
   - `email.complained`
   - `email.failed`
   - `email.suppressed`
   - contact unsubscribe/update events where available
7. Copy webhook signing secret to Vercel as `RESEND_WEBHOOK_SECRET`.
8. Confirm no marketing broadcast is sent before privacy/consent approval.

## Preview Tests

1. Newsletter subscribe.
2. Confirmation link.
3. Unsubscribe link.
4. Preference center.
5. Contact form.
6. Partner claim form.
7. Business claim flow.
8. Admin inbox notification.
9. Claim approval/rejection notification.
10. Owner/listing lifecycle notification.
11. Resend webhook test.
12. Admin communications dashboard.
13. `external_outbox` fallback inspection.
14. `npm run smoke:communications:dry` against the Preview base URL.

## Post-Launch

1. Inspect `transactional_email_events`.
2. Inspect `webhook_event_receipts`.
3. Inspect `external_outbox`.
4. Inspect failed/skipped sends.
5. Inspect bounce/complaint handling.
6. Inspect newsletter subscribers by status.
7. Check Resend suppression/unsubscribe state.
8. Confirm support/admin teams can process privacy and unsubscribe requests.
