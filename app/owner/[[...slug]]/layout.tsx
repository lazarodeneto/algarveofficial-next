import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ slug?: string[] }>;
}

export default async function OwnerGuardLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  await guardDashboardRoute({
    locale: DEFAULT_LOCALE,
    slug,
    basePath: "/owner",
    allowedRoles: ["owner", "admin"],
  });

  return children;
}
