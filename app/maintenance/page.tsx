import Maintenance from "@/legacy-pages/Maintenance";
import { AppProviders } from "@/components/providers/AppProviders";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function MaintenancePage() {
  const locale = await getRequestLocale();

  return (
    <LocaleProvider locale={locale}>
      <AppProviders>
        <Maintenance />
      </AppProviders>
    </LocaleProvider>
  );
}
