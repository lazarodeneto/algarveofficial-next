"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";

interface PublicSiteFrameProps {
  children: ReactNode;
}

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function PublicSiteFrame({ children }: PublicSiteFrameProps) {
  const pathname = usePathname() || "/";
  const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
