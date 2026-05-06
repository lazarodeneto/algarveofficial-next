import * as Sentry from "@sentry/nextjs";

import { scrubSentryEvent } from "@/lib/monitoring/sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: scrubSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
