import { useState } from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MessageSquare, Send, Loader2, MapPin, Globe } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useContactForm } from "@/hooks/useContactForm";
import { useAuth } from "@/contexts/AuthContext";
import { useContactSettings } from "@/hooks/useContactSettings";
import { PRIMARY_CONTACT_EMAIL, normalizePublicContactEmail } from "@/lib/contactEmail";
import { PRIMARY_WHATSAPP_NUMBER, toWhatsAppDigits } from "@/lib/contactPhone";

const ENGLISH_CONTACT_FALLBACKS = {
    heroTitle: new Set(["Contact Us", "Get in Touch"]),
    heroSubtitle: new Set([
        "We'd love to hear from you. Get in touch with our team.",
        "Have a question or need assistance? Our team is here to help you make the most of your Algarve experience.",
        "Have a question? We'd love to hear from you...",
        "Have a question? We'd love to hear from you…",
        "Have a question? We'd love to hear from you. Send us a message and we'll respond within 24 hours.",
    ]),
    getInTouchTitle: new Set(["Get in Touch", "Connect with Us"]),
    getInTouchDescription: new Set([
        "Our concierge team is available to assist you with any questions about premium experiences in the Algarve.",
        "Choose your preferred way to reach us. We usually respond within 24 hours.",
        "Whether you have a question about our services or just want to say hello, we are here to help.",
        "Whether you have a question about our services…",
    ]),
    formTitle: new Set(["Send a Message", "Send Us a Message", "Send us a Message"]),
    formDescription: new Set([
        "Fill in the form below and we'll get back to you as soon as possible.",
        "Fill out the form below and we will get back to you as soon as possible.",
        "Fill out the form below and our team will get back to you shortly.",
        "Fill out the form below...",
    ]),
};

function resolveLocalizedContactCopy(
    locale: string | undefined,
    configuredValue: string | null | undefined,
    translatedValue: string,
    englishFallbacks: Set<string>,
) {
    const trimmed = configuredValue?.trim();
    if (!trimmed) return translatedValue;

    const isEnglishLocale = (locale ?? "").toLowerCase().startsWith("en");
    if (isEnglishLocale) return trimmed;

    return englishFallbacks.has(trimmed) ? translatedValue : trimmed;
}

export default function Contact() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const contactMutation = useContactForm();
    const { settings, isLoading } = useContactSettings();

    const [formData, setFormData] = useState(() => ({
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        subject: searchParams.get("subject") || "",
        message: searchParams.get("message") || "",
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await contactMutation.mutateAsync({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
        });

        // Reset form on success (except name/email if logged in)
        setFormData(prev => ({
            ...prev,
            subject: "",
            message: ""
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const heroTitle = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.hero_title,
        t('contact.title', 'Contact Us'),
        ENGLISH_CONTACT_FALLBACKS.heroTitle,
    );
    const heroSubtitle = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.hero_subtitle,
        t('contact.subtitle', 'Have a question or need assistance? Our team is here to help you make the most of your Algarve experience.'),
        ENGLISH_CONTACT_FALLBACKS.heroSubtitle,
    );
    const getInTouchTitle = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.get_in_touch_title,
        t('contact.getInTouch', 'Get in Touch'),
        ENGLISH_CONTACT_FALLBACKS.getInTouchTitle,
    );
    const getInTouchDescription = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.get_in_touch_description,
        t('contact.touchDesc', 'Choose your preferred way to reach us. We usually respond within 24 hours.'),
        ENGLISH_CONTACT_FALLBACKS.getInTouchDescription,
    );
    const formTitle = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.form_title,
        t('contact.formTitle', 'Send Us a Message'),
        ENGLISH_CONTACT_FALLBACKS.formTitle,
    );
    const formDescription = resolveLocalizedContactCopy(
        i18n.resolvedLanguage,
        settings?.form_description,
        t('contact.formDesc', 'Fill in the form below and we\'ll get back to you as soon as possible.'),
        ENGLISH_CONTACT_FALLBACKS.formDescription,
    );
    const displayEmail = normalizePublicContactEmail(settings?.display_email) || PRIMARY_CONTACT_EMAIL;
    const whatsappDigits = toWhatsAppDigits(settings?.whatsapp_number || PRIMARY_WHATSAPP_NUMBER);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-8 lg:pt-32 lg:pb-12">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                <div className="absolute top-1/3 right-1/3 w-px h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-tight">
                            {heroTitle}
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {heroSubtitle}
                        </p>
                    </m.div>
                </div>
            </section>

            <section className="pt-6 pb-12 lg:pt-10 lg:pb-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">

                        {/* Contact Info Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            <m.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="glass-box border-none shadow-xl bg-card/30 backdrop-blur-sm p-5 lg:p-8">
                                    <CardHeader className="p-0 mb-5">
                                        <CardTitle className="text-2xl font-serif">
                                            {getInTouchTitle}
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-2">
                                            {getInTouchDescription}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 space-y-6">

                                        <div className="flex items-start gap-3 sm:gap-4 group">
                                            <div className="h-10 w-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/20">
                                                <Mail className="h-5 w-5 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-foreground text-base">{t('contact.email', 'Email')}</h4>
                                                <p className="break-all text-muted-foreground leading-relaxed">{displayEmail}</p>
                                                <a
                                                    href={`mailto:${displayEmail}`}
                                                    className="mt-1 inline-block break-words text-sm font-medium text-primary hover:underline"
                                                >
                                                    {t('contact.sendEmail', 'Send an email')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 sm:gap-4 group">
                                            <div className="h-10 w-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/20">
                                                <MessageSquare className="h-5 w-5 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-foreground text-base">WhatsApp</h4>
                                                <p className="text-muted-foreground leading-relaxed">{t('contact.waDesc', 'Chat with us directly for quick support.')}</p>
                                                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-words text-sm font-medium text-primary hover:underline">
                                                    {t('contact.startChat', 'Start a chat')}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 sm:gap-4 group">
                                            <div className="h-10 w-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/20">
                                                <MapPin className="h-5 w-5 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-foreground text-base">{t('contact.location', 'Office')}</h4>
                                                <p className="break-words text-muted-foreground leading-relaxed">{settings?.office_location || 'Vilamoura, Algarve, Portugal'}</p>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </m.div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="glass-box">
                                    <CardHeader>
                                        <CardTitle className="font-serif">{formTitle}</CardTitle>
                                        <CardDescription>
                                            {formDescription}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">{t('contact.nameLabel', 'Full Name')}</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder={t('contact.namePlaceholder', 'Your name')}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">{t('contact.emailLabel', 'Email Address')}</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder={t('contact.emailPlaceholder', 'your@email.com')}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subject">{t('contact.subjectLabel', 'Subject')}</Label>
                                                <Input
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder={t('contact.subjectPlaceholder', 'How can we help?')}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">{t('contact.messageLabel', 'Message')}</Label>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder={t('contact.messagePlaceholder', 'Write your message here...')}
                                                    rows={6}
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full sm:w-auto min-w-[150px]"
                                                disabled={contactMutation.isPending}
                                            >
                                                {contactMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {t('contact.sending', 'Sending...')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        {t('contact.send', 'Send Message')}
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </m.div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
