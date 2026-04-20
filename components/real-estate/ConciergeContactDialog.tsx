import { useState } from "react";
import { Send, Loader2, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
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

interface ConciergeContactDialogProps {
    children: React.ReactNode;
}

export function ConciergeContactDialog({ children }: ConciergeContactDialogProps) {
    const [open, setOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("+351");
    const [phone, setPhone] = useState("");
    const [inquiryType, setInquiryType] = useState("buy");
    const [message, setMessage] = useState("");

    const { isAuthenticated, user } = useAuth();
    const { t } = useTranslation();

    const handleOpenChange = (newOpen: boolean) => {
        // Optional: Force login if required, but for general contact usually not strict
        // if (newOpen && !isAuthenticated) {
        //   setShowLoginModal(true);
        //   return;
        // }
        setOpen(newOpen);
        if (newOpen && isAuthenticated && user) {
            setName(user.firstName ? `${user.firstName} ${user.lastName}` : "");
            setEmail(user.email || "");
        }
        if (!newOpen) {
            resetForm();
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setCountryCode("+351");
        setPhone("");
        setInquiryType("buy");
        setMessage("");
    };

    const handleSubmit = async () => {
        if (!name || !email || !message) {
            toast.error(t("common.fillRequiredFields"));
            return;
        }

        setIsSubmitting(true);

        try {
            const inquiryTypeLabel: Record<string, string> = {
                buy: t("realEstate.conciergeDialog.inquiryTypes.buy"),
                sell: t("realEstate.conciergeDialog.inquiryTypes.sell"),
                rent: t("realEstate.conciergeDialog.inquiryTypes.rent"),
                invest: t("realEstate.conciergeDialog.inquiryTypes.invest"),
                other: t("realEstate.conciergeDialog.inquiryTypes.other"),
            };

            const { data, error } = await supabase.functions.invoke("send-enquiry", {
                body: {
                    name,
                    email,
                    phone: phone ? `${countryCode}${phone}` : undefined,
                    message: `Inquiry type: ${inquiryTypeLabel[inquiryType] || inquiryType}\n\n${message}`,
                    listing_title: t("realEstate.conciergeDialog.inquiryTitle"),
                },
            });

            if (error) throw error;
            const responseData = data as { warnings?: string[] } | null;

            const referenceNumber = `CON-${Date.now().toString(36).toUpperCase()}`;
            setOpen(false);
            resetForm();
            toast.success(
                <div>
                    <p className="font-medium">{t("realEstate.conciergeDialog.requestSentTitle")}</p>
                    <p className="text-sm text-muted-foreground">
                        {t("realEstate.conciergeDialog.requestSentDescription", { referenceNumber })}
                    </p>
                </div>
            );
            if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
                toast.message(t("listing.form.emailWarning"));
            }
            if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
                toast.message(t("listing.form.inboxWarning"));
            }
        } catch (err: unknown) {
            console.error("Concierge submission error:", err);
            const errorMessage = err instanceof Error ? err.message : t("realEstate.conciergeDialog.sendRequestError");
            const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
            toast.error(
                isNetworkError
                    ? t("realEstate.conciergeDialog.networkError")
                    : errorMessage
            );
        } finally {
            setIsSubmitting(false);
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
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">{t("realEstate.conciergeDialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("realEstate.conciergeDialog.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("realEstate.conciergeDialog.interestedIn")}</Label>
                            <Select value={inquiryType} onValueChange={setInquiryType}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("realEstate.conciergeDialog.selectInterest")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buy">{t("realEstate.conciergeDialog.inquiryTypes.buy")}</SelectItem>
                                    <SelectItem value="sell">{t("realEstate.conciergeDialog.inquiryTypes.sell")}</SelectItem>
                                    <SelectItem value="rent">{t("realEstate.conciergeDialog.inquiryTypes.rent")}</SelectItem>
                                    <SelectItem value="invest">{t("realEstate.conciergeDialog.inquiryTypes.invest")}</SelectItem>
                                    <SelectItem value="other">{t("realEstate.conciergeDialog.inquiryTypes.other")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t("realEstate.conciergeDialog.nameRequired")}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t("listing.form.fullName")}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t("listing.form.phone")}</Label>
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
                            <Label htmlFor="email">{t("realEstate.conciergeDialog.emailRequired")}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">{t("realEstate.conciergeDialog.messageRequired")}</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t("realEstate.conciergeDialog.messagePlaceholder")}
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("realEstate.conciergeDialog.sendingRequest")}
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    {t("realEstate.conciergeDialog.sendRequest")}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
