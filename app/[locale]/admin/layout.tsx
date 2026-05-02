import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : ("en" as Locale);

  return buildLocalizedMetadata({
    locale,
    path: "/admin",
    title: "Admin Dashboard",
    description: "AlgarveOfficial administration area.",
    noIndex: true,
  });
}

export default async function LocaleAdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";

  await guardDashboardRoute({
    locale,
    basePath: "/admin",
    allowedRoles: ["admin", "editor"],
  });

  return <AdminShell>{children}</AdminShell>;
}
