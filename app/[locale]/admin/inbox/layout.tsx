import type { ReactNode } from "react";

import { guardDashboardRoute } from "@/lib/server/dashboard-access";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminInboxLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await guardDashboardRoute({
    locale,
    basePath: "/admin",
    allowedRoles: ["admin"],
  });
  return children;
}
