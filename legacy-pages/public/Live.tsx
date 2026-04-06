import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
import { SeoHead } from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
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

const Live = () => {
  const { t } = useTranslation();
  const { getMetaDescription, getMetaTitle, getText, isBlockEnabled } = useCmsPageBuilder("live");
  const { data: cities = [], isLoading } = useCities();
  const l = useLocalePath();
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

  const relocationRoadmap = [
    {
      icon: FileCheck2,
      title: t("live.roadmap.legal.title", "Legal & Residency Setup"),
      description: t(
        "live.roadmap.legal.description",
        "Map residency route, tax registration, NIF, banking, and compliant documentation with local experts.",
      ),
    },
    {
      icon: Home,
      title: t("live.roadmap.home.title", "Home & Neighborhood Match"),
      description: t(
        "live.roadmap.home.description",
        "Select the right area based on your lifestyle: family-focused, golf-centric, marina living, or tranquil coastal villages.",
      ),
    },
    {
      icon: CalendarClock,
      title: t("live.roadmap.move.title", "90-Day Landing Plan"),
      description: t(
        "live.roadmap.move.description",
        "A practical first-quarter checklist for utilities, healthcare enrollment, schools, mobility, and trusted local services.",
      ),
    },
  ];

  const livingPillars = [
    {
      icon: HeartPulse,
      title: t("live.pillars.health.title", "Healthcare"),
      description: t(
        "live.pillars.health.description",
        "Private and public access options, English-speaking clinics, and concierge medical support.",
      ),
    },
    {
      icon: GraduationCap,
      title: t("live.pillars.education.title", "Education"),
      description: t(
        "live.pillars.education.description",
        "International schools, language pathways, and family relocation alignment.",
      ),
    },
    {
      icon: Wallet2,
      title: t("live.pillars.cost.title", "Cost & Tax Clarity"),
      description: t(
        "live.pillars.cost.description",
        "Transparent guidance on living costs, ownership vs rent scenarios, and tax planning handoff.",
      ),
    },
    {
      icon: ShieldCheck,
      title: t("live.pillars.security.title", "Safety & Services"),
      description: t(
        "live.pillars.security.description",
        "Neighborhood context, home security providers, and vetted maintenance networks.",
      ),
    },
  ];

  const liveStats = [
    { icon: Sun, value: "300+", label: t("live.stats.sun", "Sunny Days / Year") },
    { icon: MapPin, value: "16", label: t("live.stats.municipalities", "Municipalities to Explore") },
    { icon: Home, value: "1", label: t("live.stats.concierge", "Unified Relocation Concierge") },
  ];

  const budgetTier = useMemo(() => {
    if (monthlyBudget < 3000) return t("live.planner.budget.lean", "Lean Setup");
    if (monthlyBudget < 5500) return t("live.planner.budget.balanced", "Balanced Premium");
    return t("live.planner.budget.luxury", "Premium Comfort");
  }, [monthlyBudget, t]);

  const timelineLabelMap: Record<string, string> = {
    "0-3": t("live.planner.timeline.0_3", "0-3 months"),
    "3-6": t("live.planner.timeline.3_6", "3-6 months"),
    "6-12": t("live.planner.timeline.6_12", "6-12 months"),
    "12+": t("live.planner.timeline.12plus", "12+ months"),
  };

  const neighborhoodFocus = useMemo(() => {
    if (lifestyleFocus === "marina") {
      return t("live.planner.focus.marina", "Vilamoura, Quinta do Lago, and marina-adjacent neighborhoods with strong service density.");
    }
    if (lifestyleFocus === "family") {
      return t("live.planner.focus.family", "Loulé, Lagos outskirts, and school-connected residential zones with year-round livability.");
    }
    return t("live.planner.focus.coastal", "Lagos, Tavira, and selected coastal pockets balancing access, calm, and daily convenience.");
  }, [lifestyleFocus, t]);

  const residencyPriority = useMemo(() => {
    if (timeline === "0-3") {
      return t("live.planner.residency.fast", "Immediate legal sequencing: NIF, banking, lease/purchase compliance, and residency filing path.");
    }
    if (timeline === "3-6") {
      return t("live.planner.residency.standard", "Parallel track setup: documentation readiness while filtering locations and service providers.");
    }
    return t("live.planner.residency.progressive", "Staged preparation: optimize tax/legal structure first, then execute housing and move timeline.");
  }, [timeline, t]);

  const first90DaysChecklist = useMemo(() => {
    const items = [
      t("live.planner.checklist.legal", "Set legal/tax onboarding sequence with local advisors."),
      housingPlan === "rent-first"
        ? t("live.planner.checklist.rent", "Secure short-term rental base before long-term commitment.")
        : t("live.planner.checklist.buy", "Start purchase screening with legal due-diligence gate from day one."),
      schoolingNeed === "yes"
        ? t("live.planner.checklist.school", "Shortlist international schools and align commute radius before home selection.")
        : t("live.planner.checklist.service", "Prioritize healthcare + mobility setup for daily reliability."),
      household === "family"
        ? t("live.planner.checklist.family", "Map family routines: school, activities, and trusted domestic services.")
        : t("live.planner.checklist.household", "Map household routine support: transport, wellness, and concierge workflows."),
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
      subject: t("live.planner.handoff.subject", "Relocation Planning Request"),
      message: relocationBriefMessage,
    });
    return l(`/contact?${params.toString()}`);
  }, [l, relocationBriefMessage, t]);

  return (
    <div className="min-h-screen bg-background text-foreground" data-cms-page="live">
      <SeoHead
        title={getMetaTitle(getText("seo.title", "Live in the Algarve"))}
        description={getMetaDescription(getText("seo.description", "Practical guidance to relocate and build your life in the Algarve: residency pathways, neighborhoods, healthcare, education, and vetted local services."))}
        canonicalUrl="https://algarveofficial.com/live"
        keywords={getText("seo.keywords", "live in Algarve, relocate to Portugal, Algarve residency, Algarve neighborhoods, expat Algarve")}
      />

      <Header />
      {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      <main className="flex-grow">
        {isBlockEnabled("hero", true) && (
          <CmsBlock pageId="live" blockId="hero" className="px-0 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4">
            <LiveStyleHero
              className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
              badge={t("live.hero.badge", "Relocation Guidance")}
              title={t("live.hero.title", "Live in the Algarve, with clarity from day one")}
              subtitle={t(
                "live.hero.subtitle",
                "Structured guidance for residency, housing, and daily life so your move is smooth, compliant, and future-ready.",
              )}
              media={
                <HeroBackgroundMedia
                  mediaType={getText("hero.mediaType", "image")}
                  imageUrl={getText("hero.imageUrl", "")}
                  videoUrl={getText("hero.videoUrl", "")}
                  youtubeUrl={getText("hero.youtubeUrl", "")}
                  posterUrl={getText("hero.posterUrl", "")}
                  alt={t("live.hero.alt", "Live in Algarve coastline")}
                  fallback={<PageHeroImage page="live" alt={t("live.hero.alt", "Live in Algarve coastline")} />}
                />
              }
              ctas={
                <>
                  <Link href={l("/contact")}>
                    <Button variant="gold" size="lg">
                      {t("live.hero.ctaPrimary", "Plan My Move")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={l("/directory")}>
                    <Button variant="heroOutline" size="lg">
                      {t("live.hero.ctaSecondary", "Browse Local Experts")}
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
                    href={l(`/visit/${featuredCities[0].slug}`)}
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
                          {t("live.featuredCityHub", "Featured City Hub")}
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                          {featuredCities[0].name}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-white/85">
                          {featuredCities[0].short_description ||
                            t("live.featuredCityHubDescription", "Explore curated listings and city guides in {{name}}, Algarve.", { name: featuredCities[0].name })}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {t("live.cityIndex", "City Index")}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl text-foreground">
                      {t("live.exploreAlgarveCities", "Explore Algarve Cities")}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t("live.cityIndexDescription", "Browse neighborhoods, local services, and lifestyle guides by city.")}
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

              {isBlockEnabled("all-active-city-hubs", true) ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{t("live.allActiveCityHubs", "All Active City Hubs")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("live.allActiveCityHubsDescription", "Discover every city hub available across the Algarve.")}
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
                              t("live.destinations.fallbackDescription", "High-quality infrastructure and lifestyle access.")}
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

        {isBlockEnabled("segments", true) && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
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

        {isBlockEnabled("planner", true) && <CmsBlock pageId="live" blockId="planner" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.planner.label", "Relocation Planner")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.planner.title", "Build your move blueprint in under 2 minutes")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <article className="lg:col-span-2 glass-box p-6 space-y-5">
              <div className="space-y-2">
                <Label>{t("live.planner.timelineLabel", "Timeline")}</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3">{t("live.planner.timeline.0_3", "0-3 months")}</SelectItem>
                    <SelectItem value="3-6">{t("live.planner.timeline.3_6", "3-6 months")}</SelectItem>
                    <SelectItem value="6-12">{t("live.planner.timeline.6_12", "6-12 months")}</SelectItem>
                    <SelectItem value="12+">{t("live.planner.timeline.12plus", "12+ months")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.householdLabel", "Household")}</Label>
                <Select value={household} onValueChange={setHousehold}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">{t("live.planner.household.solo", "Solo")}</SelectItem>
                    <SelectItem value="couple">{t("live.planner.household.couple", "Couple")}</SelectItem>
                    <SelectItem value="family">{t("live.planner.household.family", "Family")}</SelectItem>
                    <SelectItem value="retired">{t("live.planner.household.retired", "Retired")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.housingLabel", "Housing Strategy")}</Label>
                <Select value={housingPlan} onValueChange={setHousingPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent-first">{t("live.planner.housing.rentFirst", "Rent first, then decide")}</SelectItem>
                    <SelectItem value="buy-soon">{t("live.planner.housing.buySoon", "Buy within first 6 months")}</SelectItem>
                    <SelectItem value="buy-now">{t("live.planner.housing.buyNow", "Buy immediately")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.lifestyleLabel", "Lifestyle Focus")}</Label>
                <Select value={lifestyleFocus} onValueChange={setLifestyleFocus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coastal">{t("live.planner.lifestyle.coastal", "Coastal balance")}</SelectItem>
                    <SelectItem value="marina">{t("live.planner.lifestyle.marina", "Marina + premium services")}</SelectItem>
                    <SelectItem value="family">{t("live.planner.lifestyle.family", "Family-first routines")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t("live.planner.budgetLabel", "Monthly Living Budget")}</Label>
                  <span className="text-sm font-medium text-foreground">EUR {monthlyBudget.toLocaleString()}</span>
                </div>
                <Slider
                  value={[monthlyBudget]}
                  min={1800}
                  max={12000}
                  step={100}
                  onValueChange={(values) => setMonthlyBudget(values[0] ?? 1800)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("live.planner.schoolingLabel", "Need School Support?")}</Label>
                <Select value={schoolingNeed} onValueChange={setSchoolingNeed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t("live.planner.schooling.yes", "Yes")}</SelectItem>
                    <SelectItem value="no">{t("live.planner.schooling.no", "No")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </article>

            <article className="lg:col-span-3 glass-box p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Wallet2 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.budgetBand", "Budget Band")}</span>
                  </div>
                  <p className="font-medium">{budgetTier}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.timeline", "Timeline")}</span>
                  </div>
                  <p className="font-medium">{timelineLabelMap[timeline]}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <School className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.14em]">{t("live.planner.output.schooling", "Schooling")}</span>
                  </div>
                  <p className="font-medium">
                    {schoolingNeed === "yes" ? t("live.planner.schooling.required", "Required") : t("live.planner.schooling.notRequired", "Not required")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.priority", "Residency Priority")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{residencyPriority}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.neighborhood", "Neighborhood Focus")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{neighborhoodFocus}</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="text-lg font-medium mb-2">{t("live.planner.output.first90", "First 90-Day Checklist")}</h3>
                <ul className="space-y-2">
                  {first90DaysChecklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href={relocationContactHref}>
                  <Button variant="gold" size="lg">
                    {t("live.planner.handoff.primary", "Send This Plan to Concierge")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href={l("/directory")}>
                  <Button variant="outline" size="lg">
                    {t("live.planner.handoff.secondary", "View Trusted Local Partners")}
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </CmsBlock>}

        {isBlockEnabled("segments", true) && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.roadmap.label", "Relocation Roadmap")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.roadmap.title", "Your move, broken into practical steps")}
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

        {isBlockEnabled("segments", true) && <CmsBlock pageId="live" blockId="segments" as="section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 lg:py-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-medium text-primary tracking-[0.2em] uppercase">
              {t("live.pillars.label", "Life Essentials")}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
              {t("live.pillars.title", "What matters once you have arrived")}
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
                {t("live.destinations.label", "Destination Snapshot")}
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-serif font-medium">
                {t("live.destinations.title", "Explore cities to match your lifestyle")}
              </h2>
            </div>
            <Link href={l("/destinations")}>
              <Button variant="luxury">
                {t("live.destinations.viewAll", "View All Destinations")}
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
                {t("live.destinations.empty", "Featured city guides are being updated. Check back shortly.")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCities.map((city, index) => (
                <motion.article
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
                        t("live.destinations.fallbackDescription", "High-quality infrastructure and lifestyle access.")}
                    </p>
                    <Link
                      href={l(`/visit/${city.slug}`)}
                      className="inline-flex items-center mt-4 text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      {t("live.destinations.exploreCity", "Explore City")}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </CmsBlock>}

        {isBlockEnabled("cta", true) && <CmsBlock pageId="live" blockId="cta" as="section" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-20">
          <div className="glass-box p-8 md:p-10 text-center">
            <h2 className="text-3xl font-serif font-medium mb-3">
              {t("live.final.title", "Ready to establish your base in the Algarve?")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "live.final.description",
                "Tell us your timeline, priorities, and household profile. We will map the right next steps with vetted local partners.",
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link href={l("/contact")}>
                <Button variant="gold" size="lg">
                  {t("live.final.primary", "Start Relocation Planning")}
                </Button>
              </Link>
              <Link href={l("/partner")}>
                <Button variant="outline" size="lg">
                  {t("live.final.secondary", "Request Partner Introduction")}
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
