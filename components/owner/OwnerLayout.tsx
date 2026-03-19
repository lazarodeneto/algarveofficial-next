import { useState, type ReactNode } from "react";
import { Outlet } from "@/components/router/nextRouterCompat";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { OwnerHeader } from "@/components/owner/OwnerHeader";
import { SeoHead } from "@/components/seo/SeoHead";

interface OwnerLayoutProps {
  children?: ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <SeoHead noIndex noFollow />
      <OwnerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
