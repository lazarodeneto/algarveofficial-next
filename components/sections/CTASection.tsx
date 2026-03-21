import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { usePublishedListings } from "@/hooks/useListings";

export function CTASection() {
  const { t } = useTranslation();
  const l = useLocalizedHref();
  const { data: listings } = usePublishedListings();
  const listingCount = listings?.length ?? 0;

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-px h-24 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-1/4 right-1/4 w-px h-40 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-foreground leading-tight">
            {t('sections.cta.title')} <br />
            <span className="text-gradient-gold">{t('sections.cta.titleHighlight')}</span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('sections.cta.subtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link href={l("/directory")}>
                {t('sections.cta.primaryButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              className="bg-white text-[rgba(11,31,58,0.92)] border-[rgba(11,31,58,0.12)] hover:bg-white hover:text-[rgba(11,31,58,0.98)]"
              asChild
            >
              <Link href={l("/partner")}>
                {t('sections.cta.secondaryButton')}
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            {t('sections.cta.stats', { count: listingCount })}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
