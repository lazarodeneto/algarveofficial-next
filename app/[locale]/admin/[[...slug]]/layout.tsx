import type { ReactNode } from "react";

import { guardDashboardRoute } from "@/lib/server/dashboard-access";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; slug?: string[] }>;
}

export default async function LocaleAdminGuardLayout({ children, params }: LayoutProps) {
  const { locale, slug } = await params;

  await guardDashboardRoute({
    locale,
    slug,
    basePath: "/admin",
    allowedRoles: ["admin", "editor"],
  });

  return children;
}
