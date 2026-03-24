"use client";

import { Suspense, type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { PublicSiteSidebar } from "@/components/layout/PublicSiteSidebar";
import { stripLocaleFromPathname } from "@/lib/i18n/config";

interface PublicSiteFrameProps {
  children: ReactNode;
}

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export function PublicSiteFrame({ children }: PublicSiteFrameProps) {
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);

  // Defer sidebar logic to useEffect to avoid hydration mismatch
  // Server renders children only, client adds sidebar after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Strip locale prefix before checking route prefixes
  // so /en/admin, /pt-pt/admin, etc. are all correctly identified
  const barePath = stripLocaleFromPathname(pathname);
  const shouldHideSidebar = SIDEBAR_EXCLUDED_PREFIXES.some((prefix) => barePath.startsWith(prefix));

  // Show only children during SSR/hydration to match server output
  if (!mounted || shouldHideSidebar) {
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
