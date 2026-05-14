# Email Privacy Review Checklist

This checklist is for AlgarveOfficial business/admin review before marketing launch. It is not legal advice.

## Newsletter Consent

- Double opt-in is enabled for newsletter signup.
- Confirmation timestamp is stored before a subscriber is treated as subscribed.
- Signup source, source URL, locale, IP hash, and user-agent hash are stored for auditability where available.
- Unsubscribe is available from newsletter/welcome emails.
- A token-based preference center is available at `/newsletter/preferences?token=...`.
- Marketing contacts are not synced to Resend until confirmation.
- Do not start newsletter broadcasts until consent copy and privacy policy language are approved.

## Transactional Emails

- Contact form confirmations are transactional and tied to a user-submitted message.
- Claim confirmations are transactional and tied to a submitted claim request.
- Owner/admin notifications are transactional and tied to platform operations.
- User-submitted email addresses are only used as reply-to values, never as sender addresses.
- Transactional send attempts are recorded in `transactional_email_events`.

## Tracking

- Open/click tracking should remain disabled unless the privacy policy explicitly explains it.
- If open/click tracking is enabled later, update the privacy policy before enabling it in Resend.
- The webhook route can handle open/click events passively, but the business must decide whether tracking is appropriate.

## Data Retention

Review and document retention periods for:

- Contact messages and enquiries.
- Business and listing claim requests.
- Transactional email events.
- Resend webhook receipts.
- `external_outbox` fallback records.
- Newsletter subscriber records, including unsubscribed, bounced, and complained states.

## User Rights

Confirm public instructions exist for:

- Newsletter unsubscribe.
- Data deletion requests.
- Data correction requests.
- Marketing consent withdrawal.
- Privacy contact channel and expected handling process.

## Manual Review Required

- Privacy policy.
- Cookie policy.
- Terms of service.
- Newsletter consent copy.
- Contact and claim form consent/notice copy.
- Resend processor/subprocessor position.
- Vercel and Supabase data processing positions.
- Any cross-border transfer language required for the business.

## Launch Warning

Do not send marketing broadcasts until the privacy policy, consent copy, unsubscribe flow, and preference center have been reviewed and approved by the business/legal owner.
