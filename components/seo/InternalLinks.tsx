import Link from "next/link";
import { getCategoryDisplayName, getCategoryUrlSlug, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import type { Locale } from "@/lib/i18n/config";

interface InternalLinksCategory {
  slug: string;
  name: string;
  count: number;
}

interface InternalLinksCity {
  slug: string;
  name: string;
  count: number;
}

interface ExploreOtherCategoriesProps {
  locale: Locale;
  currentCity: string;
  categories: InternalLinksCategory[];
}

interface ExploreOtherCitiesProps {
  locale: Locale;
  currentCategory: string;
  cities: InternalLinksCity[];
}

interface InternalLinksProps {
  locale: Locale;
  currentCity: string;
  currentCategory: string;
  categoriesInCity: InternalLinksCategory[];
  citiesWithCategory: InternalLinksCity[];
  maxItems?: number;
  className?: string;
}

function ExploreOtherCategories({
  locale,
  currentCity,
  categories,
}: ExploreOtherCategoriesProps) {
  if (categories.length === 0) return null;

  const isDefaultLocale = locale === "en";
  const cityDisplayName = currentCity.charAt(0).toUpperCase() + currentCity.slice(1);

  return (
    <section aria-labelledby="other-categories-heading">
      <h2 id="other-categories-heading" className="text-lg font-semibold mb-3">
        {locale === "en" ? `Explore other categories in ${cityDisplayName}` : `Explorar outras categorias em ${cityDisplayName}`}
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const urlSlug = getCategoryUrlSlug(cat.slug as CanonicalCategorySlug, locale);
          const path = isDefaultLocale 
            ? `/visit/${currentCity}/${urlSlug}` 
            : `/${locale}/visit/${currentCity}/${urlSlug}`;

          return (
            <Link
              key={cat.slug}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {cat.name} in {cityDisplayName}
              <span className="ml-1.5 text-xs opacity-60">({cat.count})</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ExploreOtherCities({
  locale,
  currentCategory,
  cities,
}: ExploreOtherCitiesProps) {
  if (cities.length === 0) return null;

  const isDefaultLocale = locale === "en";
  const categoryName = getCategoryDisplayName(currentCategory as CanonicalCategorySlug, locale);
  const urlSlug = getCategoryUrlSlug(currentCategory as CanonicalCategorySlug, locale);

  return (
    <section aria-labelledby="other-cities-heading">
      <h2 id="other-cities-heading" className="text-lg font-semibold mb-3">
        {locale === "en" ? `Explore ${categoryName} in other cities` : `Explorar ${categoryName} noutras cidades`}
      </h2>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => {
          const cityDisplayName = city.slug.charAt(0).toUpperCase() + city.slug.slice(1);
          const path = isDefaultLocale 
            ? `/visit/${city.slug}/${urlSlug}` 
            : `/${locale}/visit/${city.slug}/${urlSlug}`;

          return (
            <Link
              key={city.slug}
              href={path}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {categoryName} in {cityDisplayName}
              <span className="ml-1.5 text-xs opacity-60">({city.count})</span>
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
  categoriesInCity,
  citiesWithCategory,
  maxItems = 8,
  className,
}: InternalLinksProps) {
  if (!currentCity || !currentCategory) {
    return null;
  }

  const displayCategories = categoriesInCity.slice(0, maxItems);
  const displayCities = citiesWithCategory.slice(0, maxItems);

  if (displayCategories.length === 0 && displayCities.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Internal navigation" className={className}>
      <ExploreOtherCategories
        locale={locale}
        currentCity={currentCity}
        categories={displayCategories}
      />
      
      <ExploreOtherCities
        locale={locale}
        currentCategory={currentCategory}
        cities={displayCities}
      />
    </nav>
  );
}
