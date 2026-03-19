import { useState, type ReactNode } from "react";
import { Outlet } from "@/components/router/nextRouterCompat";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { SeoHead } from "@/components/seo/SeoHead";

interface UserLayoutProps {
  children?: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <SeoHead noIndex noFollow />
      <UserSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <UserHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
