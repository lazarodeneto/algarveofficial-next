"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cookie, Shield, Database, Settings, Info, CheckCircle, Clock, Globe } from "lucide-react";
import { useCookieSettings } from "@/hooks/useCookieSettings";
import { useTranslation } from "react-i18next";
import DOMPurify from "isomorphic-dompurify";
import { LocaleLink } from "@/components/navigation/LocaleLink";

const iconMap: Record<string, React.ElementType> = {
  Cookie,
  Shield,
  Database,
  Settings,
  Info,
  CheckCircle,
  Clock,
  Globe,
};

const CookiePolicy = () => {
  const { t } = useTranslation();
  const { settings, isLoading } = useCookieSettings();

  // Use database content or fallback to defaults
  const pageTitle = settings?.page_title || t("cookiePolicy.title");
  const lastUpdated = settings?.last_updated_date || t("cookiePolicy.lastUpdated", { date: "January 21, 2026" });
  const introduction = settings?.introduction || t("cookiePolicy.introduction");
  
  const hasSections = settings?.sections && settings.sections.length > 0;

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

          {/* Dynamic Sections from Database */}
          {hasSections ? (
            settings.sections!.map((section, index) => {
              const IconComponent = iconMap[section.icon] || Cookie;
              return (
                <section key={section.id || index} className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-serif font-semibold text-foreground">{section.title}</h2>
                  </div>
                  <div 
                    className="pl-9 space-y-4 text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                  />
                </section>
              );
            })
          ) : (
            /* Default Content if no sections in database */
            <>
              {/* What Are Cookies */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">1. What Are Cookies</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <p>
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                    Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
                    as well as to provide reporting information.
                  </p>
                  <p>
                    Cookies set by the website owner (in this case, AlgarveOfficial) are called "first-party cookies." 
                    Cookies set by parties other than the website owner are called "third-party cookies."
                  </p>
                </div>
              </section>

              {/* Types of Cookies */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">2. Types of Cookies We Use</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-foreground">Type</th>
                          <th className="text-left p-3 font-semibold text-foreground">Purpose</th>
                          <th className="text-left p-3 font-semibold text-foreground">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border">
                          <td className="p-3 font-medium">Essential</td>
                          <td className="p-3">Authentication, security, language preferences</td>
                          <td className="p-3">Session / 1 year</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-medium">Functional</td>
                          <td className="p-3">Theme preferences, user settings</td>
                          <td className="p-3">1 year</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-medium">Analytics</td>
                          <td className="p-3">Page views, session tracking (with consent)</td>
                          <td className="p-3">90 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Essential Cookies */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">3. Essential Cookies</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <p>
                    These cookies are strictly necessary for the website to function and cannot be switched off in our systems. 
                    They are usually only set in response to actions made by you which amount to a request for services, such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Setting your privacy preferences</li>
                    <li>Logging in to your account</li>
                    <li>Filling in forms</li>
                    <li>Maintaining security</li>
                  </ul>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                    <p className="text-sm">
                      You can set your browser to block or alert you about these cookies, but some parts of the site 
                      will not function properly without them.
                    </p>
                  </div>
                </div>
              </section>

              {/* Analytics Cookies */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">4. Analytics Cookies</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <p>
                    These cookies allow us to count visits and traffic sources so we can measure and improve the 
                    performance of our site. They help us know which pages are the most and least popular and 
                    see how visitors move around the site.
                  </p>
                  <p>
                    All information these cookies collect is aggregated and anonymous. We only set these cookies 
                    after you have given us your explicit consent through our cookie consent banner.
                  </p>
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-2">Data we collect with your consent:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Pages visited and time spent</li>
                      <li>Anonymized IP address (last two octets masked)</li>
                      <li>Browser and device type</li>
                      <li>Referral source</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Managing Cookies */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">5. Managing Your Cookie Preferences</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Cookie Consent Banner:</strong> When you first visit our site, you can accept or reject non-essential cookies</li>
                    <li><strong>Browser Settings:</strong> You can set your browser to refuse all or some cookies</li>
                    <li><strong>Local Storage:</strong> Clear your browser's local storage to reset your preferences</li>
                  </ul>
                  <p>
                    Please note that if you choose to reject cookies, you may still use our website though your access 
                    to some functionality and areas may be restricted.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-serif font-semibold text-foreground">6. Contact Us</h2>
                </div>
                <div className="pl-9 space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about our use of cookies, please contact us:
                  </p>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p><strong>Email:</strong> info@algarveofficial.com</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Footer Links */}
          <div className="border-t border-border pt-8 mt-12">
            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
              <LocaleLink href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </LocaleLink>
              <span>•</span>
              <LocaleLink href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </LocaleLink>
              <span>•</span>
              <LocaleLink href="/" className="hover:text-primary transition-colors">
                Back to Home
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
