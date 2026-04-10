import { LocalizedNotFoundState } from "@/components/layout/LocalizedNotFoundState";
import { buildStaticRoutePath } from "@/lib/i18n/localized-routing";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function LocaleNotFound() {
  const locale = await getRequestLocale();
  const tx = await getServerTranslations(locale, [
    "notFound.title",
    "notFound.description",
    "notFound.backHome",
  ]);

  return (
    <LocalizedNotFoundState
      title={tx["notFound.title"]}
      description={tx["notFound.description"]}
      backHomeLabel={tx["notFound.backHome"]}
      homeHref={buildStaticRoutePath("home", locale)}
    />
  );
}
