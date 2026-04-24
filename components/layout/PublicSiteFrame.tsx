"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";

interface PublicSiteFrameProps {
  children: ReactNode;
}

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function PublicSiteFrame({ children }: PublicSiteFrameProps) {
  const pathname = usePathname() ?? "/";

  // Strip locale prefix before checking route prefixes
  // so /en/admin, /pt-pt/admin, etc. are all correctly identified
  const barePath = stripLocaleFromPathname(pathname);
  const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  if (shouldHideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicSiteSidebar />
      <div className="lg:pl-20">{children}</div>
    </>
  );
}
