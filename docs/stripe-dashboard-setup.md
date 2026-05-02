# Stripe Dashboard Setup — ALGARVEOFFICIAL.COM

Manual configuration required in the Stripe Dashboard. Do this once per environment (test + live).

---

## 1. Business name & statement descriptor

Dashboard → Settings → Business details:

| Field | Value |
|---|---|
| Business name | `ALGARVEOFFICIAL.COM` |
| Statement descriptor | `ALGARVEOFFICIAL` |

The statement descriptor must be 5–22 characters, ASCII only. It appears on customer bank statements.

---

## 2. Branding (checkout + portal)

Dashboard → Settings → Branding:

- Upload your logo.
- Set brand color to match the platform.
- Set icon for invoices.

This branding carries into hosted checkout pages, invoice PDFs, and the billing portal.

---

## 3. Product names

Each Stripe Price must belong to a Product with "ALGARVEOFFICIAL.COM" in the name.

Recommended naming:

| Plan | Product name |
|---|---|
| Verified Monthly | `ALGARVEOFFICIAL.COM Verified — Monthly` |
| Verified Yearly | `ALGARVEOFFICIAL.COM Verified — Yearly` |
| Verified Fixed 2026 | `ALGARVEOFFICIAL.COM Verified — 2026 Fixed Access` |
| Signature Monthly | `ALGARVEOFFICIAL.COM Signature — Monthly` |
| Signature Yearly | `ALGARVEOFFICIAL.COM Signature — Yearly` |
| Signature Fixed 2026 | `ALGARVEOFFICIAL.COM Signature — 2026 Fixed Access` |

After creating products and prices, copy each `price_XXXX` ID into
`subscription_pricing.stripe_price_id` via the admin pricing API.

---

## 4. Billing portal

Dashboard → Settings → Customer portal:

- Enable the portal.
- Allow customers to: update payment method, cancel subscriptions, view invoice history.
- Set "Return URL" to `https://algarveofficial.com/owner/membership` (live) or your dev URL.

The portal is accessed by users via `POST /api/stripe/billing-portal`.

---

## 5. Webhook endpoints

Dashboard → Developers → Webhooks → Add endpoint.

### Local development
Use Stripe CLI:
```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the printed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Vercel Preview
- Endpoint URL: `https://<preview-host>/api/stripe/webhook`
- Copy `whsec_...` into Vercel Preview env as `STRIPE_WEBHOOK_SECRET`.

### Production
- Endpoint URL: `https://algarveofficial.com/api/stripe/webhook`
- Copy `whsec_...` into Vercel Production env as `STRIPE_WEBHOOK_SECRET`.

**Each environment needs its own webhook endpoint with its own secret.**

### Events to subscribe to (select all):
```
checkout.session.completed
checkout.session.expired
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.trial_will_end
invoice.paid
invoice.payment_succeeded
invoice.payment_failed
invoice.finalized
```

---

## 6. Cron job (reconciliation)

The reconciliation endpoint `POST /api/cron/reconcile-subscriptions` is protected
by `x-cron-secret` matching the `CRON_SECRET` environment variable.

### Vercel Cron (recommended)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-subscriptions",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Vercel Cron calls with the `Authorization: Bearer <CRON_SECRET>` header. Update
`verifyCronSecret` in the route if you use Vercel's header format instead.

### External scheduler

Send:
```
POST https://algarveofficial.com/api/cron/reconcile-subscriptions
x-cron-secret: <CRON_SECRET>
```

---

## 7. Environment variables summary

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → endpoint signing secret |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |
| `REVALIDATE_SECRET` | Generate: `openssl rand -hex 32`; protects `/api/revalidate` |
| `PREVIEW_SECRET` | Generate: `openssl rand -hex 32`; protects CMS preview mode |

Use `sk_test_` / `pk_test_` on Preview; `sk_live_` / `pk_live_` on Production only.

---

## 8. Live key rotation reminder

If a secret key is ever exposed (e.g. pasted in chat, committed to git):

1. Dashboard → Developers → API keys → Roll key immediately.
2. Update the env var in Vercel / `.env.local`.
3. Restart the local dev server if running.
