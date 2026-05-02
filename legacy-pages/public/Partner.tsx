import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { usePartnerSettings } from "@/hooks/usePartnerSettings";
import { useSubmitListingClaim } from "@/hooks/useListingClaims";
import { useSubscriptionPricing } from "@/hooks/useSubscriptionPricing";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";
import { normalizeExternalUrlForStorage } from "@/lib/url-input";

import { PartnerHero } from "@/components/partner/PartnerHero";
import { ForWhomSection } from "@/components/partner/ForWhomSection";
import { PricingFeaturesTable } from "@/components/partner/PricingFeaturesTable";
import { HowItWorksSection } from "@/components/partner/HowItWorksSection";
import { PricingCardsSection } from "@/components/partner/PricingCardsSection";
import { FinalCTASection } from "@/components/partner/FinalCTASection";
import { PartnerCommercialSections } from "@/components/partner/PartnerCommercialSections";

const partnerSchema = z.object({
  requestType: z.enum(["new-listing", "claim-business"]),
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  businessWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type PartnerFormData = z.infer<typeof partnerSchema>;
type FAQItem = { question: string; answer: string };

const Partner = () => {
  const { t } = useTranslation();
  const { settings, isLoading: settingsLoading } = usePartnerSettings();
  const { getText } = useCmsPageBuilder("partner");
  const { membershipTiers } = useSubscriptionPricing(t);
  const locale = useCurrentLocale();

  const verifiedTier = membershipTiers.find((tier) => tier.id === "verified");
  const signatureTier = membershipTiers.find((tier) => tier.id === "signature");
  const verifiedPrice = verifiedTier?.monthly.display;
  const signaturePrice = signatureTier?.monthly.display;
  const localizedSettings = locale === "en" ? settings : null;
  const submitClaimMutation = useSubmitListingClaim();

  const [formData, setFormData] = useState<Partial<PartnerFormData>>({
    requestType: undefined,
    businessName: "",
    businessWebsite: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [countryCode, setCountryCode] = useState("+351");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pricingFaqs: FAQItem[] = [
    {
      question: t("pricing.faq.timing.q"),
      answer: t("pricing.faq.timing.a"),
    },
    {
      question: t("pricing.faq.tierchange.q"),
      answer: t("pricing.faq.tierchange.a"),
    },
    {
      question: t("pricing.faq.audience.q"),
      answer: t("pricing.faq.audience.a"),
    },
    {
      question: t("pricing.faq.contract.q"),
      answer: t("pricing.faq.contract.a"),
    },
  ];

  const basePartnerFaqs: FAQItem[] =
    localizedSettings?.faqs && localizedSettings.faqs.length > 0
      ? localizedSettings.faqs
      : [
          { question: t("partner.faq.q1"), answer: t("partner.faq.a1") },
          { question: t("partner.faq.q2"), answer: t("partner.faq.a2") },
          { question: t("partner.faq.q3"), answer: t("partner.faq.a3") },
          { question: t("partner.faq.q4"), answer: t("partner.faq.a4") },
        ];

  const allFaqs: FAQItem[] = basePartnerFaqs.slice();
  for (const pricingFaq of pricingFaqs) {
    const alreadyIncluded = allFaqs.some(
      (faq) => faq.question.trim().toLowerCase() === pricingFaq.question.trim().toLowerCase(),
    );
    if (!alreadyIncluded) {
      allFaqs.push(pricingFaq);
    }
  }

  const content = {
    heroTitle: getText("hero.title", localizedSettings?.hero_title || t("partner.title")),
    heroSubtitle: getText("hero.subtitle", localizedSettings?.hero_subtitle || t("partner.subtitle")),
    formTitle: localizedSettings?.form_title || t("partner.form.title"),
    successMessage: localizedSettings?.success_message || t("partner.success"),
    faqTitle: getText("faq.title", localizedSettings?.faq_title || t("partner.faq.title")),
    faqs: allFaqs,
  };

  const scrollToForm = (type?: PartnerFormData["requestType"]) => {
    if (type) {
      setFormData((prev) => ({ ...prev, requestType: type }));
      setErrors((prev) => ({ ...prev, requestType: "" }));
    }
    requestAnimationFrame(() => {
      document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const scrollToPricing = () => {
    requestAnimationFrame(() => {
      document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const normalizedPayload: Partial<PartnerFormData> = {
      ...formData,
      businessWebsite: normalizeExternalUrlForStorage(formData.businessWebsite) ?? "",
    };

    const result = partnerSchema.safeParse(normalizedPayload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("partner.form.validationError"));
      requestAnimationFrame(() => {
        document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    try {
      const responseData = await submitClaimMutation.mutateAsync({
        requestType: normalizedPayload.requestType!,
        businessName: normalizedPayload.businessName!,
        businessWebsite: normalizedPayload.businessWebsite || undefined,
        contactName: normalizedPayload.contactName!,
        email: normalizedPayload.email!,
        phone: normalizedPayload.phone ? `${countryCode}${normalizedPayload.phone}` : undefined,
        message: normalizedPayload.message!,
      }) as { warnings?: string[] } | null;

      toast.success(content.successMessage);
      if (
        responseData?.warnings?.includes("partner_claim_alert_enqueue_failed") ||
        responseData?.warnings?.includes("partner_claim_alert_trigger_failed") ||
        responseData?.warnings?.includes("partner_claim_alert_outbox_worker_unhealthy")
      ) {
        toast.message(
          "Your request was saved, but immediate email alert delivery needs configuration. The admin dashboard still has your claim.",
        );
      }
      setFormData({
        requestType: undefined,
        businessName: "",
        businessWebsite: "",
        contactName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting claim:", error);
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("partner.form.error"));
    }
  };

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (locale === "en" && settingsLoading) {
    return (
      <main id="main-content" className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content">
      {/* 1. Hero */}
      <PartnerHero
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        onApply={() => scrollToForm()}
      />

      {/* 2. Who this is for */}
      <ForWhomSection />

      {/* 3. Commercial clarity */}
      <PartnerCommercialSections />

      {/* 4. Feature comparison table */}
      <PricingFeaturesTable
        verifiedPrice={verifiedPrice}
        onSelectVerified={() => scrollToForm("new-listing")}
        onSelectSignature={() => scrollToForm("new-listing")}
      />

      {/* 6. How it works */}
      <HowItWorksSection />

      {/* 7. Pricing cards */}
      <PricingCardsSection
        verifiedPrice={verifiedPrice}
        signaturePrice={signaturePrice}
        onSelectVerified={() => scrollToForm("new-listing")}
        onExpressSignatureInterest={() => scrollToForm("new-listing")}
      />

      {/* 8. FAQ */}
      <section className="py-20 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-title text-foreground text-center mb-12">
              {content.faqTitle}
            </h2>

            <Accordion type="single" collapsible className="space-y-3">
              {content.faqs.map((faq, index) => (
                <AccordionItem
                  key={`faq-${index}`}
                  value={`q${index}`}
                  className="glass-box border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline text-foreground font-medium py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </m.div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <FinalCTASection
        onApplyFree={() => scrollToForm("new-listing")}
        onBuySubscription={scrollToPricing}
      />

      {/* 9. Contact form */}
      <section id="partner-form" className="py-20 lg:py-24 bg-card/50">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h2 className="text-title text-foreground">{content.formTitle}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("partner.form.responseTime")}
              </p>
            </div>

            <Card className="glass-box">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5 partner-form-contrast">
                  {/* Request type */}
                  <div className="space-y-2">
                    <Label htmlFor="requestType">{t("partner.form.requestType")}</Label>
                    <Select
                      key={formData.requestType || "empty"}
                      value={formData.requestType ?? ""}
                      onValueChange={(value) =>
                        handleInputChange("requestType", value as "new-listing" | "claim-business")
                      }
                    >
                      <SelectTrigger className={errors.requestType ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("partner.form.selectType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-listing">{t("partner.form.newListingOption")}</SelectItem>
                        <SelectItem value="claim-business">{t("partner.form.claimOption")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.requestType && (
                      <p className="text-sm text-destructive">{errors.requestType}</p>
                    )}
                  </div>

                  {/* Business name */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t("partner.form.businessName")}</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className={errors.businessName ? "border-destructive" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive">{errors.businessName}</p>
                    )}
                  </div>

                  {/* Business website */}
                  <div className="space-y-2">
                    <Label htmlFor="businessWebsite">{t("partner.form.businessWebsite")}</Label>
                    <Input
                      id="businessWebsite"
                      type="text"
                      placeholder="https://"
                      value={formData.businessWebsite}
                      onChange={(e) => handleInputChange("businessWebsite", e.target.value)}
                      className={errors.businessWebsite ? "border-destructive" : ""}
                    />
                    {errors.businessWebsite && (
                      <p className="text-sm text-destructive">{errors.businessWebsite}</p>
                    )}
                  </div>

                  {/* Contact name + email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">{t("partner.form.contactName")}</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        className={errors.contactName ? "border-destructive" : ""}
                      />
                      {errors.contactName && (
                        <p className="text-sm text-destructive">{errors.contactName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("partner.form.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("partner.form.phone")}</Label>
                    <CountryPhoneInput
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                      phone={formData.phone || ""}
                      onPhoneChange={(value) => handleInputChange("phone", value)}
                      phonePlaceholder="912 345 678"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("partner.form.message")}</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder={t("partner.form.messagePlaceholder")}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={submitClaimMutation.isPending}
                  >
                    {submitClaimMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("partner.form.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("partner.form.submit")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </m.div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partner;
