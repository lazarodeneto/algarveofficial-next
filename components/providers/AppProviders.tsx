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
import { CMS_PAGE_BUILDER_RUNTIME_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { CmsPageBuilderProvider } from "@/contexts/CmsPageBuilderContext";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { createAppQueryClient } from "@/lib/react-query";
import { globalSettingsQueryKey } from "@/lib/query-keys";
import type { RuntimeSettingRow } from "@/lib/cms/runtime-settings";

interface AppProvidersProps {
  children: ReactNode;
  initialMessages?: LocaleMessages;
  initialCmsRuntimeSettings?: RuntimeSettingRow[];
  locale?: string;
}

export function AppProviders({
  children,
  initialMessages,
  initialCmsRuntimeSettings,
  locale,
}: AppProvidersProps) {
  const [queryClient] = useState(() => {
    const client = createAppQueryClient();
    if (locale && initialCmsRuntimeSettings) {
      client.setQueryData(
        globalSettingsQueryKey(CMS_PAGE_BUILDER_RUNTIME_KEYS, locale),
        initialCmsRuntimeSettings,
      );
    }
    return client;
  });

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
