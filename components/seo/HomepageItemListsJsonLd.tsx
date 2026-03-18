import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { useFeaturedCategories, useFeaturedRegions } from "@/hooks/useReferenceData";
import { buildMergedCategoryOptions } from "@/lib/categoryMerges";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";

const SITE_URL = "https://algarveofficial.com";

function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function HomepageItemListsJsonLd() {
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const { data: featuredCategories = [] } = useFeaturedCategories();
  const { data: featuredRegions = [] } = useFeaturedRegions();

  const categoryItems = useMemo(() => {
    const merged = buildMergedCategoryOptions(featuredCategories).slice(0, 8);
    if (merged.length > 0) {
      return merged.map((category) => {
        const translatedName = translateCategoryName(t, category.slug, category.name);
        return {
          name: translatedName,
          url: absoluteUrl(buildLangPath(langPrefix, `/directory?category=${category.slug}`)),
          description: category.short_description || `${translatedName} in the Algarve.`,
        };
      });
    }

    return [
      {
        name: t("categoryNames.places-to-stay", "Places to Stay"),
        url: absoluteUrl(buildLangPath(langPrefix, "/directory?category=places-to-stay")),
        description: "Hotels, villas, and premium stays in the Algarve.",
      },
      {
        name: t("categoryNames.restaurants", "Restaurants"),
        url: absoluteUrl(buildLangPath(langPrefix, "/directory?category=restaurants")),
        description: "Fine dining and standout restaurants across the Algarve.",
      },
      {
        name: t("categoryNames.things-to-do", "Things to Do"),
        url: absoluteUrl(buildLangPath(langPrefix, "/directory?category=things-to-do")),
        description: "Curated experiences and activities in the Algarve.",
      },
      {
        name: t("categoryNames.whats-on", "What's On"),
        url: absoluteUrl(buildLangPath(langPrefix, "/directory?category=whats-on")),
        description: "Events and happenings across the Algarve.",
      },
    ];
  }, [featuredCategories, langPrefix, t]);

  const destinationItems = useMemo(() => {
    const featured = featuredRegions
      .filter((region) => Boolean(region.slug))
      .slice(0, 8);

    if (featured.length > 0) {
      return featured.map((region) => ({
        name: region.name,
        url: absoluteUrl(buildLangPath(langPrefix, `/destinations/${region.slug}`)),
        description:
          region.description || `Discover ${region.name}, one of the top destinations in the Algarve.`,
      }));
    }

    return [
      { name: "Lagos", url: absoluteUrl(buildLangPath(langPrefix, "/destinations")), description: "Explore Lagos and its iconic coastal scenery." },
      { name: "Vilamoura", url: absoluteUrl(buildLangPath(langPrefix, "/destinations")), description: "Discover Vilamoura's marina, golf, and premium lifestyle." },
      { name: "Tavira", url: absoluteUrl(buildLangPath(langPrefix, "/destinations")), description: "Experience Tavira's historic charm and eastern Algarve beaches." },
      { name: "Albufeira", url: absoluteUrl(buildLangPath(langPrefix, "/destinations")), description: "Find the best of Albufeira's coast, dining, and nightlife." },
    ];
  }, [featuredRegions, langPrefix]);

  return (
    <>
      <ItemListJsonLd
        name="Featured Categories in the Algarve"
        url={absoluteUrl(buildLangPath(langPrefix, "/#featured-categories"))}
        description="Featured premium categories for Algarve travel discovery."
        items={categoryItems}
      />
      <ItemListJsonLd
        name="Featured Destinations in the Algarve"
        url={absoluteUrl(buildLangPath(langPrefix, "/#featured-destinations"))}
        description="Top destinations in the Algarve for stays, experiences, and lifestyle."
        items={destinationItems}
      />
    </>
  );
}

export default HomepageItemListsJsonLd;
