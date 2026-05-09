"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ElementType } from "react";
import { Cookie, Shield, Database, Settings, Info, CheckCircle, Clock, Globe } from "lucide-react";
import { useCookieSettings } from "@/hooks/useCookieSettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import {
  getCookiePolicyContent,
  type CookiePolicySection,
} from "@/lib/legal/cookie-policy-content";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";

const iconMap: Record<string, ElementType> = {
  Cookie,
  Shield,
  Database,
  Settings,
  Info,
  CheckCircle,
  Clock,
  Globe,
};

function shouldUseCmsSettings(locale: string, settingsId?: string | null): boolean {
  if (!settingsId) return false;
  return locale === DEFAULT_LOCALE || settingsId !== "default";
}

function formatLastUpdated(value: string | null | undefined, label: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  return /^[^:]{1,48}:\s*/.test(trimmed) ? trimmed : `${label}: ${trimmed}`;
}

const CookiePolicy = () => {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const fallbackContent = getCookiePolicyContent(locale);
  const { settings } = useCookieSettings(locale);
  const cmsSettings = shouldUseCmsSettings(locale, settings?.id) ? settings : null;
  const cmsSections =
    cmsSettings?.sections && cmsSettings.sections.length > 0
      ? cmsSettings.sections
      : null;

  const pageTitle = cmsSettings?.page_title || fallbackContent.pageTitle;
  const introduction = cmsSettings?.introduction || fallbackContent.introduction;
  const lastUpdated =
    formatLastUpdated(cmsSettings?.last_updated_date, fallbackContent.lastUpdatedLabel) ||
    fallbackContent.lastUpdated;
  const sections: CookiePolicySection[] = cmsSections || fallbackContent.sections;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-hero font-serif font-medium text-foreground mb-4">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {lastUpdated}
            </p>
          </div>

          {/* Introduction */}
          <section className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {introduction}
            </p>
          </section>

          {sections.map((section, index) => {
            const IconComponent = iconMap[section.icon] || Cookie;
            return (
              <section key={section.id || index} className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">{section.title}</h2>
                </div>
                <div
                  className="pl-9 space-y-4 text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlString(section.content) }}
                />
              </section>
            );
          })}

          {/* Footer Links */}
          <div className="border-t border-border pt-8 mt-12">
            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
              <LocaleLink href="/privacy-policy" className="hover:text-primary transition-colors">
                {t("footer.privacyPolicy")}
              </LocaleLink>
              <span>•</span>
              <LocaleLink href="/terms" className="hover:text-primary transition-colors">
                {t("footer.termsOfService")}
              </LocaleLink>
              <span>•</span>
              <LocaleLink href="/" className="hover:text-primary transition-colors">
                {t("cookiePolicy.footer.backToHome")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
