"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { useFooterMenu } from "@/hooks/useFooterMenu";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FooterNav } from "@/components/layout/FooterNav";
import { toast } from "sonner";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import { openCookiePreferences } from "@/lib/cookieConsent";
import { LOCALE_PREFIX_PATTERN } from "@/lib/i18n/config";

// Fallback data for when database is empty or loading
const fallbackLinks = {
  regions: [
    { name: "Golden Triangle", href: "/destinations/golden-triangle" },
    { name: "Vilamoura Prestige", href: "/destinations/vilamoura-prestige" },
    { name: "Carvoeiro Cliffs", href: "/destinations/carvoeiro-cliffs" },
    { name: "Lagos Signature", href: "/destinations/lagos-signature" },
    { name: "Tavira Heritage", href: "/destinations/tavira-heritage" },
  ],
  categories: [
    { name: "Places to Stay", href: "/directory?category=places-to-stay", translationKey: "categories.luxuryAccommodation" },
    { name: "Restaurants", href: "/directory?category=restaurants", translationKey: "categories.restaurants" },
    { name: "Golf & Tournaments", href: "/directory?category=golf", translationKey: "categories.golf" },
    { name: "Things to Do", href: "/directory?category=things-to-do", translationKey: "categories.luxuryExperiences" },
    { name: "What's On", href: "/directory?category=whats-on", translationKey: "categories.premierEvents" },
    { name: "Algarve Services", href: "/directory?category=algarve-services", translationKey: "categories.algarveServices" },
  ],
  company: [
    { name: "About Us", href: "/about-us", translationKey: "footer.aboutUs" },
    { name: "Partner Pricing", href: "/pricing", translationKey: "footer.pricing" },
    { name: "Become a Partner", href: "/partner", translationKey: "footer.becomePartner" },
    { name: "Blog", href: "/blog", translationKey: "nav.blog" },
    { name: "Events", href: "/events", translationKey: "nav.events" },
    { name: "Contact", href: "/contact", translationKey: "footer.contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy", translationKey: "footer.privacyPolicy" },
    { name: "Terms of Service", href: "/terms", translationKey: "footer.termsOfService" },
    { name: "Cookie Policy", href: "/cookie-policy", translationKey: "footer.cookiePolicy" },
  ],
};

// Section title translation keys
const sectionTitleKeys: Record<string, string> = {
  regions: "footer.sections.regions",
  categories: "footer.sections.categories",
  company: "footer.sections.company",
  legal: "footer.sections.legal",
};

// Link name to translation key mapping (for database items)
const linkTranslationKeys: Record<string, string> = {
  // Categories
  "Places to Stay": "categories.luxuryAccommodation",
  "Things to Do": "categories.luxuryExperiences",
  "What's On": "categories.premierEvents",
  "Accommodation": "categories.luxuryAccommodation",
  "Luxury Accommodation": "categories.luxuryAccommodation",
  "Gastronomy": "categories.restaurants",
  "Restaurants": "categories.restaurants",
  "Restaurants & Michelin": "categories.restaurants",
  "Golf & Tournaments": "categories.golf",
  "Beaches & Beach Clubs": "categories.beachClubs",
  "Wellness & Spas": "categories.wellnessSpas",
  "Private Dining": "categories.restaurants",
  "Concierge Services": "categories.algarveServices",
  "Algarve Experience": "categories.luxuryExperiences",
  "Luxury Experiences": "categories.luxuryExperiences",
  "Family Attractions": "categories.luxuryExperiences",
  "VIP Transportation": "categories.algarveServices",
  "Prime Real Estate": "categories.algarveServices",
  "Premier Events": "categories.premierEvents",
  "Architecture & Decoration": "categories.algarveServices",
  "Protection Services": "categories.algarveServices",
  "Algarve Services": "categories.algarveServices",
  "Shopping & Boutiques": "categories.shoppingBoutiques",
  // Company
  "About Us": "footer.aboutUs",
  "Become a Partner": "footer.becomePartner",
  "Blog": "footer.blog",
  "Events": "footer.events",
  "Contact": "footer.contact",
  // Legal
  "Privacy Policy": "footer.privacyPolicy",
  "Terms of Service": "footer.termsOfService",
  "Cookie Policy": "footer.cookiePolicy",
};

const FOOTER_CATEGORY_SLUG_BY_NAME: Record<string, string> = {
  "places to stay": "places-to-stay",
  "place to stay": "places-to-stay",
  accommodation: "places-to-stay",
  "luxury accommodation": "places-to-stay",
  restaurants: "restaurants",
  gastronomy: "restaurants",
  "fine dining": "restaurants",
  "restaurants & michelin": "restaurants",
  "golf & tournaments": "golf",
  "golf experiences": "golf",
  "beaches & beach clubs": "beaches-clubs",
  "beaches & clubs": "beaches-clubs",
  "wellness & spas": "wellness-spas",
  "things to do": "things-to-do",
  "luxury experiences": "things-to-do",
  "algarve experience": "things-to-do",
  "family attractions": "things-to-do",
  "what's on": "whats-on",
  "whats on": "whats-on",
  "premier events": "whats-on",
  "algarve services": "algarve-services",
  "concierge services": "algarve-services",
  "vip concierge": "algarve-services",
  "vip transportation": "algarve-services",
  "prime real estate": "algarve-services",
  "architecture & decoration": "algarve-services",
  "protection services": "algarve-services",
  "shopping & boutiques": "shopping-boutiques",
};

const LEGACY_FOOTER_CATEGORY_SLUG_BY_PARAM: Record<string, string> = {
  "1": "places-to-stay",
  "2": "restaurants",
  "3": "golf",
  "4": "beaches-clubs",
  "5": "things-to-do",
  "6": "wellness-spas",
  "7": "whats-on",
  "8": "algarve-services",
  "9": "shopping-boutiques",
};

/** Use centralized regex that includes ALL locales (including "en") */
const LANGUAGE_PREFIX_RE = LOCALE_PREFIX_PATTERN;
const NUMERIC_PARAM_RE = /^\d+$/;

function normalizeFooterLinkHref(
  href: string,
  name: string,
  sectionSlug: string,
  localizedHref: (path: string) => string,
): string {
  if (!href || href.startsWith("http")) {
    return href;
  }

  if (sectionSlug === "categories" && href.startsWith("/directory")) {
    const [path, query = ""] = href.split("?");
    const params = new URLSearchParams(query);
    const rawCategoryParam = params.get("category");
    const normalizedName = name.trim().toLowerCase();
    const normalizedCategoryParam = rawCategoryParam?.trim().toLowerCase() || "";
    const resolvedCategoryFromParam = normalizedCategoryParam
      ? NUMERIC_PARAM_RE.test(normalizedCategoryParam)
        ? LEGACY_FOOTER_CATEGORY_SLUG_BY_PARAM[normalizedCategoryParam]
        : getCanonicalCategorySlug(normalizedCategoryParam)
      : undefined;

    const canonicalCategorySlug =
      FOOTER_CATEGORY_SLUG_BY_NAME[normalizedName] ||
      resolvedCategoryFromParam;

    if (canonicalCategorySlug) {
      params.set("category", canonicalCategorySlug);
      const normalizedPath = `${path}?${params.toString()}`;
      return !LANGUAGE_PREFIX_RE.test(normalizedPath)
        ? localizedHref(normalizedPath)
        : normalizedPath;
    }
  }

  return !LANGUAGE_PREFIX_RE.test(href) ? localizedHref(href) : href;
}

export default function Footer() {
  const { data: footerSections } = useFooterMenu();
  const { t } = useTranslation();
  const l = useLocalePath();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { subscribe, isSubmitting } = useNewsletterSignup("footer-newsletter");

  const handleNewsletterSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const status = await subscribe({ email: newsletterEmail });

    if (status === "empty_email") {
      toast.error(t("newsletter.errorEmpty"));
      return;
    }

    if (status === "invalid_email") {
      toast.error(t("newsletter.errorInvalid"));
      return;
    }

    if (status === "rate_limited") {
      toast.error(t("newsletter.errorRateLimit"));
      return;
    }

    if (status === "error") {
      toast.error(t("newsletter.errorGeneric"));
      return;
    }

    toast.success(
      status === "already_subscribed"
        ? t("newsletter.alreadySubscribed")
        : t("newsletter.welcomeMessage"),
    );
    setNewsletterEmail("");
  }, [newsletterEmail, subscribe, t]);

  // Render a section column
  const renderSection = (
    title: string,
    titleKey: string | null,
    sectionSlug: string,
    links: Array<{ name: string; href: string; open_in_new_tab?: boolean; translationKey?: string }>
  ) => (
    <div key={title}>
      <h3 className="text-sm font-medium text-foreground tracking-wide uppercase mb-4">
        {titleKey ? t(titleKey) : title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => {
          const displayName = link.translationKey ? t(link.translationKey) : link.name;
          const resolvedHref = normalizeFooterLinkHref(link.href, link.name, sectionSlug, l);
          return (
            <li key={link.name}>
              {resolvedHref.startsWith("http") || link.open_in_new_tab ? (
                <a
                  href={resolvedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {displayName}
                </a>
              ) : (
                <Link
                  href={resolvedHref}
                  className="text-body-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {sectionSlug === "legal" ? (
        <button
          type="button"
          onClick={openCookiePreferences}
          className="mt-3 text-body-sm text-left text-muted-foreground transition-colors hover:text-primary"
        >
          {t("footer.cookieSettings", "Cookie Settings")}
        </button>
      ) : null}
    </div>
  );

  // Use database data if available, otherwise fallback
  const sections = footerSections && footerSections.length > 0
    ? footerSections
      .map((section) => ({
        title: section.title,
        slug: section.slug,
        titleKey: sectionTitleKeys[section.slug] || null,
        links: section.links.map((link) => ({
          name: link.name,
          href: link.href,
          open_in_new_tab: link.open_in_new_tab,
          translationKey: linkTranslationKeys[link.name] || undefined,
        })),
      }))
    : [
      { title: "Regions", slug: "regions", titleKey: "footer.sections.regions", links: fallbackLinks.regions },
      { title: "Categories", slug: "categories", titleKey: "footer.sections.categories", links: fallbackLinks.categories },
      { title: "Company", slug: "company", titleKey: "footer.sections.company", links: fallbackLinks.company },
      { title: "Legal", slug: "legal", titleKey: "footer.sections.legal", links: fallbackLinks.legal },
    ];

  return (
    <footer className="bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2 mb-8 lg:mb-0">
            <BrandLogo size="md" />
            <p className="mt-4 text-body-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>

            <div className="mt-5 rounded-xl border border-border/70 bg-card/70 p-4">
              <p className="text-body-sm font-semibold text-foreground">
                {t("newsletter.footerTitle", "Get the free Algarve Insider Guide")}
              </p>
              <p className="mt-1 text-body-xs text-muted-foreground">
                {t("newsletter.footerSubtitle", "Monthly curated picks, events, and hidden gems.")}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-3 flex gap-2">
                <Label htmlFor="footer-newsletter-email" className="sr-only">
                  {t("newsletter.placeholder", "Email address")}
                </Label>
                <Input
                  id="footer-newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder={t("newsletter.placeholder")}
                  autoComplete="email"
                  className="h-11 text-body-xs"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="h-10 px-4 whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("newsletter.subscribing") : t("newsletter.footerCta", "Get It")}
                </Button>
              </form>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-body-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t("footer.location")}</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>{t("footer.email")}</span>
              </div>
            </div>
          </div>

        {/* Dynamic Sections */}
        {sections.map((section) => renderSection(section.title, section.titleKey, section.slug, section.links))}
        </div>

        <div className="pb-6">
          <FooterNav />
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-body-xs text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}

// Named export for components that import { Footer }
export { Footer };
