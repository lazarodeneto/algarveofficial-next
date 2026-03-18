import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar, Users, MessageSquare, Send, Loader2, Phone } from "lucide-react";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/ui/login-modal";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface InquiryDialogProps {
  listingId: string;
  listingName: string;
  ownerPhone?: string;
  agentName?: string;
  agentEmail?: string;
}

export function InquiryDialog({ listingId, listingName, ownerPhone, agentName, agentEmail }: InquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [partySize, setPartySize] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+351");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setCheckIn("");
    setCheckOut("");
    setPartySize("");
    setSpecialRequests([]);
    setName(user?.firstName ? `${user.firstName} ${user.lastName}` : "");
    setEmail(user?.email || "");
    setCountryCode("+351");
    setPhone("");
    setMessage("");
  };

  const handleNext = () => {
    if (step === 1) {
      if (!checkIn || !checkOut) {
        toast.error(t('listing.inquiry.selectDates'));
        return;
      }
      if (new Date(checkOut) <= new Date(checkIn)) {
        toast.error(t('listing.inquiry.checkOutAfterCheckIn'));
        return;
      }
    }
    if (step === 2 && !partySize) {
      toast.error(t('listing.inquiry.selectPartySize'));
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      toast.error(t('listing.inquiry.fillContact'));
      return;
    }

    setIsSubmitting(true);

    try {
      const visitType = [
        checkIn && checkOut ? `${format(new Date(checkIn), "MMM d")} – ${format(new Date(checkOut), "MMM d, yyyy")}` : null,
        partySize ? `${partySize} guest${partySize === "1" ? "" : "s"}` : null,
        specialRequests.length > 0 ? specialRequests.join(", ") : null,
      ].filter(Boolean).join(" | ");

      const { data, error } = await supabase.functions.invoke("send-enquiry", {
        body: {
          name,
          email,
          phone: phone ? `${countryCode}${phone}` : undefined,
          message: message || t('listing.inquiry.defaultMessage', 'I would like more information about this property.'),
          listing_id: listingId,
          listing_title: listingName,
          agent_name: agentName || undefined,
          agent_email: agentEmail || undefined,
          visit_type: visitType || undefined,
        },
      });

      if (error) throw error;
      const responseData = data as { warnings?: string[] } | null;

      const referenceNumber = `INQ-${Date.now().toString(36).toUpperCase()}`;
      setOpen(false);
      resetForm();
      toast.success(
        <div>
          <p className="font-medium">{t('listing.inquiry.success')}</p>
          <p className="text-sm text-muted-foreground">{t('listing.inquiry.reference', { ref: referenceNumber })}</p>
        </div>
      );
      if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
        toast.message("Your message was saved, but email notification failed. The admin can still view it in the inbox.");
      }
      if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
        toast.message("Your message was received, but admin inbox delivery needs configuration.");
      }
    } catch (err: unknown) {
      console.error("Inquiry submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "";
      const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
      toast.error(
        isNetworkError
          ? t('listing.inquiry.error', 'Failed to send enquiry. Please try again.')
          : (errorMessage || t('listing.inquiry.error', 'Failed to send enquiry. Please try again.'))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!ownerPhone) return;

    const whatsappMessage = encodeURIComponent(
      `Hi! I'm interested in "${listingName}" on AlgarveOfficial.\n\n` +
      `Dates: ${checkIn ? format(new Date(checkIn), "MMM d") : "TBD"} - ${checkOut ? format(new Date(checkOut), "MMM d, yyyy") : "TBD"}\n` +
      `Party Size: ${partySize || "TBD"}\n\n` +
      `${message || "I'd like more information about this listing."}`
    );

    window.open(`https://wa.me/${ownerPhone.replace(/\D/g, "")}?text=${whatsappMessage}`, "_blank");
  };

  const specialRequestOptions = [
    "Late check-in",
    "Early check-in",
    "Airport transfer",
    "Dietary requirements",
    "Special occasion",
    "Accessibility needs",
    "Pet-friendly",
    "Extra services",
  ];

  const toggleSpecialRequest = (request: string) => {
    setSpecialRequests((prev) =>
      prev.includes(request)
        ? prev.filter((r) => r !== request)
        : [...prev, request]
    );
  };

  const getStepLabel = (s: number) => {
    switch (s) {
      case 1: return t('listing.inquiry.stepDates');
      case 2: return t('listing.inquiry.stepParty');
      default: return t('listing.inquiry.stepMessage');
    }
  };

  return (
    <>
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full" size="lg">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('listing.inquiry.send')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('listing.inquiry.title', { name: listingName })}</DialogTitle>
            <DialogDescription>
              {t('listing.inquiry.step', { current: step, total: 3 })} — {getStepLabel(step)}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"
                  }`}
              />
            ))}
          </div>

          {/* Step 1: Travel Dates */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('listing.inquiry.checkIn')}
                  </Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('listing.inquiry.checkOut')}
                  </Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Select your preferred travel dates. These are not final and can be discussed with the owner.
              </p>
            </div>
          )}

          {/* Step 2: Party Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('listing.inquiry.guests')}
                </Label>
                <Select value={partySize} onValueChange={setPartySize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, "9+"].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? t('listing.inquiry.guest') : t('listing.inquiry.guests_plural')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('listing.inquiry.specialRequests')}</Label>
                <div className="flex flex-wrap gap-2">
                  {specialRequestOptions.map((request) => (
                    <Button
                      key={request}
                      type="button"
                      variant={specialRequests.includes(request) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSpecialRequest(request)}
                    >
                      {request}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Message */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('listing.inquiry.yourName')}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('listing.inquiry.phone')}</Label>
                  <CountryPhoneInput
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    phone={phone}
                    onPhoneChange={setPhone}
                    phonePlaceholder="912 345 678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('listing.inquiry.email')}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('listing.inquiry.message')}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('listing.inquiry.messagePlaceholder')}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-4">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                {t('listing.inquiry.back')}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              {step === 3 && ownerPhone && (
                <Button variant="outline" onClick={handleWhatsApp}>
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}

              {step < 3 ? (
                <Button onClick={handleNext}>
                  {t('listing.inquiry.continue')}
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('listing.inquiry.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('listing.inquiry.send')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
