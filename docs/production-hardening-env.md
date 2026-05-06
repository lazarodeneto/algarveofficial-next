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
| `EMAIL_FROM` | Server-only | Default sender should be `info@algarveofficial.com`. |
| `EMAIL_REPLY_TO` | Server-only | Default reply-to should be `info@algarveofficial.com`. |
| `RESEND_ALLOWED_SENDER_DOMAINS` | Server-only | Recommended: `algarveofficial.com`. |
| `EMAIL_ALLOWED_SENDER_DOMAINS` | Server-only | Recommended: `algarveofficial.com`. |
| `RESEND_AUDIENCE_ID` | Server-only | Required only if Resend Audiences are used. |
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
