"use client";

import { type ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "./I18nProvider";
import type { LocaleMessages } from "@/i18n/locale-loader";
import { HtmlLocaleSync } from "./HtmlLocaleSync";
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
import { createAppQueryClient } from "@/lib/react-query";

interface AppProvidersProps {
  children: ReactNode;
  initialMessages?: LocaleMessages;
}

export function AppProviders({ children, initialMessages }: AppProvidersProps) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialMessages={initialMessages}>
        <HtmlLocaleSync />
        <GlobalErrorBoundary>
        <ThemeProvider>
          <TooltipProvider>
            <CmsPageBuilderProvider>
              <AuthProvider>
                <FavoritesSyncProvider>
                  <InboxRealtimeProvider>
                    <ChatProvider>
                      <MobileMenuProvider>
                        <RouteAccessibility />
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
