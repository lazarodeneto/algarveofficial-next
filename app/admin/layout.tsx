import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AppProviders } from "@/components/providers/AppProviders";
import { loadInitialLocaleMessages } from "@/i18n/server-locale";
import { CMS_PAGE_BUILDER_RUNTIME_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { fetchCmsRuntimeSettings } from "@/lib/cms/runtime-settings";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "AlgarveOfficial administration area.",
  path: "/admin",
  noIndex: true,
  noFollow: true,
});

async function loadInitialCmsRuntimeSettings() {
  try {
    return await fetchCmsRuntimeSettings({
      requestedKeys: CMS_PAGE_BUILDER_RUNTIME_KEYS,
      locale: DEFAULT_LOCALE,
    });
  } catch {
    return [];
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [messages, initialCmsRuntimeSettings] = await Promise.all([
    loadInitialLocaleMessages(DEFAULT_LOCALE),
    loadInitialCmsRuntimeSettings(),
  ]);

  return (
    <LocaleProvider locale={DEFAULT_LOCALE}>
      <AppProviders
        initialMessages={messages}
        initialCmsRuntimeSettings={initialCmsRuntimeSettings}
        locale={DEFAULT_LOCALE}
      >
        <AdminShell>{children}</AdminShell>
      </AppProviders>
    </LocaleProvider>
  );
}
