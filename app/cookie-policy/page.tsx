import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/gdpr/CookiePreferencesButton";
import { Cookie, Shield, Database, Settings, Info, CheckCircle, Clock, Globe, BarChart, Megaphone, Eye, Lock } from "lucide-react";
import { getCookieSettings } from "@/lib/cookie-settings";

export const metadata = {
  title: "Cookie Policy | AlgarveOfficial",
  description: "Learn how AlgarveOfficial uses cookies and similar technologies to improve your browsing experience.",
};

const iconMap: Record<string, React.ElementType> = {
  Cookie,
  Shield,
  Database,
  Settings,
  Info,
  CheckCircle,
  Clock,
  Globe,
  BarChart,
  Megaphone,
  Eye,
  Lock,
};

const COOKIE_CATEGORIES = [
  {
    id: "essential",
    icon: Lock,
    title: "Strictly Necessary Cookies",
    description: "Essential cookies are required for the website to function. They cannot be switched off.",
    legalBasis: "Legitimate interest - Security",
    cookies: [
      { name: "cookie_consent_preferences", purpose: "Stores your cookie consent choices", duration: "1 year" },
      { name: "sb-access-token", purpose: "Authentication token for logged-in users", duration: "Session" },
      { name: "sb-refresh-token", purpose: "Session refresh token", duration: "30 days" },
      { name: "algarve_session_id", purpose: "Anonymous session identifier", duration: "Session" },
    ],
    canDisable: false,
  },
  {
    id: "functional",
    icon: Settings,
    title: "Functional Cookies",
    description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
    legalBasis: "Consent",
    cookies: [
      { name: "algarve-theme", purpose: "Stores your light/dark mode preference", duration: "1 year" },
    ],
    canDisable: true,
  },
  {
    id: "analytics",
    icon: BarChart,
    title: "Analytics Cookies",
    description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    legalBasis: "Consent",
    cookies: [
      { name: "_ga", purpose: "Google Analytics - distinguishes users", duration: "2 years" },
      { name: "_gid", purpose: "Google Analytics - distinguishes users", duration: "24 hours" },
      { name: "_gat", purpose: "Google Analytics - rate limiting", duration: "1 minute" },
    ],
    canDisable: true,
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Marketing Cookies",
    description: "These cookies may be used to track browsing behavior across websites to build visitor profiles for advertising purposes.",
    legalBasis: "Consent",
    cookies: [
      { name: "_gac_*", purpose: "Google Ads - campaign tracking", duration: "90 days" },
    ],
    canDisable: true,
  },
];

export default async function CookiePolicyPage() {
  const settings = await getCookieSettings();

  const pageTitle = settings?.page_title || "Cookie Policy";
  const lastUpdated = settings?.last_updated_date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const introduction = settings?.introduction || 
    "This Cookie Policy explains how AlgarveOfficial uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.";
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-hero font-serif font-medium text-foreground mb-4">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <span>🇪🇺</span> EU GDPR Compliant
              </span>
              <span className="text-xs text-muted-foreground">Data kept for maximum 2 years</span>
            </div>
          </div>

          <section className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {introduction}
            </p>
          </section>

          <section className="mb-12">
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-serif font-semibold mb-4">Your Consent Rights</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Withdraw consent anytime</p>
                    <p className="text-sm text-muted-foreground">You can change your preferences at any time</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Granular control</p>
                    <p className="text-sm text-muted-foreground">Choose which categories you allow</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No essential cookies shared</p>
                    <p className="text-sm text-muted-foreground">Essential cookies stay on, others are optional</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Data portability</p>
                    <p className="text-sm text-muted-foreground">Request your data in machine-readable format</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <CookiePreferencesButton />
              </div>
            </div>
          </section>

          {COOKIE_CATEGORIES.map((category) => {
            const IconComponent = iconMap[category.icon.name] || iconMap.Cookie;
            return (
              <section key={category.id} className="mb-12">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">{category.title}</h2>
                          {!category.canDisable && (
                            <span className="px-2 py-0.5 text-xs bg-muted rounded">Required</span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{category.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Legal basis:</span>{" "}
                          <span className="text-muted-foreground">{category.legalBasis}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="pb-3 font-medium">Cookie Name</th>
                          <th className="pb-3 font-medium">Purpose</th>
                          <th className="pb-3 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.cookies.map((cookie) => (
                          <tr key={cookie.name} className="border-b border-border last:border-0">
                            <td className="py-3 font-mono text-xs">{cookie.name}</td>
                            <td className="py-3 text-muted-foreground">{cookie.purpose}</td>
                            <td className="py-3 text-muted-foreground">{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold">How We Use Your Data</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                The data collected by cookies is used for the following purposes:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Analytics:</strong> Understanding how visitors use our website to improve user experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Security:</strong> Protecting against fraud and unauthorized access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Functionality:</strong> Remembering your preferences for a better experience</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold">Data Retention</h2>
            </div>
            <div className="pl-9 space-y-4">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Data Type</th>
                      <th className="text-left p-3 font-semibold">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-3">Analytics Events</td>
                      <td className="p-3">90 days (automatically purged)</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Consent Records</td>
                      <td className="p-3">2 years</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Essential Cookies</td>
                      <td className="p-3">Session / 1 year (preferences)</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-3">Marketing Data</td>
                      <td className="p-3">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold">Third-Party Services</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                We use the following third-party services that may set cookies:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Google Analytics</h3>
                  <p className="text-sm">
                    Used for website analytics. Data is anonymized and stored for 90 days.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Supabase</h3>
                  <p className="text-sm">
                    Authentication and database services. Essential for site functionality.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-semibold">Contact Us</h2>
            </div>
            <div className="pl-9 space-y-4 text-muted-foreground">
              <p>
                If you have any questions about our use of cookies or GDPR compliance, please contact our Data Protection Officer:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>Email:</strong> privacy@algarveofficial.com</p>
                <p className="text-sm mt-2">
                  <strong>Response time:</strong> Within 30 days as required by GDPR
                </p>
              </div>
              <p>
                You also have the right to lodge a complaint with the Portuguese data protection authority:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p><strong>CNPD - Comissao Nacional de Protecao de Dados</strong></p>
                <p className="text-sm">https://www.cnpd.pt</p>
              </div>
            </div>
          </section>

          <div className="border-t border-border pt-8 mt-12">
            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/" className="hover:text-primary transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
