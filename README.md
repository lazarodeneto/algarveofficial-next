# AlgarveOfficial Next.js

Production site for AlgarveOfficial, built with Next.js App Router, Supabase, and React Query.

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project with the expected schema and edge functions

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values.

```bash
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for admin translation sync writes)
- `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Pre-Live Smoke Gate

Run the production smoke gate locally:

```bash
npm run build
E2E_USER_EMAIL="your-email" E2E_USER_PASSWORD="your-password" npm run test:e2e:smoke
```

This Playwright smoke test validates:
- Home page is reachable and not in maintenance mode
- Login succeeds
- Protected dashboard is visible after authentication
- No runtime console errors or API 5xx responses in the critical path

For GitHub Actions, configure repository secrets:
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

## Production Build & Start

```bash
npm run build
npm run start
```

## Deployment (Vercel)

- Connect the repo to Vercel.
- Set all required environment variables from `.env.example`.
- Keep the production domain in Vercel project settings.
- Verify `robots.txt`, `sitemap.xml`, and security headers after each deploy.

## Operations Notes

- Admin, owner, and dashboard routes are intentionally `noindex`.
- Unknown routes return proper 404s (no fallback migration page).
- Locale-prefixed legacy paths currently redirect to unprefixed routes.
