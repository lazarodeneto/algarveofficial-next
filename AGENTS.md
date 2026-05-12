# AlgarveOfficial Agent Instructions

These instructions are project-specific guidance for Codex and other coding agents working in this repository.

## Project Shape

- AlgarveOfficial is a production Next.js App Router application using React, TypeScript, Supabase, React Query, Stripe, and i18n.
- Routes live under `app/`, with both unprefixed routes and locale-prefixed routes such as `app/[locale]/...`.
- Public listing detail pages live at `app/listing/[id]/page.tsx` and `app/[locale]/listing/[id]/page.tsx`, with the main client experience in `components/listing/ListingDetailClient.tsx`.
- Public pages may also use legacy page components under `legacy-pages/`.

## Important Directories

- `app/`: Next.js App Router pages, layouts, and API routes.
- `components/`: Shared UI, listing, admin, owner, layout, and feature components.
- `contexts/`: App-level React contexts such as authentication.
- `hooks/`: React Query hooks and client-side feature logic.
- `integrations/supabase/`: Supabase clients and generated database types.
- `legacy-pages/`: Existing page implementations still routed by App Router wrappers.
- `lib/`: Server helpers, admin logic, CMS logic, subscriptions, validation, utilities, and domain services.
- `supabase/migrations/`: Database migrations. Use migrations for schema changes.
- `i18n/locales/`: Translation JSON files.
- `tests/`: Playwright and other test coverage where present.

## Listing System

- The canonical listing model is the Supabase `listings` table, typed in `integrations/supabase/types.ts`.
- Do not introduce a second listing model or parallel listing storage.
- Relevant listing fields include `owner_id`, `status`, `tier`, `published_at`, `admin_notes`, `rejection_notes`, `rejection_reason`, `is_curated`, contact fields, location fields, social links, and review metadata.
- Listing statuses include `draft`, `pending_review`, `published`, `rejected`, and `archived`.
- Listing tiers include `unverified`, `verified`, and `signature`.
- Never break existing public listing pages or their localized route behavior.

## Auth, Roles, Admin, And Owner Areas

- Client auth state is managed in `contexts/AuthContext.tsx` with Supabase Auth.
- Server-side admin and owner APIs should use the existing server auth helpers and patterns under `lib/server/`.
- User roles are stored through the existing roles model and RPCs such as `get_user_role` / `has_role`.
- Admin dashboard routing is handled by `components/routes/AdminDashboardPage.tsx` and admin route files under `app/admin` and `app/[locale]/admin`.
- Owner dashboard routing is handled by `components/routes/OwnerDashboardPage.tsx` and owner route files under `app/owner` and `app/[locale]/owner`.
- Use `/owner` for business owners. Do not send business owners into `/admin`.
- Protect owner routes with authentication and ownership checks.
- Protect admin claim review routes with admin/editor checks.

## Business Claims

- Every business claim request must link to exactly one existing `listing_id`.
- Keep public claim intake separate from internal admin review.
- Do not send messy unstructured messages to the admin dashboard when structured claim fields are needed.
- Existing claim-related code includes `listing_claims`, `hooks/useListingClaims.ts`, `app/api/partner/claims/route.ts`, `legacy-pages/public/Partner.tsx`, `legacy-pages/admin/AdminClaims.tsx`, and `components/admin/ApproveAssignDialog.tsx`.
- If claim schema changes are needed, add a safe migration and update types. Do not use destructive migrations.
- Do not expose draft, private, or admin-only claim data to public users.

## Database And Supabase

- Use `supabase/migrations/` for database changes.
- Do not add destructive migrations unless explicitly requested and reviewed.
- Do not disable RLS as a shortcut. Follow the existing RLS and server-side API patterns.
- Do not create duplicate Supabase clients. Reuse clients and helpers from `integrations/supabase/` and `lib/server/`.
- Do not expose service-role secrets or privileged data to browser code.
- Prefer server-side API routes for privileged admin and owner writes.

## UI And Components

- Reuse existing UI components and visual patterns from `components/`.
- Use existing admin and owner shells; do not remove or replace dashboard layouts.
- Use existing toast/notification patterns, including `sonner` where already used.
- Use `lucide-react` icons when an icon is needed.
- Keep changes modular and scoped to the feature.
- Do not rewrite the whole app.

## Validation And Forms

- Use Zod for request and form validation.
- Reuse existing form patterns from `components/ui/form.tsx`, React Hook Form usage, and domain schemas under `lib/forms/` where applicable.
- Normalize empty strings to `null` for optional persisted fields when that matches existing API behavior.
- Return structured API validation errors rather than silently accepting invalid input.

## Stripe And Subscriptions

- Stripe checkout lives under `app/api/stripe/checkout/route.ts`.
- Stripe webhooks live under `app/api/stripe/webhook/route.ts`.
- Subscription state is owner-based through existing subscription tables and helpers under `lib/subscriptions/`.
- Existing tiers are `unverified`, `verified`, and `signature`.
- Do not create a second subscription system.
- If business claims need payments, use additive metadata such as `claim_id` and `listing_id` while preserving existing webhook behavior.

## Commands

- Development server: `npm run dev`
- Lint app routes: `npm run lint`
- Lint all files: `npm run lint:all`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Standard check: `npm run check`
- Validate: `npm run validate`
- Unit/runtime tests: `npm run test`
- Contract tests: `npm run test:contracts`
- E2E tests: `npm run test:e2e`
- Translation checks: `npm run i18n:check`, `npm run check:i18n`

## Future Work Rules

- Never rewrite the whole app.
- Never create duplicate auth, admin, database, Supabase, listing, Stripe, or subscription systems.
- Never introduce a second listing model.
- Never break existing listing pages.
- Always link business claims to an existing `listing_id`.
- Keep public claim flow separate from internal admin flow.
- Use `/owner` for business owners, not `/admin`.
- Use migrations for database changes.
- Do not add destructive migrations.
- Do not expose admin-only data to public users.
- Protect owner routes with auth and ownership checks.
- Protect admin claim review routes with admin checks.
- Respect existing route conventions for localized and unlocalized paths.
- Keep public reads limited to published/public-safe data.
- Add or update targeted tests when changing business logic.
