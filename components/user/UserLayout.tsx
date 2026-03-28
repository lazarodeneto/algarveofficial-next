import { useState, type ReactNode } from "react";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";

interface UserLayoutProps {
  children?: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-background flex w-full">
      <UserSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <UserHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
            {children ?? null}
          </div>
        </main>
      </div>
    </div>
  );
}
