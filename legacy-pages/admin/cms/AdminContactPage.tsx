import { useState, useEffect } from "react";
import { Save, Loader2, Mail, MapPin, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useContactSettings } from "@/hooks/useContactSettings";
import Link from "next/link";

export default function AdminContactPage() {
    const { settings, isLoading, updateSettings } = useContactSettings();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [getInTouchTitle, setGetInTouchTitle] = useState("");
    const [getInTouchDescription, setGetInTouchDescription] = useState("");
    const [displayEmail, setDisplayEmail] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [officeLocation, setOfficeLocation] = useState("");
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [forwardingEmail, setForwardingEmail] = useState("");

    // Sync with database
    useEffect(() => {
        if (settings) {
            setHeroTitle(settings.hero_title || "");
            setHeroSubtitle(settings.hero_subtitle || "");
            setGetInTouchTitle(settings.get_in_touch_title || "");
            setGetInTouchDescription(settings.get_in_touch_description || "");
            setDisplayEmail(settings.display_email || "");
            setWhatsappNumber(settings.whatsapp_number || "");
            setOfficeLocation(settings.office_location || "");
            setFormTitle(settings.form_title || "");
            setFormDescription(settings.form_description || "");
            setSuccessMessage(settings.success_message || "");
            setForwardingEmail(settings.forwarding_email || "");
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings.mutateAsync({
                hero_title: heroTitle,
                hero_subtitle: heroSubtitle,
                get_in_touch_title: getInTouchTitle,
                get_in_touch_description: getInTouchDescription,
                display_email: displayEmail,
                whatsapp_number: whatsappNumber,
                office_location: officeLocation,
                form_title: formTitle,
                form_description: formDescription,
                success_message: successMessage,
                forwarding_email: forwardingEmail,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Contact Page CMS</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage the public Contact page texts and settings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/contact" target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Page
                        </Link>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Hero Section */}
                <Card className="glass-box">
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Main title and description at the top of the page</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroTitle">Hero Title</Label>
                            <Input
                                id="heroTitle"
                                value={heroTitle}
                                onChange={(e) => setHeroTitle(e.target.value)}
                                placeholder="Get in Touch"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                            <Textarea
                                id="heroSubtitle"
                                value={heroSubtitle}
                                onChange={(e) => setHeroSubtitle(e.target.value)}
                                placeholder="Have a question? We'd love to hear from you..."
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact info side */}
                <Card className="glass-box">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Details shown in the "Connect with Us" panel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="getInTouchTitle">Panel Title</Label>
                            <Input
                                id="getInTouchTitle"
                                value={getInTouchTitle}
                                onChange={(e) => setGetInTouchTitle(e.target.value)}
                                placeholder="Connect with Us"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="getInTouchDescription">Panel Description</Label>
                            <Textarea
                                id="getInTouchDescription"
                                value={getInTouchDescription}
                                onChange={(e) => setGetInTouchDescription(e.target.value)}
                                placeholder="Whether you have a question..."
                                rows={2}
                            />
                        </div>
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Public Email
                                </Label>
                                <Input
                                    value={displayEmail}
                                    onChange={(e) => setDisplayEmail(e.target.value)}
                                    placeholder="info@algarveofficial.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> WhatsApp Number
                                </Label>
                                <Input
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    placeholder="+351 912 345 678"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Office Location
                            </Label>
                            <Input
                                value={officeLocation}
                                onChange={(e) => setOfficeLocation(e.target.value)}
                                placeholder="Vilamoura, Algarve, Portugal"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Settings */}
                <Card className="glass-box">
                    <CardHeader>
                        <CardTitle>Message Form Settings</CardTitle>
                        <CardDescription>Control the text on the contact form</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="formTitle">Form Title</Label>
                            <Input
                                id="formTitle"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Send us a Message"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="formDescription">Form Description</Label>
                            <Textarea
                                id="formDescription"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Fill out the form below..."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="successMessage">Success Message</Label>
                            <Textarea
                                id="successMessage"
                                value={successMessage}
                                onChange={(e) => setSuccessMessage(e.target.value)}
                                placeholder="Your message has been sent successfully!"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Internal Config */}
                <Card className="glass-box border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Forwarding Configuration
                        </CardTitle>
                        <CardDescription>Internal settings for message handling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="forwardingEmail">Forwarding Email Address</Label>
                            <Input
                                id="forwardingEmail"
                                type="email"
                                value={forwardingEmail}
                                onChange={(e) => setForwardingEmail(e.target.value)}
                                placeholder="info@algarveofficial.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                Inquiries will be forwarded to this address in addition to appearing in the Admin Messages section.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
