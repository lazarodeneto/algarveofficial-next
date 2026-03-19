import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, GripVertical, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSupportSettings, FAQ } from "@/hooks/useSupportSettings";
import { Link } from "react-router-dom";

export default function AdminSupportPage() {
  const { settings, isLoading, updateSettings } = useSupportSettings();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneHours, setPhoneHours] = useState("");
  const [helpCenterUrl, setHelpCenterUrl] = useState("");
  const [helpCenterLabel, setHelpCenterLabel] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [responseTimeNote, setResponseTimeNote] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Sync with database
  useEffect(() => {
    if (settings) {
      setEmail(settings.email || "");
      setPhone(settings.phone || "");
      setPhoneHours(settings.phone_hours || "");
      setHelpCenterUrl(settings.help_center_url || "");
      setHelpCenterLabel(settings.help_center_label || "");
      setResponseTime(settings.response_time || "");
      setResponseTimeNote(settings.response_time_note || "");
      setFormTitle(settings.form_title || "");
      setFormDescription(settings.form_description || "");
      setSuccessMessage(settings.success_message || "");
      setCategories(settings.categories || []);
      setFaqs(settings.faqs || []);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        email,
        phone,
        phone_hours: phoneHours,
        help_center_url: helpCenterUrl,
        help_center_label: helpCenterLabel,
        response_time: responseTime,
        response_time_note: responseTimeNote,
        form_title: formTitle,
        form_description: formDescription,
        success_message: successMessage,
        categories,
        faqs,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Category management
  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // FAQ management
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
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
          <h1 className="text-2xl font-semibold">Support Page</h1>
          <p className="text-muted-foreground text-sm">
            Manage the Business Owner Support page content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/owner/support" target="_blank">
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
        {/* Contact Information */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Support contact details shown to business owners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@algarveofficial.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+351 289 123 456"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneHours">Phone Hours</Label>
              <Input
                id="phoneHours"
                value={phoneHours}
                onChange={(e) => setPhoneHours(e.target.value)}
                placeholder="Mon-Fri, 9:00-18:00"
              />
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="helpCenterUrl">Help Center URL</Label>
                <Input
                  id="helpCenterUrl"
                  value={helpCenterUrl}
                  onChange={(e) => setHelpCenterUrl(e.target.value)}
                  placeholder="https://help.algarveofficial.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpCenterLabel">Help Center Label</Label>
                <Input
                  id="helpCenterLabel"
                  value={helpCenterLabel}
                  onChange={(e) => setHelpCenterLabel(e.target.value)}
                  placeholder="Browse our guides"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Response Time Display</CardTitle>
            <CardDescription>Average response time shown to owners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responseTime">Response Time</Label>
                <Input
                  id="responseTime"
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  placeholder="< 24 hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responseTimeNote">Note</Label>
                <Input
                  id="responseTimeNote"
                  value={responseTimeNote}
                  onChange={(e) => setResponseTimeNote(e.target.value)}
                  placeholder="During business hours"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form Settings */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Contact Form Settings</CardTitle>
            <CardDescription>Form title, description, and success message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formTitle">Form Title</Label>
              <Input
                id="formTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Send a Message"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formDescription">Form Description</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Fill out the form below and we'll get back to you as soon as possible"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="successMessage">Success Message</Label>
              <Textarea
                id="successMessage"
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                placeholder="Support request submitted! We'll respond within 24 hours."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Support Categories */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Support Categories</CardTitle>
            <CardDescription>Categories for the support request dropdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              />
              <Button variant="outline" onClick={addCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{category}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(index)}
                    className="text-destructive hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ Section
            </CardTitle>
            <CardDescription>Frequently asked questions for business owners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="flex gap-4 p-4 border border-border rounded-lg">
                  <div className="flex items-start pt-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                        placeholder="Enter the question..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        placeholder="Enter the answer..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFaq(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addFaq} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
