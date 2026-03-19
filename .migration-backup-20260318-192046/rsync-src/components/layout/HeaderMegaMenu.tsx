import React from "react";
import { Link, useLocation, useNavigate } from "@/components/router/nextRouterCompat";
import { useTranslation } from "react-i18next";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useHeaderMenu } from "@/hooks/useHeaderMenu";
import { getMenuIcon } from "@/lib/menu-icons";
import {
    MapPin,
    Home,
    TrendingUp,
    Binoculars,
    Building2,
    Hotel,
    Utensils,
    Compass,
    Palmtree,
    Trophy,
    Dumbbell,
    Users,
    ShoppingBag,
    Calendar,
    PlusCircle,
    ArrowRight,
} from "lucide-react";

// Region images
import imgVilamoura from "@/assets/region-vilamoura-800w.webp";
import imgGoldenTriangle from "@/assets/region-golden-triangle-800w.webp";
import imgTavira from "@/assets/region-tavira-800w.webp";

// ─── Item definitions ─────────────────────────────────────────────────────────

const visitItems = [
    { href: "/directory?category=places-to-stay", label: "Places to Stay", translationKey: "categoryNames.places-to-stay", desc: "Hotels, villas & resorts", icon: Hotel },
    { href: "/directory?category=restaurants", label: "Restaurants", translationKey: "categoryNames.restaurants", desc: "Michelin stars & gourmet", icon: Utensils },
    { href: "/directory?category=golf", label: "Golf & Tournaments", translationKey: "categoryNames.golf", desc: "World-class courses", icon: Trophy },
    { href: "/directory?category=beaches-clubs", label: "Beaches & Clubs", translationKey: "categoryNames.beaches-clubs", desc: "Pristine beaches & exclusives", icon: Palmtree },
    { href: "/directory?category=wellness-spas", label: "Wellness & Spas", translationKey: "categoryNames.wellness-spas", desc: "Relaxation & rejuvenation", icon: Dumbbell },
    { href: "/directory?category=algarve-services", label: "Algarve Services", translationKey: "categoryNames.algarve-services", desc: "Concierge, transport, security & real estate", icon: Users },
    { href: "/directory?category=things-to-do", label: "Things to Do", translationKey: "categoryNames.things-to-do", desc: "Unforgettable activities", icon: Compass },
    { href: "/directory?category=whats-on", label: "What's On", translationKey: "categoryNames.whats-on", desc: "Exclusive galas & conferences", icon: Calendar },
    { href: "/directory?category=shopping-boutiques", label: "Shopping & Boutiques", translationKey: "categoryNames.shopping-boutiques", desc: "Designer brands & premium shops", icon: ShoppingBag },
];

const liveItems = [
    { href: "/directory?category=wellness-spas", label: "Wellness & Spas", translationKey: "categoryNames.wellness-spas", desc: "Health & relaxation", icon: Dumbbell },
    { href: "/directory?category=restaurants", label: "Restaurants", translationKey: "categoryNames.restaurants", desc: "Restaurants and private dining", icon: Utensils },
    { href: "/directory?category=algarve-services", label: "Algarve Services", translationKey: "categoryNames.algarve-services", desc: "Lifestyle, mobility, property and security", icon: Users },
    { href: "/directory?category=things-to-do", label: "Things to Do", translationKey: "categoryNames.things-to-do", desc: "Family and premium activities", icon: Compass },
    { href: "/directory?category=whats-on", label: "What's On", translationKey: "categoryNames.whats-on", desc: "Social gatherings & entry", icon: Calendar },
    { href: "/directory?category=shopping-boutiques", label: "Shopping & Boutiques", translationKey: "categoryNames.shopping-boutiques", desc: "Exclusive stores & brands", icon: ShoppingBag },
];

const investItems = [
    { href: "/real-estate", label: "Real Estate Directory", desc: "Independent listings focused on property investment", icon: Building2 },
    { href: "/invest", label: "Why Invest", desc: "Algarve market insights & data", icon: TrendingUp },
    { href: "/partner", label: "Add Real Estate Listing", desc: "Submit your property as an agency or owner", icon: PlusCircle },
    { href: "/map", label: "Map Explorer", desc: "Clustered view across all listings", icon: MapPin },
];

// ─── Section config ───────────────────────────────────────────────────────────

const sections = {
    visit: {
        value: "visit",
        label: "nav.visit",
        icon: Binoculars,
        navPath: "/directory?category=places-to-stay",
        image: imgVilamoura,
        imageAlt: "Vilamoura marina at sunset",
        accent: "#B8860B",          // dark gold
        accentLight: "#FDE68A",     // light gold for text on dark bg
        accentBright: "#F5C842",
        pill: "text-amber-700 bg-amber-50 border-amber-200",
        pillLabel: "Visit",
        navBorder: "border-black dark:border-white",
        heroTitle: "Visit Algarve",
        heroDesc: "World-class experiences along Europe's most beautiful coastline.",
        heroLink: "/directory",
        heroLabel: "Explore all",
        items: visitItems,
    },
    live: {
        value: "live",
        label: "nav.live",
        icon: Home,
        navPath: "/directory",
        image: imgGoldenTriangle,
        imageAlt: "Golden Triangle premium villas",
        accent: "#1D4ED8",
        accentLight: "#BAE6FD",
        accentBright: "#60A5FA",
        pill: "text-blue-700 bg-blue-50 border-blue-200",
        pillLabel: "Live",
        navBorder: "border-black dark:border-white",
        heroTitle: "Live in Algarve",
        heroDesc: "Everything you need to make the Algarve your permanent home.",
        heroLink: "/directory",
        heroLabel: "Learn more",
        items: liveItems,
    },
    invest: {
        value: "invest",
        label: "nav.invest",
        icon: TrendingUp,
        navPath: "/invest",
        image: imgTavira,
        imageAlt: "Tavira historic architecture",
        accent: "#065F46",
        accentLight: "#A7F3D0",
        accentBright: "#4ADE80",
        pill: "text-emerald-700 bg-emerald-50 border-emerald-200",
        pillLabel: "Invest",
        navBorder: "border-black dark:border-white",
        heroTitle: "Invest in Algarve",
        heroDesc: "Secure your piece of paradise and build lasting value.",
        heroLink: "/invest",
        heroLabel: "Explore strategy",
        items: investItems,
    },
};

type SectionKey = keyof typeof sections;
type HeaderRuntimeSection = (typeof sections)[SectionKey] & {
    displayLabel: string;
    navPath: string;
    icon: React.ElementType;
    openInNewTab: boolean;
};

// ─── Main component ───────────────────────────────────────────────────────────
function useHeaderRuntimeSections(): HeaderRuntimeSection[] {
    const { t } = useTranslation();
    const { data: headerMenuItems = [] } = useHeaderMenu();
    const sectionEntries = React.useMemo(() => Object.entries(sections) as Array<[SectionKey, (typeof sections)[SectionKey]]>, []);
    
    return React.useMemo(() => {
        const normalizedItems = [...headerMenuItems].sort((a, b) => a.display_order - b.display_order);
        const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

        const byKey = {
            visit: normalizedItems.find((item) => {
                const key = normalize(item.translation_key);
                const name = normalize(item.name);
                return key === "nav.visit" || name === "visit";
            }),
            live: normalizedItems.find((item) => {
                const key = normalize(item.translation_key);
                const name = normalize(item.name);
                return key === "nav.live" || name === "live";
            }),
            invest: normalizedItems.find((item) => {
                const key = normalize(item.translation_key);
                const name = normalize(item.name);
                return key === "nav.invest" || name === "invest";
            }),
        };

        const allMappedByKey = byKey.visit && byKey.live && byKey.invest;
        const canMapByOrder = normalizedItems.length === 3;

        return sectionEntries.map(([sectionKey, section], index) => {
            const mappedItem = allMappedByKey
                ? byKey[sectionKey]
                : canMapByOrder
                    ? normalizedItems[index]
                    : null;

            if (!mappedItem) {
                return {
                    ...section,
                    displayLabel: t(section.label),
                    navPath: section.navPath,
                    icon: section.icon,
                    openInNewTab: false,
                };
            }

            return {
                ...section,
                displayLabel: mappedItem.translation_key
                    ? t(mappedItem.translation_key, mappedItem.name)
                    : mappedItem.name,
                navPath: mappedItem.href || section.navPath,
                icon: sectionKey === "visit" ? Binoculars : getMenuIcon(mappedItem.icon),
                openInNewTab: mappedItem.open_in_new_tab,
            };
        });
    }, [headerMenuItems, sectionEntries, t]);
}

export function HeaderCompactNav() {
    const runtimeSections = useHeaderRuntimeSections();

    return (
        <div className="hidden md:flex lg:hidden min-w-0 flex-1 items-center justify-center">
            <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
                {runtimeSections.map((section) => {
                    const SectionIcon = section.icon;

                    return (
                        <Link
                            key={section.value}
                            href={section.navPath}
                            target={section.openInNewTab ? "_blank" : undefined}
                            rel={section.openInNewTab ? "noopener noreferrer" : undefined}
                            className={cn(
                                "header-nav-pill inline-flex items-center gap-1.5 lg:gap-2 rounded-full border-2 px-3 lg:px-4 py-2 lg:py-2.5",
                                "text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-all duration-200",
                                "bg-transparent text-white/90",
                                section.navBorder,
                                "hover:bg-white/10 hover:text-white",
                            )}
                        >
                            <SectionIcon className="h-[18px] w-[18px] lg:h-5 lg:w-5 flex-shrink-0 text-[#FFBB33]" />
                            <span className="truncate">{section.displayLabel}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export function HeaderMegaMenu() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = React.useState<string>("");
    const runtimeSections = useHeaderRuntimeSections();

    React.useEffect(() => { setActiveItem(""); }, [location.pathname]);

    const handleItemClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        value: string,
        path: string,
        openInNewTab = false,
    ) => {
        if (openInNewTab) {
            e.preventDefault();
            e.stopPropagation();
            window.open(path, "_blank", "noopener,noreferrer");
            setActiveItem("");
            return;
        }

        const isHoverDevice = window.matchMedia("(hover: hover)").matches;
        const isOpen = activeItem === value;
        if (isHoverDevice) {
            e.preventDefault();
            e.stopPropagation();
            navigate(path);
            setActiveItem("");
        } else {
            if (isOpen) {
                e.preventDefault();
                e.stopPropagation();
                navigate(path);
                setActiveItem("");
            } else {
                setActiveItem(value);
            }
        }
    };

    return (
        <NavigationMenu value={activeItem} onValueChange={setActiveItem} className="hidden lg:flex min-w-0">
            <NavigationMenuList className="gap-1.5 xl:gap-2 2xl:gap-3">
                {runtimeSections.map((section) => {
                    const SectionIcon = section.icon;
                    const isOpen = activeItem === section.value;
                    return (
                        <NavigationMenuItem key={section.value} value={section.value}>
                            <NavigationMenuTrigger
                                onClick={(e) => handleItemClick(e, section.value, section.navPath, section.openInNewTab)}
                                className={cn(
                                    // Base pill — larger icon/text for stronger header CTA hierarchy
                                    "header-nav-pill relative flex items-center gap-2 px-3.5 xl:px-5 2xl:px-7 py-2.5 xl:py-3 rounded-full border-2 transition-all duration-200",
                                    "text-[13px] xl:text-[15px] 2xl:text-[17px] font-bold uppercase tracking-[0.08em] xl:tracking-[0.1em] 2xl:tracking-[0.12em]",
                                    "bg-transparent shadow-none text-white/90",
                                    // Per-section border color
                                    section.navBorder,
                                    "hover:bg-white/10 hover:text-white",
                                    // Open/active state: gold border + gold glow (works on both modes)
                                    isOpen
                                        ? "border-[var(--colour-gold)] bg-[rgba(199,163,90,0.16)] text-white shadow-[0_0_18px_rgba(199,163,90,0.18)]"
                                        : "",
                                    "focus:outline-none active:scale-[0.97]",
                                    "[&>svg:last-child]:hidden",
                                )}
                            >
                                <SectionIcon className="h-5 w-5 2xl:h-6 2xl:w-6 flex-shrink-0 text-[#FFBB33]" />
                                {section.displayLabel}
                            </NavigationMenuTrigger>

                            <NavigationMenuContent>
                                <MegaPanel section={section} />
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

// ─── Mega Panel ───────────────────────────────────────────────────────────────

function MegaPanel({ section }: { section: HeaderRuntimeSection }) {
    return (
        <div className="header-mega-panel flex w-[820px] overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_-12px_rgba(0,0,0,0.22)] bg-background">

            {/* ── Left: full-bleed photo + hero text ── */}
            <div className="relative w-[280px] flex-shrink-0 overflow-hidden">
                <img
                    src={section.image.src}
                    alt={section.imageAlt}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Content pinned to bottom */}
                <div className="relative h-full flex flex-col justify-end p-7 min-h-[380px]">
                    <span className={cn(
                        "self-start text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4",
                        section.pill
                    )}>
                        {section.pillLabel}
                    </span>

                    <h3 className="text-white font-extrabold text-2xl leading-snug mb-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
                        {section.heroTitle}
                    </h3>
                    <p className="text-white/85 text-[13px] font-medium leading-relaxed mb-6 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                        {section.heroDesc}
                    </p>

                    <NavigationMenuLink asChild>
                        <Link
                            href={section.heroLink}
                            className="group self-start inline-flex items-center gap-2 text-[13px] font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 px-5 py-2.5 rounded-xl transition-all duration-200"
                        >
                            {section.heroLabel}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </NavigationMenuLink>
                </div>
            </div>

            {/* ── Right: frosted glass items column ── */}
            <div className="flex-1 p-6 bg-background">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-2">
                    Browse Categories
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                    {section.items.map((item) => (
                        <PanelItem key={item.href} item={item} accent={section.accent} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Panel Item ───────────────────────────────────────────────────────────────

function PanelItem({
    item,
    accent,
}: {
    item: { href: string; label: string; translationKey?: string; desc: string; icon: React.ElementType };
    accent: string;
}) {
    const { t } = useTranslation();
    const Icon = item.icon;
    const label = item.translationKey ? t(item.translationKey) : item.label;
    return (
        <NavigationMenuLink asChild>
            <Link
                href={item.href}
                className={cn(
                    "group flex items-start gap-3 rounded-xl px-3 py-2.5 border-2 border-transparent transition-all duration-150",
                    // Match VISIT hover/open palette
                    "hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 hover:text-[#9A6E00]",
                    "dark:hover:border-[#C9A84C] dark:hover:bg-[#C9A84C]/20 dark:hover:text-[#F5D98B]",
                    "active:bg-[#C9A84C]/15 dark:active:bg-[#C9A84C]/25",
                )}
            >
                <span
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg mt-0.5 border transition-all duration-150 group-hover:scale-105"
                    style={{
                        background: `${accent}12`,
                        borderColor: `${accent}22`,
                    }}
                >
                    <Icon
                        className="h-4 w-4 transition-colors duration-150"
                        style={{ color: accent }}
                    />
                </span>
                <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-foreground group-hover:text-[#9A6E00] dark:group-hover:text-[#F5D98B] transition-colors leading-tight truncate">
                        {label}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground group-hover:text-[#9A6E00]/80 dark:group-hover:text-[#F5D98B]/85 transition-colors leading-tight mt-0.5 truncate">
                        {item.desc}
                    </span>
                </span>
            </Link>
        </NavigationMenuLink>
    );
}
