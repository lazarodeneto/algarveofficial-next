import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Compass, Sparkles, Star, Sun } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCities } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";

const Experiences = () => {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("experiences");
  const l = useLocalePath();
  const { data: cities = [] } = useCities();
  const imageTimestamp = Date.now();

  const featuredCities = useMemo(
    () => cities.filter((city) => city.is_featured).slice(0, 6),
    [cities],
  );

  const experienceStats = [
    { icon: Sparkles, value: "200+", label: t("experiences.stats.curated", "Curated Experiences") },
    { icon: Compass, value: "15+", label: t("experiences.stats.categories", "Activity Categories") },
    { icon: Sun, value: "300+", label: t("experiences.stats.sunDays", "Sun Days per Year") },
  ];

  const experiencePillars = [
    {
      icon: Sun,
      title: t("experiences.pillars.outdoor.title", "Outdoor Adventures"),
      description: t("experiences.pillars.outdoor.description", "Surfing, kayaking, hiking along coastal cliffs, and exploring hidden caves along the Algarve coastline."),
    },
    {
      icon: Sparkles,
      title: t("experiences.pillars.gastronomy.title", "Gastronomy & Wine"),
      description: t("experiences.pillars.gastronomy.description", "Wine tastings, seafood experiences, farm-to-table dining, and traditional Algarvian cooking classes."),
    },
    {
      icon: Compass,
      title: t("experiences.pillars.culture.title", "Culture & Heritage"),
      description: t("experiences.pillars.culture.description", "Historic villages, local markets, artisan workshops, and living traditions across the region."),
    },
    {
      icon: Star,
      title: t("experiences.pillars.wellness.title", "Wellness & Relaxation"),
      description: t("experiences.pillars.wellness.description", "Spa retreats, yoga sessions, thermal baths, and holistic wellness programs in stunning settings."),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" data-cms-page="experiences">
      <SeoHead
        title={getMetaTitle(getText("seo.title", "Experiences in the Algarve"))}
        description={getMetaDescription(getText("seo.description", "Discover curated experiences across the Algarve — from wine tastings and boat tours to golf, wellness, and cultural adventures."))}
        canonicalUrl="https://algarveofficial.com/experiences"
        keywords={getText("seo.keywords", "Algarve experiences, things to do Algarve, Algarve tours, Algarve activities, Algarve adventures")}
      />

      <Header />

      <main className="flex-grow">
        {isBlockEnabled("hero", true) && (
          <CmsBlock pageId="experiences" blockId="hero" className="px-0 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4">
            <LiveStyleHero
              className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
              badge={t("experiences.hero.badge", "Curated Adventures")}
              title={t("experiences.hero.title", "Experience the Algarve")}
              subtitle={t(
                "experiences.hero.subtitle",
                "From coastal adventures to culinary discoveries — find unforgettable experiences handpicked for every taste and season.",
              )}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
                  alt={t("experiences.hero.alt", "Algarve experiences")}
                  fallback={<PageHeroImage page="directory" alt={t("experiences.hero.alt", "Algarve experiences")} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/directory?category=see-do")}>
                    <Button variant="gold" size="lg">
                      {t("experiences.hero.ctaPrimary", "Browse Experiences")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={l("/contact")}>
                    <Button variant="heroOutline" size="lg">
                      {t("experiences.hero.ctaSecondary", "Plan with Concierge")}
                    </Button>
                  </Link>
                </>
              }
            />
          </CmsBlock>
        )}

        {cities.length > 0 && isBlockEnabled("city-hubs", true) ? (
          <div className="app-container content-max pb-16 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)]">
            <section className="mb-10 space-y-8">
              {featuredCities.length > 0 && isBlockEnabled("featured-city-hub", true) ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <Link
                    href={l(`/city/${featuredCities[0].slug}`)}
                    className="group block h-full overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
                  >
                    <div className="relative h-full min-h-[20rem]">
                      <img
                        src={featuredCities[0].image_url ? `${featuredCities[0].image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                        alt={featuredCities[0].name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                          {t("experiences.featuredCityHub", "Featured City Hub")}
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                          {featuredCities[0].name}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-white/85">
                          {featuredCities[0].short_description ||
                            t("experiences.featuredCityHubDescription", "Explore curated experiences in {{name}}, Algarve.", { name: featuredCities[0].name })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {t("experiences.cityIndex", "City Index")}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                      {t("experiences.exploreAlgarveCities", "Explore Algarve Cities")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("experiences.cityIndexDescription", "Browse experiences and activities by city.")}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {cities.slice(0, 6).map((city) => (
                        <Link
                          key={city.id}
                          href={l(`/city/${city.slug}`)}
                          className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <div className="font-medium text-foreground">{city.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {isBlockEnabled("all-active-city-hubs", true) ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{t("experiences.allActiveCityHubs", "All Active City Hubs")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("experiences.allActiveCityHubsDescription", "Discover experiences available across every city in the Algarve.")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cities.map((city) => (
                    <Link
                      key={city.id}
                      href={l(`/city/${city.slug}`)}
                      className="group block"
                    >
                      <article className="glass-box overflow-hidden">
                        <div className="h-36 w-full overflow-hidden">
                          <img
                            src={city.image_url ? `${city.image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                            alt={city.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                            {city.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {city.short_description ||
                              t("experiences.cityFallbackDescription", "Curated experiences and activities.")}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {isBlockEnabled("stats", true) && (
          <CmsBlock pageId="experiences" blockId="stats" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
            <div className="grid gap-3 md:grid-cols-3">
              {experienceStats.map((stat) => (
                <article key={stat.label} className="glass-box p-5 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("pillars", true) && (
          <CmsBlock pageId="experiences" blockId="pillars" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
            <div className="mb-8 text-center">
              <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
                {t("experiences.pillars.label", "What We Offer")}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
                {t("experiences.pillars.title", "Experiences for Every Passion")}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {experiencePillars.map((pillar) => (
                <article key={pillar.title} className="glass-box p-6 space-y-3">
                  <pillar.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-serif text-xl text-foreground">{pillar.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
                </article>
              ))}
            </div>
          </CmsBlock>
        )}

        {isBlockEnabled("cta", true) && (
          <CmsBlock pageId="experiences" blockId="cta" as="section" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-20">
            <div className="glass-box p-8 md:p-10 text-center">
              <h2 className="text-3xl font-serif font-medium mb-3">
                {t("experiences.cta.title", "Ready for your next adventure?")}
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                {t("experiences.cta.description", "Tell us what excites you and we will craft a bespoke itinerary of curated experiences across the Algarve.")}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={l("/contact")}>
                  <Button variant="gold" size="lg">
                    {t("experiences.cta.primary", "Plan My Experience")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href={l("/directory?category=see-do")}>
                  <Button variant="outline" size="lg">
                    {t("experiences.cta.secondary", "Browse All Listings")}
                  </Button>
                </Link>
              </div>
            </div>
          </CmsBlock>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
