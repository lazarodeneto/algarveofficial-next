"use client";

import { BrandLogo } from "@/components/ui/brand-logo";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function PublicSiteSidebar() {
  return (
    <aside className="hidden xl:flex fixed inset-y-0 left-0 z-[120] w-72 flex-col border-r border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-20 items-center border-b border-border px-6">
        <BrandLogo size="sm" showText className="gap-2" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SidebarNav />
      </div>
    </aside>
  );
}
