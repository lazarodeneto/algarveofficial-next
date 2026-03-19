import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useFavoriteCategories } from "@/hooks/useFavoriteCategories";
import { useFeaturedCategories } from "@/hooks/useReferenceData";
import { usePublishedListings } from "@/hooks/useListings";
import { getCategoryIconComponent } from "@/lib/categoryIcons";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildMergedCategoryOptions } from "@/lib/categoryMerges";
import { useTranslation } from "react-i18next";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeleton/SkeletonCard";

export function CategoriesSection() {
  const { isFavorite, toggleFavorite } = useFavoriteCategories();
  const { data: categories, isLoading: categoriesLoading } = useFeaturedCategories();
  const { data: listings, isLoading: listingsLoading } = usePublishedListings();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();

  const isLoading = categoriesLoading || listingsLoading;

  // Count listings per category
  const getCategoryCount = (categoryIds: string[]) => {
    if (!listings || categoryIds.length === 0) return 0;
    const idSet = new Set(categoryIds);
    return listings.filter((listing) => idSet.has(listing.category_id)).length;
  };

  const mergedCategories = buildMergedCategoryOptions(categories || []);

  if (isLoading) {
    return (
      <section id="categories" className="py-24 bg-background lg:py-[40px]">
        <div className="app-container">
          <div className="text-center mb-16">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 max-w-full mx-auto" />
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
  const categoriesWithListings = mergedCategories.filter((category) => getCategoryCount(category.memberIds) > 0);

  if (categoriesWithListings.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-24 bg-background lg:py-[40px]">
      <div className="app-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
            {t("sections.categories.label")}
          </span>
          <h2 className="mt-4 text-title font-serif font-medium text-foreground">
            {t("sections.categories.title")}
          </h2>
          <p className="mt-4 text-body text-muted-foreground dark:text-white/80 max-w-2xl mx-auto">
            {t("sections.categories.subtitle")}
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid gap-4 md:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
          {categoriesWithListings.map((category, index) => {
            const IconComponent = getCategoryIconComponent(category.icon ?? undefined);
            const displayName = translateCategoryName(t, category.slug, category.name);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
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
                  to={buildLangPath(langPrefix, `/directory?category=${category.slug}`)}
                  className="block w-full h-full min-w-0 min-h-[14.5rem] sm:min-h-[15rem] lg:min-h-[9rem] p-6 lg:px-6 lg:py-4 glass-box glass-box-silver-liquid text-center flex flex-col items-center"
                >
                  <div className="relative z-10 w-14 h-14 rounded-lg bg-muted dark:bg-muted flex items-center justify-center mb-5 lg:mb-4">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="relative z-10 text-[1.28rem] sm:text-[1.4rem] lg:text-[1.65rem] font-medium text-foreground mb-4 break-words text-balance leading-[1.15] min-h-[3.75rem] sm:min-h-[4.2rem] lg:min-h-[4.3rem] lg:mb-3 flex items-center justify-center">
                    {displayName}
                  </h3>
                  <span className="relative z-10 text-body-sm font-medium text-primary mt-auto">
                    {getCategoryCount(category.memberIds)} {t("sections.categories.listings")}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
