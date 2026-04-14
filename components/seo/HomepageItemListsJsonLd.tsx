import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { useFeaturedCategories, useFeaturedRegions } from "@/hooks/useReferenceData";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { buildMergedCategoryOptions } from "@/lib/categoryMerges";
import { translateCategoryName } from "@/lib/translateCategory";
import { useLocalePath } from "@/hooks/useLocalePath";

const SITE_URL = "https://algarveofficial.com";

function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function HomepageItemListsJsonLd() {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const l = useLocalePath();
  const { data: featuredCategories = [] } = useFeaturedCategories();
  const { data: featuredRegions = [] } = useFeaturedRegions();

  const categoryItems = useMemo(() => {
    const merged = buildMergedCategoryOptions(featuredCategories).slice(0, 8);
    if (merged.length > 0) {
      return merged.map((category) => {
        const translatedName = translateCategoryName(t, category.slug, category.name);
        return {
          name: translatedName,
          url: absoluteUrl(l(`/stay?category=${category.slug}`)),
          description: category.short_description ?? `${translatedName} in the Algarve.`,
        };
      });
    }

    return [
      {
        name: t("categoryNames.places-to-stay"),
        url: absoluteUrl(l("/stay?category=places-to-stay")),
        description: "Hotels, villas, and premium stays in the Algarve.",
      },
      {
        name: t("categoryNames.restaurants"),
        url: absoluteUrl(l("/stay?category=restaurants")),
        description: "Fine dining and standout restaurants across the Algarve.",
      },
      {
        name: t("categoryNames.things-to-do"),
        url: absoluteUrl(l("/stay?category=things-to-do")),
        description: "Curated experiences and activities in the Algarve.",
      },
      {
        name: t("categoryNames.whats-on"),
        url: absoluteUrl(l("/stay?category=whats-on")),
        description: "Events and happenings across the Algarve.",
      },
    ];
  }, [featuredCategories, l, t]);

  const destinationItems = useMemo(() => {
    const featured = featuredRegions
      .filter((region) => Boolean(region.slug))
      .slice(0, 8);

    if (featured.length > 0) {
      return featured.map((region) => ({
        name: region.name,
        url: absoluteUrl(l(`/destinations/${region.slug}`)),
        description:
          region.description ?? `Discover ${region.name}, one of the top destinations in the Algarve.`,
      }));
    }

    return [
      { name: "Lagos", url: absoluteUrl(l("/destinations")), description: "Explore Lagos and its iconic coastal scenery." },
      { name: "Vilamoura", url: absoluteUrl(l("/destinations")), description: "Discover Vilamoura's marina, golf, and premium lifestyle." },
      { name: "Tavira", url: absoluteUrl(l("/destinations")), description: "Experience Tavira's historic charm and eastern Algarve beaches." },
      { name: "Albufeira", url: absoluteUrl(l("/destinations")), description: "Find the best of Albufeira's coast, dining, and nightlife." },
    ];
  }, [featuredRegions, l]);

  return (
    <>
      <ItemListJsonLd
        name="Featured Categories in the Algarve"
        url={absoluteUrl(l("/#featured-categories"))}
        description="Featured premium categories for Algarve travel discovery."
        items={categoryItems}
        locale={locale}
      />
      <ItemListJsonLd
        name="Featured Destinations in the Algarve"
        url={absoluteUrl(l("/#featured-destinations"))}
        description="Top destinations in the Algarve for stays, experiences, and lifestyle."
        items={destinationItems}
        locale={locale}
      />
    </>
  );
}

export default HomepageItemListsJsonLd;
