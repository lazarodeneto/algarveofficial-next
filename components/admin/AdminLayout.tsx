import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminMessagePolling } from "@/hooks/useAdminMessagePolling";
import { useAdminGeoRestriction } from "@/hooks/useAdminGeoRestriction";
import { ShieldX, Loader2 } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isBlocked, isLoading: geoLoading } = useAdminGeoRestriction();

  // Single polling instance for all admin message updates
  useAdminMessagePolling();

  // Show loading while geo-check resolves
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Block access if geo-restriction is active and visitor is outside Portugal
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md space-y-4 p-8">
          <ShieldX className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-serif font-medium text-foreground">
            Access Restricted
          </h1>
          <p className="text-muted-foreground">
            The admin panel is restricted to Portugal-based access only. 
            Your current location does not match the allowed region.
          </p>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f6f2e6_0%,transparent_36%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.18)_100%)] flex w-full dark:bg-[radial-gradient(circle_at_top,rgba(201,169,110,0.08)_0%,transparent_34%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.1)_100%)]">
      <SeoHead noIndex noFollow />
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex min-h-screen min-w-0 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1800px] px-2 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 xl:px-6">
            {children ?? null}
          </div>
        </main>
      </div>
    </div>
  );
}
