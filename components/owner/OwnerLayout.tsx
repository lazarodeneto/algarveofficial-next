import { useState, type ReactNode } from "react";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { OwnerHeader } from "@/components/owner/OwnerHeader";

interface OwnerLayoutProps {
  children?: ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-background flex w-full">
      <OwnerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerHeader />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
            {children ?? null}
          </div>
        </main>
      </div>
    </div>
  );
}
