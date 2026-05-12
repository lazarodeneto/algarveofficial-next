import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";

export default async function AdminBusinessClaimsLayout({ children }: { children: ReactNode }) {
  await guardDashboardRoute({
    locale: DEFAULT_LOCALE,
    basePath: "/admin",
    allowedRoles: ["admin"],
  });

  return children;
}

