import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building, ClipboardCheck, Eye, MessageSquare, Award, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { usePartnerSettings } from "@/hooks/usePartnerSettings";
import { useSubmitListingClaim } from "@/hooks/useListingClaims";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";

const partnerSchema = z.object({
  requestType: z.enum(['new-listing', 'claim-business']),
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  businessWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  contactName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

const Partner = () => {
  const { t } = useTranslation();
  const { settings, isLoading: settingsLoading } = usePartnerSettings();
  const submitClaimMutation = useSubmitListingClaim();
  const [formData, setFormData] = useState<Partial<PartnerFormData>>({
    requestType: undefined,
    businessName: '',
    businessWebsite: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [countryCode, setCountryCode] = useState("+351");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setRequestTypeAndScroll = (requestType: PartnerFormData["requestType"]) => {
    setFormData((prev) => ({ ...prev, requestType }));
    // Clear requestType error immediately so it doesn't look like the click didn't work
    setErrors((prev) => ({ ...prev, requestType: "" }));
    // Ensure the form is in view (CTA buttons are above)
    requestAnimationFrame(() => {
      document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // Use CMS content with fallback to translations
  const content = {
    heroTitle: settings?.hero_title || t('partner.title'),
    heroSubtitle: settings?.hero_subtitle || t('partner.subtitle'),
    newListingTitle: settings?.new_listing_title || t('partner.newListing.title'),
    newListingDescription: settings?.new_listing_description || t('partner.newListing.description'),
    newListingCta: settings?.new_listing_cta || t('partner.newListing.cta'),
    claimBusinessTitle: settings?.claim_business_title || t('partner.claimBusiness.title'),
    claimBusinessDescription: settings?.claim_business_description || t('partner.claimBusiness.description'),
    claimBusinessCta: settings?.claim_business_cta || t('partner.claimBusiness.cta'),
    formTitle: settings?.form_title || t('partner.form.title'),
    successMessage: settings?.success_message || t('partner.success'),
    benefitsTitle: settings?.benefits_title || t('partner.benefits.title'),
    benefit1Title: settings?.benefit_1_title || t('partner.benefits.visibility.title'),
    benefit1Description: settings?.benefit_1_description || t('partner.benefits.visibility.description'),
    benefit2Title: settings?.benefit_2_title || t('partner.benefits.positioning.title'),
    benefit2Description: settings?.benefit_2_description || t('partner.benefits.positioning.description'),
    benefit3Title: settings?.benefit_3_title || t('partner.benefits.contact.title'),
    benefit3Description: settings?.benefit_3_description || t('partner.benefits.contact.description'),
    faqTitle: settings?.faq_title || t('partner.faq.title'),
    faqs: settings?.faqs && settings.faqs.length > 0 ? settings.faqs : [
      { question: t('partner.faq.q1'), answer: t('partner.faq.a1') },
      { question: t('partner.faq.q2'), answer: t('partner.faq.a2') },
      { question: t('partner.faq.q3'), answer: t('partner.faq.a3') },
      { question: t('partner.faq.q4'), answer: t('partner.faq.a4') },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = partnerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);

      // Prevent “silent failure”: make it obvious nothing was submitted.
      toast.error(t('partner.form.validationError', 'Please check the highlighted fields and try again.'));
      // Bring the user back to the first section of the form where errors are shown.
      requestAnimationFrame(() => {
        document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }

    try {
      await submitClaimMutation.mutateAsync({
        requestType: formData.requestType!,
        businessName: formData.businessName!,
        businessWebsite: formData.businessWebsite || undefined,
        contactName: formData.contactName!,
        email: formData.email!,
        phone: formData.phone ? `${countryCode}${formData.phone}` : undefined,
        message: formData.message!,
      });
      
      toast.success(content.successMessage);
      setFormData({
        requestType: undefined,
        businessName: '',
        businessWebsite: '',
        contactName: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error(t('partner.form.error', 'Failed to submit request. Please try again.'));
    }
  };

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-px h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-tight">
              {content.heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Two Options Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full glass-box hover:border-primary/30 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif">{content.newListingTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {content.newListingDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRequestTypeAndScroll('new-listing');
                    }}
                  >
                    {content.newListingCta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full glass-box hover:border-primary/30 transition-colors">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif">{content.claimBusinessTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {content.claimBusinessDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setRequestTypeAndScroll('claim-business');
                    }}
                  >
                    {content.claimBusinessCta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="partner-form" className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif font-medium text-center mb-8">
              {content.formTitle}
            </h2>
            
            <Card className="glass-box">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6 partner-form-contrast">
                  <div className="space-y-2">
                    <Label htmlFor="requestType">{t('partner.form.requestType')}</Label>
                    <Select 
                      key={formData.requestType || 'empty'}
                      value={formData.requestType ?? ''} 
                      onValueChange={(value) => handleInputChange('requestType', value as 'new-listing' | 'claim-business')}
                    >
                      <SelectTrigger className={errors.requestType ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('partner.form.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-listing">{t('partner.form.newListingOption')}</SelectItem>
                        <SelectItem value="claim-business">{t('partner.form.claimOption')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.requestType && <p className="text-sm text-destructive">{errors.requestType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t('partner.form.businessName')}</Label>
                    <Input 
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className={errors.businessName ? 'border-destructive' : ''}
                    />
                    {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessWebsite">{t('partner.form.businessWebsite')}</Label>
                    <Input 
                      id="businessWebsite"
                      type="url"
                      placeholder="https://"
                      value={formData.businessWebsite}
                      onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                      className={errors.businessWebsite ? 'border-destructive' : ''}
                    />
                    {errors.businessWebsite && <p className="text-sm text-destructive">{errors.businessWebsite}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">{t('partner.form.contactName')}</Label>
                      <Input 
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className={errors.contactName ? 'border-destructive' : ''}
                      />
                      {errors.contactName && <p className="text-sm text-destructive">{errors.contactName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('partner.form.email')}</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('partner.form.phone')}</Label>
                    <CountryPhoneInput
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                      phone={formData.phone || ""}
                      onPhoneChange={(value) => handleInputChange('phone', value)}
                      phonePlaceholder="912 345 678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('partner.form.message')}</Label>
                    <Textarea 
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={submitClaimMutation.isPending}>
                    {submitClaimMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('partner.form.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('partner.form.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-medium text-center mb-12">
            {content.benefitsTitle}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full text-center glass-box">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{content.benefit1Title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {content.benefit1Description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full text-center glass-box">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{content.benefit2Title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {content.benefit2Description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full text-center glass-box">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{content.benefit3Title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {content.benefit3Description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-medium text-center mb-12">
            {content.faqTitle}
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {content.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`q${index}`} className="glass-box border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partner;
