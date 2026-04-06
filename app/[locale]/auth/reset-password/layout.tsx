import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return buildLocalizedMetadata({
    locale,
    path: "/auth/reset-password",
    title: "Reset Password",
    description: "Set a new password for your AlgarveOfficial account.",
    noIndex: true,
    follow: false,
  });
}

export default function AuthResetPasswordLayout({ children }: LayoutProps) {
  return children;
}
