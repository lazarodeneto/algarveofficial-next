import Link from "next/link";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useFavoriteCategories } from "@/hooks/useFavoriteCategories";
import { useCategoryListingCounts, useFeaturedCategories } from "@/hooks/useReferenceData";
import { getCategoryIconComponent } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildMergedCategoryOptions } from "@/lib/categoryMerges";
import { buildCategoryRouteData } from "@/lib/public-route-builders";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeleton/SkeletonCard";

export function CategoriesSection() {
  const { isFavorite, toggleFavorite } = useFavoriteCategories();
  const { data: categories, isLoading: categoriesLoading } = useFeaturedCategories();
  const { data: categoryCounts, isLoading: countsLoading } = useCategoryListingCounts();
  const { t } = useTranslation();
  const l = useLocalePath();

  const isLoading = categoriesLoading || countsLoading;

  // Count listings per category
  const getCategoryCount = (category: ReturnType<typeof buildMergedCategoryOptions>[number]) => {
    if (!categoryCounts) return 0;
    const canonicalCount = categoryCounts[category.id];
    if (typeof canonicalCount === "number") return canonicalCount;
    return Array.from(new Set(category.memberIds)).reduce(
      (total, categoryId) => total + (categoryCounts[categoryId] ?? 0),
      0,
    );
  };

  const mergedCategories = buildMergedCategoryOptions(categories || []);

  if (isLoading) {
    return (
      <section id="categories" className="py-24 bg-background lg:py-[40px]">
        <div className="app-container">
          <div className="text-center mb-10 md:mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-3" />
            <Skeleton className="h-5 w-[42rem] max-w-full mx-auto" />
          </div>
          <div
            className="grid gap-4 md:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]"
            aria-live="polite"
            aria-label={t("directory.loading")}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} variant="category" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter out categories with 0 listings
  const categoriesWithListings = mergedCategories
    .filter((category) => getCategoryCount(category) > 0)
    .slice(0, 6);

  if (categoriesWithListings.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-24 bg-background lg:py-[40px]">
      <div className="app-container">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-12">
          <h2 className="text-title font-serif font-medium text-foreground">
            {t("sections.homepage.categories.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-[720px] text-body text-muted-foreground dark:text-white/80">
            {t("sections.homepage.categories.intro")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 md:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
          {categoriesWithListings.map((category) => {
            const IconComponent = getCategoryIconComponent(category.icon ?? undefined);
            const displayName = translateCategoryName(t, category.slug, category.name);
            
            return (
              <div
                key={category.id}
                className="relative group min-w-0 h-full"
              >
                {/* Favorite Button - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton
                    isFavorite={isFavorite(category.id)}
                    onToggle={() => toggleFavorite(category.id)}
                    size="sm"
                    variant="solid"
                  />
                </div>

                <Link
                  href={l(buildCategoryRouteData(category.slug) ?? buildStaticRouteData("stay"))}
                  className="block w-full h-full min-w-0 min-h-[11.5rem] sm:min-h-[12rem] lg:min-h-[7rem] p-5 lg:px-5 lg:py-3 glass-box glass-box-silver-liquid text-center flex flex-col items-center"
                >
                  <div className="relative z-10 w-12 h-12 rounded-lg bg-muted dark:bg-muted flex items-center justify-center mb-3 lg:mb-2">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="relative z-10 flex min-h-[2.8rem] items-center justify-center break-words text-balance text-[1.15rem] font-card-title font-bold not-italic leading-[1.15] tracking-[-0.01em] text-foreground mb-3 sm:min-h-[3.2rem] sm:text-[1.25rem] lg:min-h-[3.4rem] lg:mb-2 lg:text-[1.45rem]">
                    {displayName}
                  </h3>
                  <span className="relative z-10 text-body-sm font-medium text-primary mt-auto">
                    {getCategoryCount(category)} {t("sections.categories.listings")}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
