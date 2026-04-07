import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    ArrowRight,
    BadgeEuro,
    BarChart3,
    Building2,
    CalendarClock,
    CheckCircle2,
    Compass,
    Handshake,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useLocalePath } from "@/hooks/useLocalePath";
import { CmsBlock } from "@/components/cms/CmsBlock";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import { useCities } from "@/hooks/useReferenceData";

const Invest = () => {
    const { t } = useTranslation();
    const { getMetaDescription, getMetaTitle, getText, isBlockEnabled, getBlockData } = useCmsPageBuilder("invest");
    const l = useLocalePath();
    const { data: cities = [] } = useCities();
    const [purchasePrice, setPurchasePrice] = useState(1250000);
    const [occupancyRate, setOccupancyRate] = useState(62);
    const [averageNightlyRate, setAverageNightlyRate] = useState(580);
    const [holdYears, setHoldYears] = useState(7);
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

    const projection = useMemo(() => {
        const grossAnnualIncome = averageNightlyRate * 365 * (occupancyRate / 100);
        const netAnnualIncome = grossAnnualIncome * 0.7;
        const grossYield = purchasePrice > 0 ? (grossAnnualIncome / purchasePrice) * 100 : 0;
        const netYield = purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;
        const acquisitionCosts = purchasePrice * 0.08;
        const managementCosts = grossAnnualIncome * 0.18;
        const holdingIncome = netAnnualIncome * holdYears;
        return {
            grossAnnualIncome,
            netAnnualIncome,
            grossYield,
            netYield,
            acquisitionCosts,
            managementCosts,
            holdingIncome,
        };
    }, [averageNightlyRate, occupancyRate, purchasePrice, holdYears]);

    const formatEuro = (value: number) =>
        new Intl.NumberFormat("en-PT", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(value);

    const strategyTracks = [
        {
            icon: Building2,
            title: t("invest.strategy.core.title", "Core Capital Preservation"),
            description: t(
                "invest.strategy.core.description",
                "Prime areas with proven demand, low vacancy risk, and durable long-term value retention.",
            ),
        },
        {
            icon: Sparkles,
            title: t("invest.strategy.hybrid.title", "Hybrid Lifestyle + Yield"),
            description: t(
                "invest.strategy.hybrid.description",
                "Blend owner usage with premium short-stay positioning to maximize flexibility and return potential.",
            ),
        },
        {
            icon: Compass,
            title: t("invest.strategy.opportunistic.title", "Opportunistic Repositioning"),
            description: t(
                "invest.strategy.opportunistic.description",
                "Acquire under-optimized assets and unlock performance through design, branding, and operational upgrades.",
            ),
        },
    ];

    const executionSteps = [
        {
            icon: BarChart3,
            title: t("invest.steps.underwrite.title", "1. Underwrite"),
            description: t(
                "invest.steps.underwrite.description",
                "Define budget, target return band, and risk tolerance before asset screening starts.",
            ),
        },
        {
            icon: ShieldCheck,
            title: t("invest.steps.validate.title", "2. Validate"),
            description: t(
                "invest.steps.validate.description",
                "Run legal, tax, and structural checks with vetted local advisors before commitment.",
            ),
        },
        {
            icon: Handshake,
            title: t("invest.steps.acquire.title", "3. Acquire"),
            description: t(
                "invest.steps.acquire.description",
                "Coordinate negotiation, financing, and completion sequencing to reduce transaction friction.",
            ),
        },
        {
            icon: CalendarClock,
            title: t("invest.steps.operationalize.title", "4. Operationalize"),
            description: t(
                "invest.steps.operationalize.description",
                "Set pricing, guest/service standards, and reporting cadence for post-acquisition performance.",
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground" data-cms-page="invest">

            <Header />
            {!isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

            <main className="flex-grow">
                {isBlockEnabled("hero", true) && (
                    <CmsBlock pageId="invest" blockId="hero" className="px-0 lg:px-6 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)] pb-4">
                        <LiveStyleHero
                            className="min-h-[19rem] sm:min-h-[20rem] md:min-h-[22rem] rounded-none shadow-sm"
                            badge={t("nav.invest")}
                            title={getText("hero.title", "Invest in Algarve")}
                            subtitle={getText(
                                "hero.subtitle",
                                "Discover prime investment opportunities in Europe's leading destination. Secure your piece of paradise and build lasting value.",
                            )}
                            media={
                                <HeroBackgroundMedia
                                    mediaType={getText("hero.mediaType", "image")}
                                    imageUrl={getText("hero.imageUrl", "")}
                                    videoUrl={getText("hero.videoUrl", "")}
                                    youtubeUrl={getText("hero.youtubeUrl", "")}
                                    posterUrl={getText("hero.posterUrl", "")}
                                    alt={t("invest.hero.alt", "Invest in Algarve real estate")}
                                    fallback={<PageHeroImage page="invest" alt={t("invest.hero.alt", "Invest in Algarve real estate")} />}
                                />
                            }
                        />
                    </CmsBlock>
                )}

                {cities.length > 0 && isBlockEnabled("city-hubs", true) ? (
                    <div className="app-container content-max pb-16 pt-[calc(4rem+10px)] sm:pt-[calc(5rem+10px)]">
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
                                                    {t("invest.featuredCityHub", "Featured City Hub")}
                                                </p>
                                                <h2 className="font-serif text-3xl md:text-4xl leading-tight">
                                                    {featuredCity.name}
                                                </h2>
                                                <p className="mt-3 max-w-2xl text-sm text-white/85">
                                                    {featuredCity.short_description ||
                                                        t("invest.featuredCityHubDescription", "Explore curated investment opportunities in {{name}}, Algarve.", { name: featuredCity.name })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                            {t("invest.cityIndex", "City Index")}
                                        </p>
                                        <h2 className="mt-3 font-serif text-2xl text-foreground">
                                            {t("invest.exploreAlgarveCities", "Explore Algarve Cities")}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {t("invest.cityIndexDescription", "Browse investment zones, market data, and property guides by city.")}
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
                                        <h2 className="font-serif text-2xl text-foreground">{t("invest.allActiveCityHubs", "All Active City Hubs")}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t("invest.allActiveCityHubsDescription", "Discover every investment zone across the Algarve.")}
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
                                                            t("invest.cityFallbackDescription", "Premium investment opportunities and lifestyle infrastructure.")}
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

                {isBlockEnabled("market-overview", true) && <CmsBlock pageId="invest" blockId="market-overview" as="section" className="pt-8 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="grid gap-10 lg:gap-14">
                        <div className="text-center max-w-4xl mx-auto">
                            <Badge variant="gold" className="uppercase tracking-[0.2em] text-[11px] px-4 py-1.5">
                                {t("invest.intelligence.label", "Investment Intelligence")}
                            </Badge>
                            <h2 className="text-3xl font-serif font-semibold mt-4 mb-6">
                                {t("invest.intelligence.title", "Strategic Investment in Southern Portugal")}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t(
                                    "invest.intelligence.description",
                                    "The Algarve combines stable international demand, premium lifestyle infrastructure, and constrained top-tier supply. This creates a strong base for both wealth preservation and yield-focused strategies.",
                                )}
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t("invest.kpi.supply.label", "Premium Supply")}</p>
                                <p className="text-2xl font-semibold text-foreground">Limited</p>
                                <p className="text-sm text-muted-foreground">{t("invest.kpi.supply.description", "Constrained coastal inventory in prime zones.")}</p>
                            </article>
                            <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t("invest.kpi.demand.label", "International Demand")}</p>
                                <p className="text-2xl font-semibold text-foreground">Year-Round</p>
                                <p className="text-sm text-muted-foreground">{t("invest.kpi.demand.description", "Leisure, relocation, and second-home buyer depth.")}</p>
                            </article>
                            <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t("invest.kpi.access.label", "Air Connectivity")}</p>
                                <p className="text-2xl font-semibold text-foreground">Strong</p>
                                <p className="text-sm text-muted-foreground">{t("invest.kpi.access.description", "Direct routes supporting occupancy continuity.")}</p>
                            </article>
                            <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t("invest.kpi.execution.label", "Execution Model")}</p>
                                <p className="text-2xl font-semibold text-foreground">Guided</p>
                                <p className="text-sm text-muted-foreground">{t("invest.kpi.execution.description", "Advisory-led process from screening to operation.")}</p>
                            </article>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {strategyTracks.map((track) => (
                                <article key={track.title} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                                    <track.icon className="h-5 w-5 text-primary" />
                                    <h3 className="font-serif text-2xl text-foreground">{track.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{track.description}</p>
                                </article>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 lg:p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-serif font-semibold">
                                    {t("invest.planner.title", "Return Planning Snapshot")}
                                </h3>
                                <p className="text-muted-foreground mt-2">
                                    {t(
                                        "invest.planner.subtitle",
                                        "Quick scenario model for planning discussions. Final outcomes depend on asset, financing, taxes, and operations.",
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="purchasePrice">{t("invest.planner.purchasePrice", "Purchase Price")}</Label>
                                        <Input
                                            id="purchasePrice"
                                            type="number"
                                            min={200000}
                                            step={50000}
                                            value={purchasePrice}
                                            onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>{t("invest.planner.occupancy", "Occupancy Rate")}</Label>
                                            <span className="text-sm text-muted-foreground">{occupancyRate}%</span>
                                        </div>
                                        <Slider value={[occupancyRate]} min={30} max={90} step={1} onValueChange={(value) => setOccupancyRate(value[0] ?? 0)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nightlyRate">{t("invest.planner.nightlyRate", "Average Nightly Rate")}</Label>
                                        <Input
                                            id="nightlyRate"
                                            type="number"
                                            min={80}
                                            step={10}
                                            value={averageNightlyRate}
                                            onChange={(e) => setAverageNightlyRate(Number(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>{t("invest.planner.holdPeriod", "Hold Period")}</Label>
                                            <span className="text-sm text-muted-foreground">{holdYears} {t("invest.planner.years", "years")}</span>
                                        </div>
                                        <Slider value={[holdYears]} min={3} max={15} step={1} onValueChange={(value) => setHoldYears(value[0] ?? 3)} />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 h-fit">
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.grossIncome", "Gross Annual Income")}</p>
                                        <p className="text-lg font-semibold">{formatEuro(projection.grossAnnualIncome)}</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.netIncome", "Net Annual Income")}</p>
                                        <p className="text-lg font-semibold">{formatEuro(projection.netAnnualIncome)}</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.grossYield", "Gross Yield")}</p>
                                        <p className="text-lg font-semibold">{projection.grossYield.toFixed(1)}%</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.netYield", "Net Yield")}</p>
                                        <p className="text-lg font-semibold">{projection.netYield.toFixed(1)}%</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1 sm:col-span-2">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.holdIncome", "Projected Net Income Over Hold Period")}</p>
                                        <p className="text-lg font-semibold">{formatEuro(projection.holdingIncome)}</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.acquisitionCosts", "Est. Acquisition Costs")}</p>
                                        <p className="text-lg font-semibold">{formatEuro(projection.acquisitionCosts)}</p>
                                    </article>
                                    <article className="rounded-xl border border-border bg-background p-4 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t("invest.planner.managementCosts", "Est. Annual Management")}</p>
                                        <p className="text-lg font-semibold">{formatEuro(projection.managementCosts)}</p>
                                    </article>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-serif font-semibold mb-6 text-center">
                                {t("invest.execution.title", "Execution Playbook")}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {executionSteps.map((step) => (
                                    <article key={step.title} className="rounded-2xl border border-border bg-card p-5">
                                        <step.icon className="h-5 w-5 text-primary mb-3" />
                                        <h3 className="font-medium text-lg mb-2">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
                            <h2 className="text-3xl font-serif font-semibold mb-3">
                                {t("invest.cta.title", "Build Your Algarve Investment Brief")}
                            </h2>
                            <p className="text-muted-foreground max-w-3xl mx-auto">
                                {t(
                                    "invest.cta.description",
                                    "Share your budget band, target return, usage profile, and timeline. We will map a tailored acquisition strategy and a practical execution path.",
                                )}
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href={l("/contact")}>
                                    <Button variant="gold" size="lg">
                                        <BadgeEuro className="h-4 w-4" />
                                        {t("invest.cta.primary", "Request Investment Brief")}
                                    </Button>
                                </Link>
                                <Link href={l("/directory?category=algarve-services")}>
                                    <Button variant="outline" size="lg">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {t("invest.cta.secondary", "Browse Algarve Services")}
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CmsBlock>}
            </main>

            <Footer />
        </div>
    );
};

export default Invest;
