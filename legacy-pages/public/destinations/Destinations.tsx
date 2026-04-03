import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useRegions } from "@/hooks/useRegions";
import { SeoHead } from "@/components/seo/SeoHead";
import { getRegionImageSet } from "@/lib/regionImages";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

export default function Destinations() {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("destinations");
  const { data: regions = [], isLoading } = useRegions({ destinationsOnly: true, activeOnly: false });

  const featuredRegions = regions.filter((r) => r.is_featured);
  const otherRegions = regions.filter((r) => !r.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="destinations">
      <SeoHead
        title={getMetaTitle(getText("seo.title", "Premium Destinations in the Algarve"))}
        description={getMetaDescription(getText("seo.description", "Discover the Algarve's most prestigious destinations, from the Golden Triangle to Sagres, with curated insights for premium travel and lifestyle."))}
        canonicalUrl="https://algarveofficial.com/destinations"
        keywords={getText("seo.keywords", "Algarve destinations, Golden Triangle Algarve, Vilamoura, Lagos, Tavira, premium travel Portugal")}
      />
      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      {isBlockEnabled("hero", true) && (
        <CmsBlock pageId="destinations" blockId="hero" as="section" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
          <div className="relative app-container text-center">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-6">{t('sections.regions.label')}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-hero font-serif font-medium text-foreground">{t('sections.regions.title')}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6 text-body text-muted-foreground max-w-3xl mx-auto readable">{t('sections.regions.subtitleLong')}</motion.p>
          </div>
        </CmsBlock>
      )}

      {isBlockEnabled("featured-regions", true) && (
        <CmsBlock pageId="destinations" blockId="featured-regions" as="section" className="py-16 lg:py-24">
          <div className="app-container content-max">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
              <h2 className="text-title font-serif font-medium text-foreground">{t('sections.regions.featured')}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t('sections.regions.featuredSubtitle')}</p>
            </motion.div>
            <div className="flex-grid-centered">
              {featuredRegions.map((region, index) => {
                const image = getRegionImageSet(region.slug);
                const heroSrc = region.hero_image_url || region.image_url;
                return (
                  <motion.div key={region.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                    <Link href={`/destinations/${region.slug}`} className="glass-box group relative overflow-hidden rounded-xl aspect-[4/5] luxury-card cursor-pointer block">
                      <div className="absolute inset-0">
                        {heroSrc ? (
                          <img src={heroSrc} alt={region.name} width={400} height={500} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : image ? (
                          <img src={image.image} srcSet={`${image.image400} 400w, ${image.image800} 800w, ${image.image} 1200w`} alt={region.name} width={400} height={500} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center"><MapPin className="w-16 h-16 text-muted-foreground/30" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                      </div>
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <span className="text-xs font-medium text-primary tracking-wider uppercase mb-2">{t('sections.regions.algarveRegion')}</span>
                        <h3 className="text-2xl lg:text-3xl font-serif font-medium text-foreground mb-2">{region.name}</h3>
                        <p className="text-sm lg:text-base text-muted-foreground mb-4">{region.short_description || region.description}</p>
                        <div className="flex items-center justify-end">
                          <span className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">{t('sections.regions.explore')}<ArrowRight className="h-4 w-4" /></span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CmsBlock>
      )}

      {otherRegions.length > 0 && isBlockEnabled("other-regions", true) && (
        <CmsBlock pageId="destinations" blockId="other-regions" as="section" className="py-16 lg:py-24 bg-card">
          <div className="app-container content-max">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 text-center">
              <h2 className="text-title font-serif font-medium text-foreground">{t('sections.regions.more')}</h2>
              <p className="mt-2 text-body text-muted-foreground">{t('sections.regions.moreSubtitle')}</p>
            </motion.div>
            <div className="flex-grid-centered">
              {otherRegions.map((region, index) => (
                <motion.div key={region.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                  <Link href={`/destinations/${region.slug}`} className="group block p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-elevated">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors"><MapPin className="w-6 h-6 text-primary" /></div>
                    </div>
                    <h3 className="text-lg font-serif font-medium text-foreground mb-2 group-hover:text-primary transition-colors">{region.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{region.short_description || region.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </CmsBlock>
      )}

      {isBlockEnabled("cta", true) && (
        <CmsBlock pageId="destinations" blockId="cta" as="section" className="py-20 lg:py-28 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl lg:text-4xl font-serif font-medium text-foreground mb-6">{t('sections.regions.cantDecide')}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t('sections.regions.cantDecideSubtitle')}</p>
              <Button asChild variant="gold" size="lg">
                <Link href="/#categories">{t('sections.regions.browseByCategory')} <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </CmsBlock>
      )}

      <Footer />
    </div>
  );
}
