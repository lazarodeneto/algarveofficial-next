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
            toast.error(t('common.fillRequiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            const inquiryTypeLabel: Record<string, string> = {
                buy: "Buying a Property",
                sell: "Selling a Property",
                rent: "Premium Rental",
                invest: "Investment Opportunity",
                other: "Other Inquiry",
            };

            const { data, error } = await supabase.functions.invoke("send-enquiry", {
                body: {
                    name,
                    email,
                    phone: phone ? `${countryCode}${phone}` : undefined,
                    message: `Inquiry type: ${inquiryTypeLabel[inquiryType] || inquiryType}\n\n${message}`,
                    listing_title: "Concierge Service Inquiry",
                },
            });

            if (error) throw error;
            const responseData = data as { warnings?: string[] } | null;

            const referenceNumber = `CON-${Date.now().toString(36).toUpperCase()}`;
            setOpen(false);
            resetForm();
            toast.success(
                <div>
                    <p className="font-medium">Request Sent Successfully</p>
                    <p className="text-sm text-muted-foreground">Our concierge team will contact you shortly. Ref: {referenceNumber}</p>
                </div>
            );
            if (responseData?.warnings?.includes("email_delivery_failed") || responseData?.warnings?.includes("email_delivery_primary_sender_failed")) {
                toast.message("Your message was saved, but email notification failed. The admin can still view it in the inbox.");
            }
            if (responseData?.warnings?.includes("admin_user_not_configured") || responseData?.warnings?.includes("enquiry_saved_but_admin_inbox_insert_failed") || responseData?.warnings?.includes("enquiry_saved_but_admin_message_insert_failed")) {
                toast.message("Your message was received, but admin inbox delivery needs configuration.");
            }
        } catch (err: unknown) {
            console.error("Concierge submission error:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to send request. Please try again.";
            const isNetworkError = /failed to fetch|failed to send a request/i.test(errorMessage);
            toast.error(
                isNetworkError
                    ? "Unable to reach our server right now. Please try again in a moment."
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
                        <DialogTitle className="font-serif text-2xl">Concierge Service</DialogTitle>
                        <DialogDescription>
                            Let us help you find your dream property or experience in the Algarve.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>I am interested in...</Label>
                            <Select value={inquiryType} onValueChange={setInquiryType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select interest" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buy">Buying a Property</SelectItem>
                                    <SelectItem value="sell">Selling a Property</SelectItem>
                                    <SelectItem value="rent">Premium Rental</SelectItem>
                                    <SelectItem value="invest">Investment Opportunity</SelectItem>
                                    <SelectItem value="other">Other Inquiry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
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
                            <Label htmlFor="email">Email *</Label>
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
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us about your requirements (location, budget, style)..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending Request...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
