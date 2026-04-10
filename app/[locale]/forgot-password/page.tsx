import { Suspense } from "react";
import type { Metadata } from "next";

import ForgotPassword from "@/legacy-pages/auth/ForgotPassword";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/forgot-password",
    title: "Forgot Password",
    description: "Reset your AlgarveOfficial account password.",
    noIndex: true,
  });
}

export default function LocaleForgotPasswordPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ForgotPassword />
    </Suspense>
  );
}
