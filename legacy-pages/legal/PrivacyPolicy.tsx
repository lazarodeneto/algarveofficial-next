"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ElementType } from "react";
import { useTranslation } from "react-i18next";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { Shield, Database, Clock, UserCheck, Mail, FileText } from "lucide-react";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import {
  getPrivacyPolicyContent,
  type PrivacyPolicySection,
} from "@/lib/legal/privacy-policy-content";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { sanitizeHtmlString } from "@/lib/sanitizeHtml";

const iconMap: Record<string, ElementType> = {
  Shield,
  Database,
  Clock,
  UserCheck,
  Mail,
  FileText,
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

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const locale = useCurrentLocale();
  const fallbackContent = getPrivacyPolicyContent(locale);
  const { settings } = usePrivacySettings(locale);
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
  const sections: PrivacyPolicySection[] = cmsSections || fallbackContent.sections;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
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
            const IconComponent = iconMap[section.icon] || Shield;
            return (
              <section key={section.id || index} className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div
                  className="pl-9 space-y-4 text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlString(section.content) }}
                />
              </section>
            );
          })}

          {/* Back Link */}
          <div className="text-center pt-8 border-t border-border">
            <LocaleLink 
              href="/" 
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              ← {t("cookiePolicy.footer.backToHome")}
            </LocaleLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
