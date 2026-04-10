import { Suspense } from "react";
import type { Metadata } from "next";

import Signup from "@/legacy-pages/auth/Signup";
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
    path: "/signup",
    title: "Sign Up",
    description:
      "Create an AlgarveOfficial account to save favourites, plan trips, and connect with listing owners.",
    noIndex: true,
  });
}

export default function LocaleSignupPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Signup />
    </Suspense>
  );
}
