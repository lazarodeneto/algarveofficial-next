import { AppProviders } from "@/components/providers/AppProviders";
import { loadInitialLocaleMessages } from "@/i18n/server-locale";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";

export default async function OwnerPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";
  const locale = DEFAULT_LOCALE as Locale;

  await guardDashboardRoute({
    locale,
    slug,
    basePath: "/owner",
    allowedRoles: ["owner", "admin"],
  });

  const { OwnerDashboardPage } = await import("@/components/routes/OwnerDashboardPage");
  const messages = await loadInitialLocaleMessages(locale, { scope: "full" });

  return (
    <LocaleProvider locale={locale}>
      <AppProviders initialMessages={messages} initialCmsRuntimeSettings={[]} locale={locale}>
        <OwnerDashboardPage route={route} />
      </AppProviders>
    </LocaleProvider>
  );
}
