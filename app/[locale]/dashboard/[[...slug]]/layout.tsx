import type { ReactNode } from "react";

import { guardDashboardRoute } from "@/lib/server/dashboard-access";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; slug?: string[] }>;
}

export default async function LocaleDashboardGuardLayout({ children, params }: LayoutProps) {
  const { locale, slug } = await params;

  await guardDashboardRoute({
    locale,
    slug,
    basePath: "/dashboard",
    allowedRoles: ["viewer_logged", "admin"],
  });

  return children;
}
