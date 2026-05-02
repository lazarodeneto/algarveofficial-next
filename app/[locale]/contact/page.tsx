import type { ContactSettings } from "@/hooks/useContactSettings";
import ContactClient from "@/components/contact/ContactClient";
import {
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { normalizePublicContactEmail } from "@/lib/contactEmail";
import { normalizePublicWhatsAppNumber } from "@/lib/contactPhone";
import { buildBreadcrumbSchema, buildContactPageSchema } from "@/lib/seo/schemaBuilders.js";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getContactSettings(): Promise<ContactSettings | null> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("contact_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ContactSettings | null) ?? null;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const [tx, settings] = await Promise.all([
    getServerTranslations(locale, [
      "nav.home",
      "nav.contact",
      "contact.title",
      "contact.subtitle",
      "contact.getInTouch",
      "contact.touchDesc",
      "contact.email",
      "contact.location",
    ]),
    getContactSettings(),
  ]);

  const displayEmail = normalizePublicContactEmail(settings?.display_email);
  const whatsappNumber = normalizePublicWhatsAppNumber(settings?.whatsapp_number);
  const officeLocation = settings?.office_location?.trim() ?? "Vilamoura, Algarve, Portugal";
  const pageUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("contact"));
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const pageSchema = buildContactPageSchema({
    name: tx["contact.title"] ?? "Contact AlgarveOfficial",
    description:
      tx["contact.subtitle"] ??
      "Get in touch with AlgarveOfficial for concierge support, listing enquiries, and partnerships.",
    url: pageUrl,
    image: `${SITE_URL}/og-image.png`,
    email: displayEmail,
    telephone: whatsappNumber,
    areaServed: officeLocation,
    siteUrl: SITE_URL,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tx["nav.home"] ?? "Home", url: homeUrl },
    { name: tx["nav.contact"] ?? "Contact", url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div id="contact-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-lg border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {tx["contact.getInTouch"] ?? "Get in Touch"}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {tx["contact.title"] ?? "Contact Us"}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {tx["contact.subtitle"] ??
                "We'd love to hear from you. Get in touch with our team."}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-sm border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {tx["contact.email"] ?? "Email"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{displayEmail}</p>
              </div>
              <div className="rounded-sm border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{whatsappNumber}</p>
              </div>
              <div className="rounded-sm border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {tx["contact.location"] ?? "Location"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{officeLocation}</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <ContactClient initialContactSettings={settings} />
    </>
  );
}
