"use client";

import { Suspense, type ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "./I18nProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { FaviconUpdater } from "@/components/FaviconUpdater";
import { FavoritesSyncProvider } from "@/components/FavoritesSyncProvider";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { RouteAccessibility } from "@/components/accessibility/RouteAccessibility";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { InboxRealtimeProvider } from "@/components/chat/InboxRealtimeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CmsPageBuilderProvider } from "@/contexts/CmsPageBuilderContext";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

interface AppProvidersProps {
  children: ReactNode;
  locale?: string;
}

export function AppProviders({ children, locale = "en" }: AppProvidersProps) {
  // Create QueryClient per render to avoid SSR cache pollution
  // useMemo ensures same instance throughout component lifecycle
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>
        <GlobalErrorBoundary>
        <ThemeProvider>
          <TooltipProvider>
            <CmsPageBuilderProvider>
              <AuthProvider>
                <FavoritesSyncProvider>
                  <InboxRealtimeProvider>
                    <ChatProvider>
                      <MobileMenuProvider>
                        <Suspense fallback={null}>
                          <RouteAccessibility />
                        </Suspense>
                        <Toaster />
                        <Sonner />
                        <FaviconUpdater />
                        <MaintenanceGuard>{children}</MaintenanceGuard>
                      </MobileMenuProvider>
                    </ChatProvider>
                  </InboxRealtimeProvider>
                </FavoritesSyncProvider>
              </AuthProvider>
            </CmsPageBuilderProvider>
          </TooltipProvider>
        </ThemeProvider>
        </GlobalErrorBoundary>
      </I18nProvider>
    </QueryClientProvider>
  );
}
