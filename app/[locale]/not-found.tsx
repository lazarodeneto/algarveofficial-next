import { LocalizedNotFoundState } from "@/components/layout/LocalizedNotFoundState";
import { buildStaticRoutePath } from "@/lib/i18n/localized-routing";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function LocaleNotFound() {
  const locale = await getRequestLocale();

  return (
    <LocalizedNotFoundState
      homeHref={buildStaticRoutePath("home", locale)}
      beachesHref={buildStaticRoutePath("beaches", locale)}
      mapHref={buildStaticRoutePath("map", locale)}
      experiencesHref={buildStaticRoutePath("experiences", locale)}
    />
  );
}
