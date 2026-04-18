"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { ContextPanel } from "@/components/admin/context-panel";
import { InboxFiltersProvider } from "@/components/admin/inbox-filters-state";
import { Sidebar } from "@/components/admin/sidebar";
import { useAdminGeoRestriction } from "@/hooks/useAdminGeoRestriction";
import { useAdminMessagePolling } from "@/hooks/useAdminMessagePolling";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
}

function isInboxRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/admin\/inbox(?:\/|$)/.test(pathname);
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const inboxRoute = isInboxRoute(pathname);

  const { isBlocked, isLoading: geoLoading } = useAdminGeoRestriction();

  useAdminMessagePolling();

  if (geoLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md space-y-4 p-8 text-center">
          <ShieldX className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-serif font-medium text-foreground">Access Restricted</h1>
          <p className="text-muted-foreground">
            The admin panel is restricted to Portugal-based access only. Your current location
            does not match the allowed region.
          </p>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <InboxFiltersProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsla(var(--gold)/0.11)_0%,transparent_40%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.16)_100%)]">
        <Sidebar />

        <div className="lg:pl-20">
          <div className="flex h-screen w-full">
            <ContextPanel />

            <div className="flex min-w-0 flex-1 flex-col">
              <AdminHeader />

              <main className="min-h-0 flex-1 overflow-auto overscroll-contain">
                <div
                  className={cn(
                    "h-full",
                    inboxRoute
                      ? "p-0"
                      : "mx-auto w-full max-w-[1900px] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6",
                  )}
                >
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </InboxFiltersProvider>
  );
}
