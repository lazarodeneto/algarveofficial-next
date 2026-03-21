import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  LOCALE_CONFIGS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";

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
 * Locale layout — SINGLE SOURCE OF TRUTH for locale.
 *
 * This layout:
 * 1. Validates the [locale] param
 * 2. Returns 404 for unsupported locales
 * 3. Passes validated locale down via props (root layout handles providers)
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  // Reject invalid locales — middleware should have redirected, but this is a safety net
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  return <>{children}</>;
}
