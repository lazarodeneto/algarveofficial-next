import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Generate static params for all supported locales.
 * Ensures Next.js pre-renders all locale variants.
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

/**
 * Locale layout — authoritative locale source for all /[locale]/... routes.
 *
 * 1. Validates the [locale] URL param — 404 on unknown values
 * 2. Re-wraps children with LocaleProvider using the URL param directly.
 *    This overrides the RootLayout's header/cookie-based guess, which can
 *    be stale or wrong if the x-locale header was not set by the middleware
 *    (e.g. during static generation or edge cache hits).
 *
 * React context is tree-scoped: the nearest provider wins, so this inner
 * LocaleProvider always takes precedence over the one in RootLayout.
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  );
}
