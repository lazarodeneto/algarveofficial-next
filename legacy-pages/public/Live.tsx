import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  Clock3,
  FileCheck2,
  GraduationCap,
  HeartPulse,
  Home,
  MapPin,
  School,
  ShieldCheck,
  Sun,
  Wallet2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useCities } from "@/hooks/useReferenceData";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import {
  STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
  STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";

const Live = () => {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled, getBlockData } = useCmsPageBuilder("live");
  const { data: cities = [], isLoading } = useCities();
  const l = useLocalePath();
  const heroEnabled = isBlockEnabled("hero", true);
  const showCityHubs = cities.length > 0 && isBlockEnabled("city-hubs", true);
  const showSegments = isBlockEnabled("segments", true);
  const plannerEnabled = isBlockEnabled("planner", true);
  const ctaEnabled = isBlockEnabled("cta", true);
  const [timeline, setTimeline] = useState("3-6");
  const [household, setHousehold] = useState("couple");
  const [housingPlan, setHousingPlan] = useState("rent-first");
  const [lifestyleFocus, setLifestyleFocus] = useState("coastal");
  const [monthlyBudget, setMonthlyBudget] = useState(4200);
  const [schoolingNeed, setSchoolingNeed] = useState("no");
  const imageTimestamp = Date.now();

  const featuredCities = useMemo(
    () => cities.filter((city) => city.is_featured).slice(0, 6),
    [cities],
  );
  const featuredCityHubData = getBlockData("featured-city-hub");
  const highlightedCityId =
    typeof featuredCityHubData.cityId === "string" ? featuredCityHubData.cityId.trim() : "";
  const featuredCity =
    (highlightedCityId ? cities.find((city) => city.id === highlightedCityId) : null) ??
    featuredCities[0] ??
    cities[0] ??
    null;

  const relocationRoadmap = [
    {
      icon: FileCheck2,
      title: t("live.roadmap.legal.title"),
      description: t(
        "live.roadmap.legal.description",
      ),
    },
    {
      icon: Home,
      title: t("live.roadmap.home.title"),
      description: t(
        "live.roadmap.home.description",
      ),
    },
    {
      icon: CalendarClock,
      title: t("live.roadmap.move.title"),
      description: t(
        "live.roadmap.move.description",
      ),
    },
  ];

  const livingPillars = [
    {
      icon: HeartPulse,
      title: t("live.pillars.health.title"),
      description: t(
        "live.pillars.health.description",
      ),
    },
    {
      icon: GraduationCap,
      title: t("live.pillars.education.title"),
      description: t(
        "live.pillars.education.description",
      ),
    },
    {
      icon: Wallet2,
      title: t("live.pillars.cost.title"),
      description: t(
        "live.pillars.cost.description",
      ),
    },
    {
      icon: ShieldCheck,
      title: t("live.pillars.security.title"),
      description: t(
        "live.pillars.security.description",
      ),
    },
  ];

  const liveStats = [
    { icon: Sun, value: "300+", label: t("live.stats.sun") },
    { icon: MapPin, value: "16", label: t("live.stats.municipalities") },
    { icon: Home, value: "1", label: t("live.stats.concierge") },
  ];

  const budgetTier = useMemo(() => {
    if (monthlyBudget < 3000) return t("live.planner.budget.lean");
    if (monthlyBudget < 5500) return t("live.planner.budget.balanced");
    if (monthlyBudget < 20000) return t("live.planner.budget.premium");
    return t("live.planner.budget.premium");
  }, [monthlyBudget, t]);

  const timelineLabelMap: Record<string, string> = {
    "0-3": t("live.planner.timeline.0_3"),
    "3-6": t("live.planner.timeline.3_6"),
    "6-12": t("live.planner.timeline.6_12"),
    "12+": t("live.planner.timeline.12plus"),
  };

  const neighborhoodFocus = useMemo(() => {
    if (lifestyleFocus === "marina") {
      return t("live.planner.focus.marina");
    }
    if (lifestyleFocus === "family") {
      return t("live.planner.focus.family");
    }
    return t("live.planner.focus.coastal");
  }, [lifestyleFocus, t]);

  const residencyPriority = useMemo(() => {
    if (timeline === "0-3") {
      return t("live.planner.residency.fast");
    }
    if (timeline === "3-6") {
      return t("live.planner.residency.standard");
    }
    return t("live.planner.residency.progressive");
  }, [timeline, t]);

  const first90DaysChecklist = useMemo(() => {
    const items = [
      t("live.planner.checklist.legal"),
      housingPlan === "rent-first"
        ? t("live.planner.checklist.rent")
        : t("live.planner.checklist.buy"),
      schoolingNeed === "yes"
        ? t("live.planner.checklist.school")
        : t("live.planner.checklist.service"),
      household === "family"
        ? t("live.planner.checklist.family")
        : t("live.planner.checklist.household"),
    ];
    return items;
  }, [household, housingPlan, schoolingNeed, t]);

  const relocationBriefMessage = useMemo(() => {
    return [
      "Relocation Planner Brief",
      `Timeline: ${timelineLabelMap[timeline] || timeline}`,
      `Household: ${household}`,
      `Housing Plan: ${housingPlan}`,
      `Lifestyle Focus: ${lifestyleFocus}`,
      `Monthly Budget: €${monthlyBudget.toLocaleString()}`,
      `Schooling Needed: ${schoolingNeed}`,
      `Priority: ${residencyPriority}`,
      `Neighborhood Focus: ${neighborhoodFocus}`,
    ].join("\n");
  }, [household, housingPlan, lifestyleFocus, monthlyBudget, neighborhoodFocus, residencyPriority, schoolingNeed, timeline, timelineLabelMap]);

  const relocationContactHref = useMemo(() => {
    const params = new URLSearchParams({
      subject: t("live.planner.handoff.subject"),
      message: relocationBriefMessage,
    });
    return l(`/contact?${params.toString()}`);
  }, [l, relocationBriefMessage, t]);

  return (
    <div className="min-h-screen bg-background text-foreground" data-cms-page="live">

      <Header />
      {!heroEnabled && <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />}

      <main className="flex-grow">
        {heroEnabled && (
          <CmsBlock pageId="live" blockId="hero" className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
            <LiveStyleHero
              className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
              badge={t("live.hero.badge")}
              title={t("pages.relocation.title", t("live.hero.title"))}
              subtitle={t(
                "pages.relocation.subtitle",
                t("live.hero.subtitle"),
              )}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
                  alt={t("live.hero.alt")}
                  fallback={<PageHeroImage page="live" alt={t("live.hero.alt")} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/contact")} className="block w-full sm:w-auto">
                    <Button variant="gold" size="lg" className="w-full whitespace-normal text-center sm:w-auto">
                      {t("live.hero.ctaPrimary")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={l("/stay")} className="block w-full sm:w-auto">
                    <Button variant="heroOutline" size="lg" className="w-full whitespace-normal text-center sm:w-auto">
                      {t("live.hero.ctaSecondary")}
                    </Button>
                  </Link>
                </>
              }
            />
          </CmsBlock>
        )}

        {showCityHubs ? (
          <div className="app-container content-max pb-16">
            <section className="mb-10 space-y-8">
              {featuredCity && isBlockEnabled("featured-city-hub", true) ? (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <Link
                    href={l(`/visit/${featuredCity.slug}`)}
                    className="group block h-full overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
                  >
                    <div className="relative h-full min-h-[20rem]">
                      <img
                        src={featuredCity.image_url ? `${featuredCity.image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                        alt={featuredCity.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                          {t("live.featuredCityHub")}
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                          {featuredCity.name}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-white/85">
                          {featuredCity.short_description ||
                            t("live.featuredCityHubDescription", { name: featuredCity.name })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {t("live.cityIndex")}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                      {t("live.exploreAlgarveCities")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("live.cityIndexDescription")}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {cities.slice(0, 6).map((city) => (
                        <Link
                          key={city.id}
                          href={l(`/visit/${city.slug}`)}
                          className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                        >
                          <div className="font-medium text-foreground">{city.name}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {isBlockEnabled("all-city-hubs", true) ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{t("live.allActiveCityHubs")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("live.allActiveCityHubsDescription")}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cities.map((city) => (
                    <Link
                      key={city.id}
                      href={l(`/visit/${city.slug}`)}
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
                              t("live.destinations.fallbackDescription")}
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

        {showSegments && <CmsBlock pageId="live" blockId="segments" as="section" className={`max-w-7xl mx-auto px-4 md:px-8 ${heroEnabled || showCityHubs ? "py-8 lg:py-12" : "pb-8 lg:pb-12"}`}>
          <div className="grid gap-3 md:grid-cols-3">
            {liveStats.map((stat) => (
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
        </CmsBlock>}

        {plannerEnabled && <CmsBlock pageId="live" blockId="planner" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.planner.label")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.planner.title")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <article className="lg:col-span-2 glass-box p-6 space-y-5">
              <div className="space-y-2">
                <Label>{t("live.planner.timelineLabel")}</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3">{t("live.planner.timeline.0_3")}</SelectItem>
                    <SelectItem value="3-6">{t("live.planner.timeline.3_6")}</SelectItem>
                    <SelectItem value="6-12">{t("live.planner.timeline.6_12")}</SelectItem>
                    <SelectItem value="12+">{t("live.planner.timeline.12plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.householdLabel")}</Label>
                <Select value={household} onValueChange={setHousehold}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">{t("live.planner.household.solo")}</SelectItem>
                    <SelectItem value="couple">{t("live.planner.household.couple")}</SelectItem>
                    <SelectItem value="family">{t("live.planner.household.family")}</SelectItem>
                    <SelectItem value="retired">{t("live.planner.household.retired")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.housingLabel")}</Label>
                <Select value={housingPlan} onValueChange={setHousingPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent-first">{t("live.planner.housing.rentFirst")}</SelectItem>
                    <SelectItem value="buy-soon">{t("live.planner.housing.buySoon")}</SelectItem>
                    <SelectItem value="buy-now">{t("live.planner.housing.buyNow")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.lifestyleLabel")}</Label>
                <Select value={lifestyleFocus} onValueChange={setLifestyleFocus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coastal">{t("live.planner.lifestyle.coastal")}</SelectItem>
                    <SelectItem value="marina">{t("live.planner.lifestyle.marina")}</SelectItem>
                    <SelectItem value="family">{t("live.planner.lifestyle.family")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t("live.planner.budgetLabel")}</Label>
                  <span className="text-sm font-medium text-foreground">EUR {monthlyBudget.toLocaleString()}</span>
                </div>
                <Slider
                  value={[monthlyBudget]}
                  min={1800}
                  max={25000}
                  step={100}
                  onValueChange={(values) => setMonthlyBudget(values[0] ?? 1800)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.schoolingLabel")}</Label>
                <Select value={schoolingNeed} onValueChange={setSchoolingNeed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t("live.planner.schooling.yes")}</SelectItem>
                    <SelectItem value="no">{t("live.planner.schooling.no")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </article>

            <article className="lg:col-span-3 glass-box p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Wallet2 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.budgetBand")}</span>
                  </div>
                  <p className="font-medium">{budgetTier}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.timeline")}</span>
                  </div>
                  <p className="font-medium">{timelineLabelMap[timeline]}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <School className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.schooling")}</span>
                  </div>
                  <p className="font-medium">
                    {schoolingNeed === "yes" ? t("live.planner.schooling.required") : t("live.planner.schooling.notRequired")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.priority")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{residencyPriority}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.neighborhood")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{neighborhoodFocus}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.first90")}</h3>
                <ul className="space-y-2">
                  {first90DaysChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex min-w-0 flex-col gap-3 pt-1 xl:flex-row">
                <Link href={relocationContactHref} className="block min-w-0 w-full xl:w-auto">
                  <Button variant="gold" size="lg" className="w-full whitespace-normal text-center xl:w-auto">
                    {t("live.planner.handoff.primary")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href={l("/stay")} className="block min-w-0 w-full xl:w-auto">
                  <Button variant="outline" size="lg" className="w-full whitespace-normal text-center xl:w-auto">
                    {t("live.planner.handoff.secondary")}
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </CmsBlock>}

        {showSegments && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.roadmap.label")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.roadmap.title")}
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {relocationRoadmap.map((item) => (
              <article key={item.title} className="glass-box p-6 h-full">
                <item.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </CmsBlock>}

        {showSegments && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.pillars.label")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.pillars.title")}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {livingPillars.map((pillar) => (
              <article key={pillar.title} className="glass-box p-6 h-full">
                <pillar.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
              </article>
            ))}
          </div>
        </CmsBlock>}

        {isBlockEnabled("segments", true) && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
                {t("live.destinations.label")}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
                {t("live.destinations.title")}
              </h2>
            </div>
            <Link href={l("/destinations")} className="w-full sm:w-auto">
              <Button variant="premium" className="w-full whitespace-normal text-center sm:w-auto">
                {t("live.destinations.viewAll")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : featuredCities.length === 0 ? (
            <div className="glass-box p-8 text-center">
              <p className="text-muted-foreground">
                {t("live.destinations.empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCities.map((city, index) => (
                <m.article
                  key={city.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="glass-box overflow-hidden"
                >
                  <div className="h-36 w-full overflow-hidden">
                    <img
                      src={city.image_url ? `${city.image_url}?_t=${imageTimestamp}` : "/placeholder.svg"}
                      alt={city.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-medium mb-2">{city.name}</h3>
                    <p className="text-sm text-muted-foreground min-h-[2.5rem]">
                      {city.short_description ||
                        t("live.destinations.fallbackDescription")}
                    </p>
                    <Link
                      href={l(`/visit/${city.slug}`)}
                      className="inline-flex items-center mt-4 text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      {t("live.destinations.exploreCity")}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </m.article>
              ))}
            </div>
          )}
        </CmsBlock>}

        {ctaEnabled && <CmsBlock pageId="live" blockId="cta" as="section" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-20">
          <div className="glass-box p-8 md:p-10 text-center">
            <h2 className="text-3xl font-serif font-medium mb-3">
              {t("live.final.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "live.final.description",
              )}
            </p>
            <div className="mx-auto mt-6 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href={l("/contact")} className="block w-full sm:w-auto">
                <Button variant="gold" size="lg" className="w-full whitespace-normal text-center sm:w-auto">
                  {t("live.final.primary")}
                </Button>
              </Link>
              <Link href={l("/partner")} className="block w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full whitespace-normal text-center sm:w-auto">
                  {t("live.final.secondary")}
                </Button>
              </Link>
            </div>
          </div>
        </CmsBlock>}
      </main>

      <Footer />
    </div>
  );
};

export default Live;
