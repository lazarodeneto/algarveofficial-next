"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ElementType } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import { useTermsSettings } from "@/hooks/useTermsSettings";
import { FileText, Scale, Users, ShieldCheck, AlertTriangle, CreditCard, Ban, Globe } from "lucide-react";

const iconMap: Record<string, ElementType> = {
  FileText,
  Scale,
  Users,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Ban,
  Globe,
};

const TermsOfService = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const { settings } = useTermsSettings(locale);
  const hasCustomSections = Boolean(settings?.sections && settings.sections.length > 0);

  const pageTitle = settings?.page_title || "Terms of Service";
  const introduction =
    settings?.introduction ||
    'Welcome to AlgarveOfficial. These Terms of Service ("Terms") govern your access to and use of the AlgarveOfficial website, services, and platform (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.';
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
              <Scale className="w-8 h-8 text-primary" />
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
              const IconComponent = iconMap[section.icon] || FileText;
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
          {/* Definitions */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">1. Definitions</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>"Platform"</strong> refers to the AlgarveOfficial website and all related services</li>
                <li><strong>"User"</strong> refers to any individual who accesses or uses the Platform</li>
                <li><strong>"Viewer"</strong> refers to Users who browse listings and content</li>
                <li><strong>"Owner"</strong> refers to Users who create and manage business listings</li>
                <li><strong>"Listing"</strong> refers to business profiles and content submitted by Owners</li>
                <li><strong>"Content"</strong> refers to all text, images, data, and materials on the Platform</li>
                <li><strong>"We", "Us", "Our"</strong> refers to AlgarveOfficial</li>
              </ul>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">2. Account Registration</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2.1 Account Creation</h3>
                <p>
                  To access certain features of the Service, you must register for an account. When registering, you agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your login credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2.2 Account Types</h3>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-foreground">Account Type</th>
                        <th className="text-left p-3 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Viewer</td>
                        <td className="p-3">Browse listings, save favorites, contact owners</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Owner</td>
                        <td className="p-3">Create and manage business listings</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Editor</td>
                        <td className="p-3">Manage content and moderate listings</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Admin</td>
                        <td className="p-3">Full platform administration access</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">2.3 Age Requirement</h3>
                <p>
                  You must be at least 18 years old to create an account and use our Service. 
                  By creating an account, you represent and warrant that you are at least 18 years of age.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">3. Acceptable Use</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>When using our Service, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Provide accurate and truthful information in listings</li>
                <li>Communicate respectfully with other users</li>
                <li>Use the Service only for its intended purposes</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">4. Prohibited Activities</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>You may not use the Service to:</p>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Impersonate any person or entity</li>
                  <li>Harass, abuse, or threaten other users</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Scrape, crawl, or collect data without authorization</li>
                  <li>Circumvent security measures or access restrictions</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Promote illegal activities or services</li>
                  <li>Violate intellectual property rights</li>
                  <li>Spam or send unsolicited commercial messages</li>
                  <li>Manipulate ratings, reviews, or engagement metrics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Listing Guidelines */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">5. Listing Guidelines (For Owners)</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">5.1 Content Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All listing information must be accurate and up-to-date</li>
                  <li>Images must be authentic representations of your business</li>
                  <li>Contact information must be valid and operational</li>
                  <li>Pricing information (if displayed) must reflect actual rates</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">5.2 Review Process</h3>
                <p>
                  All listings are subject to review before publication. We reserve the right to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Approve, reject, or request modifications to listings</li>
                  <li>Remove listings that violate our guidelines</li>
                  <li>Suspend or terminate accounts for repeated violations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">5.3 Listing Tiers</h3>
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-semibold text-foreground">Tier</th>
                        <th className="text-left p-3 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Unverified</td>
                        <td className="p-3">Free basic listing (no verification badge)</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Verified</td>
                        <td className="p-3">Paid tier with verified business badge</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3 font-medium">Signature</td>
                        <td className="p-3">Premium tier with signature badge and VIP placement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Payments */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">6. Payments and Subscriptions</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">6.1 Paid Services</h3>
                <p>
                  Certain features and listing tiers require payment. By purchasing paid services, you agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Pay all applicable fees and charges</li>
                  <li>Provide accurate billing information</li>
                  <li>Authorize recurring charges for subscriptions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">6.2 Refund Policy</h3>
                <p>
                  Refunds may be issued at our discretion. Generally:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Subscription fees are non-refundable after the first 14 days</li>
                  <li>Pro-rated refunds may be available for annual plans</li>
                  <li>Refunds will not be issued for policy violations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">6.3 Price Changes</h3>
                <p>
                  We reserve the right to modify pricing with 30 days' advance notice. 
                  Existing subscriptions will be honored until the end of their current billing period.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">7. Intellectual Property</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">7.1 Our Content</h3>
                <p>
                  The Service and its original content (excluding user-submitted content), features, 
                  and functionality are owned by AlgarveOfficial and are protected by international 
                  copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">7.2 User Content</h3>
                <p>
                  You retain ownership of content you submit. By posting content, you grant us a 
                  non-exclusive, worldwide, royalty-free license to use, display, reproduce, and 
                  distribute your content in connection with the Service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">7.3 DMCA Compliance</h3>
                <p>
                  If you believe your copyrighted work has been infringed, please contact us at{" "}
                  <a href="mailto:info@algarveofficial.com" className="text-primary hover:underline">
                    info@algarveofficial.com
                  </a>{" "}
                  with the required DMCA notice information.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">8. Disclaimers and Limitations</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.1 Service Availability</h3>
                <p>
                  The Service is provided "as is" and "as available" without warranties of any kind. 
                  We do not guarantee uninterrupted, secure, or error-free operation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.2 Third-Party Content</h3>
                <p>
                  We are not responsible for the accuracy, quality, or legality of listings or 
                  content submitted by Owners. Users interact with businesses at their own risk.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.3 Limitation of Liability</h3>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALGARVEOFFICIAL SHALL NOT BE LIABLE FOR ANY 
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF 
                    PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">8.4 Indemnification</h3>
                <p>
                  You agree to indemnify and hold harmless AlgarveOfficial from any claims, damages, 
                  or expenses arising from your use of the Service or violation of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">9. Termination</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>We may suspend or terminate your account if you:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in prohibited activities</li>
                <li>Provide false or misleading information</li>
                <li>Fail to pay for services when due</li>
              </ul>
              <p className="mt-4">
                You may terminate your account at any time by contacting us. Upon termination, 
                your right to use the Service will immediately cease.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">10. Governing Law</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Portugal, 
                without regard to its conflict of law provisions. Any disputes arising from these Terms 
                or your use of the Service shall be resolved in the courts of Faro, Portugal.
              </p>
              <p>
                For EU consumers: You may also be entitled to use the European Commission's Online 
                Dispute Resolution platform at{" "}
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </section>

          {/* Changes */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">11. Changes to Terms</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material 
                changes by posting the updated Terms and updating the "Last updated" date. Your continued 
                use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold text-foreground">12. Contact Us</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>If you have any questions about these Terms, please contact us:</p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Email:</strong> info@algarveofficial.com</p>
                <p><strong>Address:</strong> Algarve, District of Faro, Portugal</p>
              </div>
            </div>
          </section>
            </>
          )}

          {/* Related Links */}
          <div className="bg-card border border-border rounded-lg p-6 mb-12">
            <h3 className="font-semibold text-foreground mb-4">
              {t("legal.relatedPolicies", "Related Policies")}
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/privacy-policy" 
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {t("footer.privacyPolicy", "Privacy Policy")}
              </Link>
            </div>
          </div>

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

export default TermsOfService;
