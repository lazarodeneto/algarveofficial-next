import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Mail, Phone, Send, UserRound, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function normalizeAgentRoleKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

interface RealEstateAgentContactCardProps {
  listingId: string;
  listingName: string;
  agentName?: string | null;
  agentRole?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  agentImageUrl?: string | null;
  className?: string;
  showTopDivider?: boolean;
  initialScheduleVisit?: boolean;
  onSubmitted?: () => void;
}

export function RealEstateAgentContactCard({
  listingId,
  listingName,
  agentName,
  agentRole,
  agentEmail,
  agentPhone,
  agentImageUrl,
  className,
  showTopDivider = true,
  initialScheduleVisit = false,
  onSubmitted,
}: RealEstateAgentContactCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+351");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleVisit, setScheduleVisit] = useState(initialScheduleVisit);
  const [visitType, setVisitType] = useState("in-person");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((previous) => previous || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
    setEmail((previous) => previous || user.email || "");
  }, [user]);

  useEffect(() => {
    setScheduleVisit(initialScheduleVisit);
  }, [initialScheduleVisit]);

  const resolvedAgentName = useMemo(
    () => agentName?.trim() || t("listing.contact", "Contact"),
    [agentName, t],
  );

  const resolvedAgentRole = useMemo(
    () => {
      const trimmedRole = agentRole?.trim();
      if (!trimmedRole) {
        return t("listing.verifiedPartner", "Verified Partner");
      }

      const translationKey = `listing.agentRoles.${normalizeAgentRoleKey(trimmedRole)}`;
      return t(translationKey, trimmedRole);
    },
    [agentRole, t],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t("common.fillRequiredFields", "Please fill in all required fields."));
      return;
    }

    if (!consent) {
      toast.error(t("listing.form.consent", "Please accept the consent to continue."));
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedVisitType = scheduleVisit
        ? (visitType === "video-call"
          ? t("listing.form.videoCall", "Video Call")
          : t("listing.form.inPerson", "In Person"))
        : undefined;

      const { data, error } = await supabase.functions.invoke("send-enquiry", {
        body: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() ? `${countryCode}${phone.trim()}` : undefined,
          message: message.trim(),
          listing_id: listingId,
          listing_title: listingName,
          agent_name: agentName?.trim() || undefined,
          agent_email: agentEmail?.trim() || undefined,
          visit_type: selectedVisitType,
        },
      });

      if (error) throw error;

      const responseData = data as { warnings?: string[] } | null;

      toast.success(t("listing.inquiry.success", "Your enquiry has been sent successfully."));

      if (
        responseData?.warnings?.includes("email_delivery_failed") ||
        responseData?.warnings?.includes("email_delivery_primary_sender_failed")
      ) {
        toast.message(
          t(
            "listing.form.emailWarning",
            "Your message was saved, but email notification failed. The admin can still view it in the inbox.",
          ),
        );
      }
      if (
        responseData?.warnings?.includes("admin_user_not_configured") ||
        responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") ||
        responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")
      ) {
        toast.message(
          t(
            "listing.form.inboxWarning",
            "Your message was received, but admin inbox delivery needs configuration.",
          ),
        );
      }

      setPhone("");
      setMessage("");
      setScheduleVisit(false);
      setVisitType("in-person");
      setConsent(false);
      onSubmitted?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send enquiry. Please try again.";
      const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
      toast.error(
        isNetworkError
          ? t("listing.inquiry.error", "Failed to send enquiry. Please try again.")
          : errorMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "space-y-4",
        showTopDivider ? "mt-6 pt-6 border-t border-border" : "",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-border">
          {agentImageUrl ? <AvatarImage src={agentImageUrl} alt={resolvedAgentName} /> : null}
          <AvatarFallback>
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{resolvedAgentName}</p>
          <p className="text-xs text-muted-foreground truncate">{resolvedAgentRole}</p>
        </div>
      </div>

      {agentPhone ? (
        <a href={`tel:${agentPhone.replace(/\s+/g, "")}`} className="block">
          <Button type="button" variant="outline" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            {agentPhone}
          </Button>
        </a>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`agent-name-${listingId}`}>{t("listing.form.name", "Name")}</Label>
          <Input
            id={`agent-name-${listingId}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("listing.form.fullName", "Full Name")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`agent-phone-${listingId}`}>{t("listing.form.phone", "Phone")}</Label>
          <div id={`agent-phone-${listingId}`}>
            <CountryPhoneInput
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phone={phone}
              onPhoneChange={setPhone}
              phonePlaceholder={t("listing.form.telephone", "Telephone")}
              className="flex flex-col gap-3 sm:flex-row"
              inputClassName="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`agent-email-${listingId}`}>{t("listing.form.email", "Email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id={`agent-email-${listingId}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`agent-message-${listingId}`}>{t("listing.form.message", "Message")}</Label>
          <Textarea
            id={`agent-message-${listingId}`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("listing.inquiry.messagePlaceholder", "Tell us about your requirements...")}
            className="min-h-[110px] resize-none"
            required
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor={`schedule-visit-${listingId}`}
              className="text-sm font-medium cursor-pointer inline-flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4 text-primary" />
              {t("listing.bookVisit", "Book a Visit")}
            </label>
            <Switch
              id={`schedule-visit-${listingId}`}
              checked={scheduleVisit}
              onCheckedChange={setScheduleVisit}
            />
          </div>

          {scheduleVisit ? (
            <Select value={visitType} onValueChange={setVisitType}>
              <SelectTrigger>
                <SelectValue placeholder={t("listing.form.selectVisitType", "Select visit type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">{t("listing.form.inPerson", "In Person")}</SelectItem>
                <SelectItem value="video-call">{t("listing.form.videoCall", "Video Call")}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id={`agent-consent-${listingId}`}
            checked={consent}
            onCheckedChange={(value) => setConsent(Boolean(value))}
            required
          />
          <label htmlFor={`agent-consent-${listingId}`} className="text-xs text-muted-foreground leading-tight cursor-pointer">
            {t(
              "listing.form.consent",
              "I authorise AlgarveOfficial to store my data to reply to this enquiry.",
            )}
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("listing.inquiry.sending", "Sending...")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t("listing.form.send", "Send")}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
