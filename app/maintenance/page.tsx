import Maintenance from "@/legacy-pages/Maintenance";
import { AppProviders } from "@/components/providers/AppProviders";
import { loadInitialLocaleMessages } from "@/i18n/server-locale";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function MaintenancePage() {
  const locale = await getRequestLocale();
  const messages = await loadInitialLocaleMessages(locale);

  return (
    <LocaleProvider locale={locale}>
      <AppProviders initialMessages={messages}>
        <Maintenance />
      </AppProviders>
    </LocaleProvider>
  );
}
