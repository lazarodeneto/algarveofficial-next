"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ElementType } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { Shield, Database, Clock, UserCheck, Mail, FileText } from "lucide-react";

const iconMap: Record<string, ElementType> = {
  Shield,
  Database,
  Clock,
  UserCheck,
  Mail,
  FileText,
};

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const { settings } = usePrivacySettings(locale);
  const hasCustomSections = Boolean(settings?.sections && settings.sections.length > 0);

  const pageTitle = settings?.page_title || "Privacy Policy";
  const introduction =
    settings?.introduction ||
    'AlgarveOfficial ("we", "our", or "us") is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our website and services.';
  const lastUpdatedDate = settings?.last_updated_date?.trim();
  const hasLastUpdatedPrefix = Boolean(
    lastUpdatedDate && /^last updated:/i.test(lastUpdatedDate),
  );
  const lastUpdated = lastUpdatedDate
    ? (hasLastUpdatedPrefix ? lastUpdatedDate : `Last updated: ${lastUpdatedDate}`)
    : "Last updated: January 21, 2026";

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

          {hasCustomSections ? (
            settings!.sections!.map((section, index) => {
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
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }}
                  />
                </section>
              );
            })
          ) : (
            <>
          {/* Data Controller */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">1. Data Controller</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                AlgarveOfficial is the data controller responsible for your personal data. If you have 
                any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Email:</strong> info@algarveofficial.com</p>
                <p><strong>Address:</strong> Algarve, District of Faro, Portugal</p>
              </div>
            </div>
          </section>

          {/* Data We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">2. Data We Collect</h2>
            </div>
            <div className="pl-9 space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2.1 Information You Provide</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account Data:</strong> Name, email address, and password when you create an account</li>
                  <li><strong>Profile Data:</strong> Optional information such as phone number, bio, and profile picture</li>
                  <li><strong>Communication Data:</strong> Messages you send through our platform to listing owners</li>
                  <li><strong>Listing Data:</strong> Information provided by business owners for their listings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2.2 Automatically Collected Data</h3>
                <p className="mb-3">
                  <strong>Only with your explicit consent</strong>, we may collect:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Analytics Data:</strong> Page views, session duration, and interaction patterns</li>
                  <li><strong>Technical Data:</strong> Browser type, device type, and anonymized IP address (last two octets masked)</li>
                  <li><strong>Session Identifiers:</strong> Anonymous session IDs for view deduplication</li>
                </ul>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <p className="text-sm">
                    <strong>Important:</strong> We do not collect any analytics data without your explicit consent. 
                    You can manage your preferences through our cookie consent banner at any time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">3. Legal Basis for Processing</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We process your personal data based on the following legal grounds:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Consent:</strong> For analytics and marketing communications (you can withdraw at any time)</li>
                <li><strong>Contract:</strong> To provide our services when you create an account or use our platform</li>
                <li><strong>Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">4. How We Use Your Data</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide and maintain our services</li>
                <li>To process your account registration and manage your profile</li>
                <li>To facilitate communication between users and listing owners</li>
                <li>To improve our website and user experience (with consent)</li>
                <li>To send service-related notifications</li>
                <li>To detect and prevent fraud and security threats</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">5. Data Retention</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We retain your personal data only for as long as necessary:</p>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-foreground">Data Type</th>
                      <th className="text-left p-3 font-semibold text-foreground">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-3">Account Data</td>
                      <td className="p-3">Until account deletion + 30 days</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Analytics Events</td>
                      <td className="p-3">90 days (automatically purged)</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">View Tracking Data</td>
                      <td className="p-3">90 days (automatically purged)</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Messages</td>
                      <td className="p-3">Until conversation deletion</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Security Audit Logs</td>
                      <td className="p-3">1 year (for security purposes)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">6. Your Rights Under GDPR</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>As a data subject, you have the following rights:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right of Access</h4>
                  <p className="text-sm">Request a copy of your personal data we hold</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right to Rectification</h4>
                  <p className="text-sm">Request correction of inaccurate or incomplete data</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right to Erasure</h4>
                  <p className="text-sm">Request deletion of your personal data ("right to be forgotten")</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right to Restrict Processing</h4>
                  <p className="text-sm">Request limitation of how we use your data</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right to Data Portability</h4>
                  <p className="text-sm">Receive your data in a structured, machine-readable format</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Right to Object</h4>
                  <p className="text-sm">Object to processing based on legitimate interests</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 md:col-span-2">
                  <h4 className="font-semibold text-foreground mb-2">Right to Withdraw Consent</h4>
                  <p className="text-sm">Withdraw your consent at any time for consent-based processing (e.g., analytics)</p>
                </div>
              </div>
              <p className="mt-4">
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:info@algarveofficial.com" className="text-primary hover:underline">
                  info@algarveofficial.com
                </a>
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">7. Data Security</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We implement appropriate technical and organizational measures to protect your data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Row-Level Security (RLS) policies ensuring users can only access their own data</li>
                <li>Automatic IP address anonymization at the database level</li>
                <li>Regular security audits and access logging</li>
                <li>Strict access controls for administrative functions</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">8. Cookies and Tracking</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We use the following types of cookies:</p>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-foreground">Type</th>
                      <th className="text-left p-3 font-semibold text-foreground">Purpose</th>
                      <th className="text-left p-3 font-semibold text-foreground">Consent Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-3">Essential</td>
                      <td className="p-3">Authentication, security, language preferences</td>
                      <td className="p-3">No</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Analytics</td>
                      <td className="p-3">Page views, session tracking, usage patterns</td>
                      <td className="p-3">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                You can manage your cookie preferences at any time through the cookie consent banner 
                or by clearing your browser's local storage.
              </p>
            </div>
          </section>

          {/* Third Parties */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">9. Third-Party Services</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We use the following third-party services that may process your data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Supabase:</strong> Database and authentication services (EU-based infrastructure available)</li>
                <li><strong>Google:</strong> Optional OAuth authentication (if you choose to sign in with Google)</li>
              </ul>
              <p>
                All third-party processors are bound by data processing agreements ensuring GDPR compliance.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">10. International Data Transfers</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
                When this occurs, we ensure appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent data protection</li>
                <li>Binding corporate rules for group companies</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">11. Contact Us</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy, wish to exercise your rights, 
                or have a complaint, please contact us:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Email:</strong> info@algarveofficial.com</p>
                <p><strong>Response Time:</strong> Within 30 days as required by GDPR</p>
              </div>
              <p>
                You also have the right to lodge a complaint with your local data protection authority. 
                In Portugal, this is the Comissão Nacional de Proteção de Dados (CNPD).
              </p>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">12. Changes to This Policy</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically.
              </p>
            </div>
          </section>
            </>
          )}

          {/* Back Link */}
          <div className="text-center pt-8 border-t border-border">
            <Link 
              href="/" 
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              ← {t("cookiePolicy.footer.backToHome", "Back to Home")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
