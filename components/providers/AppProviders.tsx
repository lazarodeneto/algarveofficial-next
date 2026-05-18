"use client";

import { type ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "./I18nProvider";
import { UserEngagementProviders } from "./UserEngagementProviders";
import type { LocaleMessages } from "@/i18n/locale-loader";
import { HtmlLocaleSync } from "./HtmlLocaleSync";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { FaviconUpdater } from "@/components/FaviconUpdater";
import { RouteAccessibility } from "@/components/accessibility/RouteAccessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
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

  const shell = (
    <MobileMenuProvider>
      <RouteAccessibility />
      <FaviconUpdater />
      {children}
    </MobileMenuProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialMessages={initialMessages}>
        <HtmlLocaleSync />
        <GlobalErrorBoundary>
          <ThemeProvider>
            <TooltipProvider>
              <CmsPageBuilderProvider>
                <UserEngagementProviders>{shell}</UserEngagementProviders>
              </CmsPageBuilderProvider>
            </TooltipProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </I18nProvider>
    </QueryClientProvider>
  );
}
