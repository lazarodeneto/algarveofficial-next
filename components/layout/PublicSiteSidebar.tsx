"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SidebarNav } from "@/components/layout/SidebarNav";

export function PublicSiteSidebar() {
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <aside className="hidden xl:flex fixed inset-y-0 left-0 z-[120] w-20 flex-col border-r border-border bg-background/92 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex h-20 items-center justify-center border-b border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-white/80 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.45)] dark:bg-white/10">
                <BrandLogo size="sm" showIcon showText={false} className="justify-center" iconClassName="h-6 w-6" />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              sideOffset={12}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]"
            >
              Algarve Official
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav />
        </div>
      </aside>
    </TooltipProvider>
  );
}
