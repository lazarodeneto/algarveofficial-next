import Link from "next/link";
import { getCategoryDisplayName, getCategoryUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import type { Locale } from "@/lib/i18n/config";

const CITIES = [
  "lagos",
  "albufeira",
  "vilamoura",
  "faro",
  "tavira",
  "portimao",
  "loule",
  "carvoeiro",
  "quarteira",
  "olhao",
] as const;

const CITY_DISPLAY_NAMES: Record<string, string> = {
  lagos: "Lagos",
  albufeira: "Albufeira",
  vilamoura: "Vilamoura",
  faro: "Faro",
  tavira: "Tavira",
  portimao: "Portimão",
  loule: "Loulé",
  carvoeiro: "Carvoeiro",
  quarteira: "Quarteira",
  olhao: "Olhão",
};

interface ExploreOtherCategoriesProps {
  locale: Locale;
  currentCity: string;
  currentCategory: string;
  maxItems?: number;
}

interface ExploreOtherCitiesProps {
  locale: Locale;
  currentCity: string;
  currentCategory: string;
  maxItems?: number;
}

interface InternalLinksProps {
  locale: Locale;
  currentCity: string;
  currentCategory: string;
  showOtherCategories?: boolean;
  showOtherCities?: boolean;
  maxItems?: number;
  className?: string;
}

function ExploreOtherCategories({
  locale,
  currentCity,
  currentCategory,
  maxItems = 8,
}: ExploreOtherCategoriesProps) {
  const otherCategories = ALL_CANONICAL_SLUGS.filter(
    (cat) => cat !== currentCategory
  ).slice(0, maxItems);

  if (otherCategories.length === 0) return null;

  const isDefaultLocale = locale === "en";
  const cityDisplayName = CITY_DISPLAY_NAMES[currentCity] || currentCity;

  return (
    <section aria-labelledby="other-categories-heading">
      <h2 id="other-categories-heading" className="text-lg font-semibold mb-3">
        {locale === "en" ? `Explore other categories in ${cityDisplayName}` : `Explorar outras categorias em ${cityDisplayName}`}
      </h2>
      <div className="flex flex-wrap gap-2">
        {otherCategories.map((category: CanonicalCategorySlug) => {
          const urlSlug = getCategoryUrlSlug(category, locale);
          const path = isDefaultLocale 
            ? `/visit/${currentCity}/${urlSlug}` 
            : `/${locale}/visit/${currentCity}/${urlSlug}`;
          
          const categoryName = getCategoryDisplayName(category, locale);

          return (
            <Link
              key={category}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {categoryName} in {cityDisplayName}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ExploreOtherCities({
  locale,
  currentCity,
  currentCategory,
  maxItems = 8,
}: ExploreOtherCitiesProps) {
  const otherCities = CITIES.filter(
    (city) => city !== currentCity
  ).slice(0, maxItems);

  if (otherCities.length === 0) return null;

  const isDefaultLocale = locale === "en";
  const categoryName = getCategoryDisplayName(currentCategory as CanonicalCategorySlug, locale);
  const urlSlug = getCategoryUrlSlug(currentCategory as CanonicalCategorySlug, locale);

  return (
    <section aria-labelledby="other-cities-heading">
      <h2 id="other-cities-heading" className="text-lg font-semibold mb-3">
        {locale === "en" ? `Explore ${categoryName} in other cities` : `Explorar ${categoryName} noutras cidades`}
      </h2>
      <div className="flex flex-wrap gap-2">
        {otherCities.map((city) => {
          const cityDisplayName = CITY_DISPLAY_NAMES[city] || city;
          const path = isDefaultLocale 
            ? `/visit/${city}/${urlSlug}` 
            : `/${locale}/visit/${city}/${urlSlug}`;

          return (
            <Link
              key={city}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {categoryName} in {cityDisplayName}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function InternalLinks({
  locale,
  currentCity,
  currentCategory,
  showOtherCategories = true,
  showOtherCities = true,
  maxItems = 8,
  className,
}: InternalLinksProps) {
  if (!currentCity || !currentCategory) {
    return null;
  }

  const isValidCategory = ALL_CANONICAL_SLUGS.includes(
    currentCategory as CanonicalCategorySlug
  );

  if (!isValidCategory) {
    return null;
  }

  return (
    <nav aria-label="Internal navigation" className={className}>
      {showOtherCategories && (
        <ExploreOtherCategories
          locale={locale}
          currentCity={currentCity}
          currentCategory={currentCategory}
          maxItems={maxItems}
        />
      )}
      
      {showOtherCities && (
        <ExploreOtherCities
          locale={locale}
          currentCity={currentCity}
          currentCategory={currentCategory}
          maxItems={maxItems}
        />
      )}
    </nav>
  );
}
