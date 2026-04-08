import { useState } from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOwnerListings } from "@/hooks/useOwnerListings";
import { useSupportSettings } from "@/hooks/useSupportSettings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PRIMARY_CONTACT_EMAIL, normalizePublicContactEmail } from "@/lib/contactEmail";

export default function OwnerSupport() {
  const { t } = useTranslation();
  const { data: listings = [] } = useOwnerListings();
  const { settings, isLoading: settingsLoading } = useSupportSettings();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    subject: '',
    listing: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.category || !formData.message) {
      toast.error(t('owner.support.fillRequiredFields'));
      return;
    }

    if (!user?.email) {
      toast.error("Your account email is required to send support messages.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const selectedListing = formData.listing && formData.listing !== "none"
        ? listings.find((listing) => listing.id === formData.listing)
        : null;
      const selectedCategoryLabel = categories.find(
        (category) => category.toLowerCase().replace(/\s+/g, "-") === formData.category
      ) || formData.category;
      const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Listing Owner";
      const supportMessage = [
        `Support Category: ${selectedCategoryLabel}`,
        selectedListing?.name ? `Related Listing: ${selectedListing.name}` : null,
        `Subject: ${formData.subject}`,
        "",
        formData.message,
      ].filter(Boolean).join("\n");

      const { data, error } = await supabase.functions.invoke("send-enquiry", {
        body: {
          name: senderName,
          email: user.email,
          message: supportMessage,
          listing_id: selectedListing?.id || null,
          listing_title: selectedListing?.name || "Owner Support Request",
          visit_type: "Owner Support",
        },
      });

      if (error) {
        let detailedMessage = "";
        const errorContext = (error as { context?: unknown }).context;
        if (errorContext instanceof Response) {
          const payload = await errorContext.json().catch(() => null) as { error?: string } | null;
          if (payload?.error) detailedMessage = payload.error;
        }
        throw new Error(detailedMessage || error.message || "Failed to send support message");
      }

      const responseData = data as { warnings?: string[] } | null;
      toast.success(settings?.success_message || t('owner.support.successMessage'));
      if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
        toast.message("Your message was saved, but email notification failed. The admin can still view it in the inbox.");
      }
      if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
        toast.message("Your message was received, but admin inbox delivery needs configuration.");
      }
      setFormData({ subject: '', listing: '', category: '', message: '' });
    } catch (err: unknown) {
      console.error("Owner support submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
      toast.error(
        isNetworkError
          ? "Unable to reach our server right now. Please try again in a moment."
          : (errorMessage || t('owner.support.errorMessage', 'Failed to send support message. Please try again.'))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use database values with fallbacks
  const email = normalizePublicContactEmail(settings?.email) || PRIMARY_CONTACT_EMAIL;
  const phone = settings?.phone || "+351 289 123 456";
  const phoneHours = settings?.phone_hours || "Mon-Fri, 9:00-18:00";
  const helpCenterUrl = settings?.help_center_url || "#";
  const helpCenterLabel = settings?.help_center_label || t('owner.support.browseGuides');
  const responseTime = settings?.response_time || "< 24 hours";
  const responseTimeNote = settings?.response_time_note || t('owner.support.duringBusinessHours');
  const formTitle = settings?.form_title || t('owner.support.sendMessage');
  const formDescription = settings?.form_description || t('owner.support.formDescription');
  const categories = settings?.categories || ["Listing Issue", "Membership & Billing", "Request New Listing", "Technical Problem", "Other"];
  const faqs = settings?.faqs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
          {t('owner.support.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('owner.support.subtitle')}
        </p>
      </m.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Options */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">{t('owner.support.contactUs')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingsLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : (
                <>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t('owner.support.email')}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </a>
                  
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t('owner.support.phone')}</p>
                      <p className="text-xs text-muted-foreground">{phone}</p>
                      <p className="text-xs text-muted-foreground">{phoneHours}</p>
                    </div>
                  </a>
                  
                  <a
                    href={helpCenterUrl}
                    target={helpCenterUrl.startsWith('http') ? '_blank' : undefined}
                    rel={helpCenterUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <FileText className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-sm">{t('owner.support.helpCenter')}</p>
                        <p className="text-xs text-muted-foreground">{helpCenterLabel}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              {settingsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{t('owner.support.avgResponseTime')}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{responseTime}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {responseTimeNote}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            {settingsLoading ? (
              <>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 mt-1" />
              </>
            ) : (
              <>
                <CardTitle>{formTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formDescription}
                </p>
              </>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('owner.support.category')} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('owner.support.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listing">{t('owner.support.relatedListing')}</Label>
                  <Select
                    value={formData.listing}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, listing: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('owner.support.selectListing')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('owner.support.none')}</SelectItem>
                      {listings.map(listing => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">{t('owner.support.subject')} *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={t('owner.support.subjectPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">{t('owner.support.message')} *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={t('owner.support.messagePlaceholder')}
                  rows={5}
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('owner.support.sending')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('owner.support.sendMessageBtn')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      {faqs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t('owner.support.faq')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
