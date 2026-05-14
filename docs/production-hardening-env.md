# Production Hardening Environment Checklist

Use this checklist in Vercel without copying secret values into tickets, chat, or logs.

## Required Environment Variables

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Production should be `https://algarveofficial.com`; preview should use the preview host. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Must point to the intended Supabase project for the environment. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key only; never use a service role value here. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Required by admin write routes and server-side jobs. |
| `STRIPE_SECRET_KEY` | Server-only | Use test key in preview/staging and live key in production. |
| `STRIPE_WEBHOOK_SECRET` | Server-only | Must be the signing secret for that exact environment's webhook endpoint. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Use the matching test/live publishable key for the environment. |
| `RESEND_API_KEY` | Server-only | Required only for environments that send email. |
| `RESEND_FROM_EMAIL` | Server-only | Canonical verified sender mailbox. |
| `RESEND_FROM_NAME` | Server-only | Sender display name, usually `AlgarveOfficial`. |
| `RESEND_REPLY_TO_EMAIL` | Server-only | Canonical default reply-to mailbox. |
| `ADMIN_NOTIFICATION_EMAILS` | Server-only | Comma-separated global admin notification fallback. |
| `CONTACT_NOTIFICATION_EMAIL` | Server-only | Recipient for contact/enquiry notifications. |
| `CLAIM_NOTIFICATION_EMAIL` | Server-only | Recipient for business/listing claim notifications. |
| `RESEND_NEWSLETTER_SEGMENT_ID` | Server-only | Preferred Resend Segment target for confirmed newsletter contacts. |
| `RESEND_NEWSLETTER_TOPIC_ID` | Server-only | Preferred Resend Topic target for newsletter preference handling. |
| `RESEND_AUDIENCE_ID` | Server-only | Legacy fallback only if Resend Audiences are still used. |
| `RESEND_WEBHOOK_SECRET` | Server-only | Required when the Resend webhook route is enabled. |
| `NEWSLETTER_TOKEN_SECRET` | Server-only | Required in production for double opt-in and unsubscribe token hashing. |
| `COMMUNICATION_SMOKE_BASE_URL` | Local/CI optional | Optional base URL for `npm run smoke:communications`; do not store secrets here. |
| `COMMUNICATION_SMOKE_TEST_EMAIL` | Local/CI optional | Optional safe recipient only used when `SEND_TEST_EMAIL=true`. |
| `DRY_RUN` | Local/CI optional | Defaults to true for communication smoke checks. Set `DRY_RUN=false` only with an explicit safe test email. |
| `EMAIL_FROM` | Server-only | Transitional alias only; keep matching `RESEND_FROM_EMAIL` until legacy paths are removed. |
| `EMAIL_REPLY_TO` | Server-only | Transitional alias only; keep matching `RESEND_REPLY_TO_EMAIL` until legacy paths are removed. |
| `RESEND_TRANSACTIONAL_FROM` | Server-only | Transitional alias only; keep matching `RESEND_FROM_EMAIL` until legacy paths are removed. |
| `CRON_SECRET` | Server-only | Protects scheduled operational endpoints. |
| `REVALIDATE_SECRET` | Server-only | Protects on-demand cache revalidation. |
| `PREVIEW_SECRET` | Server-only | Protects CMS preview URLs. |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Public browser DSN for Sentry client error capture. |
| `SENTRY_DSN` | Server-only | Server-side Sentry DSN. |
| `SENTRY_ORG` | Server-only | Required only for source-map upload configuration. |
| `SENTRY_PROJECT` | Server-only | Required only for source-map upload configuration. |
| `SENTRY_AUTH_TOKEN` | Server-only | Required only if source-map upload is enabled. |

## Sentry Notes

- Source-map upload is disabled in code until the project owner confirms the Sentry org/project/token policy.
- `sendDefaultPii` is disabled, and the event scrubber removes cookies, request headers, auth tokens, API keys, service-role identifiers, Stripe signatures, and common secret fields.
- Configure dashboard alerts for new production server errors, Stripe webhook failures, and sustained client error spikes.

## DNS Notes

- Confirm Resend SPF/DKIM records inside the Resend dashboard for the exact sending domain or subdomain.
- Confirm DMARC policy is intentionally configured before launch; `p=none` is monitoring-only.
