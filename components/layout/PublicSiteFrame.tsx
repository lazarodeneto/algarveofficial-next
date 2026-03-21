"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";
import { stripLocaleFromPathname } from "@/lib/i18n/config";

interface PublicSiteFrameProps {
  children: ReactNode;
}

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function PublicSiteFrame({ children }: PublicSiteFrameProps) {
  const pathname = usePathname() || "/";
  // Strip locale prefix before checking route prefixes
  // so /en/admin, /pt-pt/admin, etc. are all correctly identified
  const barePath = stripLocaleFromPathname(pathname);
  const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  if (shouldHideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <PublicSiteSidebar />
      </Suspense>
      <div className="xl:pl-16 lg:pr-6">{children}</div>
    </>
  );
}
