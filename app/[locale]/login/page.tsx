import { Suspense } from "react";
import type { Metadata } from "next";

import Login from "@/legacy-pages/auth/Login";
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
    path: "/login",
    title: "Log In",
    description: "Access your AlgarveOfficial account to manage favourites, trips, listings, and messages.",
    noIndex: true,
  });
}

export default function LoginPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Login />
    </Suspense>
  );
}
