import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SeoFieldsPanel, SeoData } from "@/components/admin/seo/SeoFieldsPanel";
import { usePartnerSettings, FAQ } from "@/hooks/usePartnerSettings";
import Link from "next/link";

export default function AdminPartnerPage() {
  const { settings, isLoading, updateSettings } = usePartnerSettings();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [newListingTitle, setNewListingTitle] = useState("");
  const [newListingDescription, setNewListingDescription] = useState("");
  const [newListingCta, setNewListingCta] = useState("");
  const [claimBusinessTitle, setClaimBusinessTitle] = useState("");
  const [claimBusinessDescription, setClaimBusinessDescription] = useState("");
  const [claimBusinessCta, setClaimBusinessCta] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [benefitsTitle, setBenefitsTitle] = useState("");
  const [benefit1Title, setBenefit1Title] = useState("");
  const [benefit1Description, setBenefit1Description] = useState("");
  const [benefit2Title, setBenefit2Title] = useState("");
  const [benefit2Description, setBenefit2Description] = useState("");
  const [benefit3Title, setBenefit3Title] = useState("");
  const [benefit3Description, setBenefit3Description] = useState("");
  const [faqTitle, setFaqTitle] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Sync with database
  useEffect(() => {
    if (settings) {
      setHeroTitle(settings.hero_title || "");
      setHeroSubtitle(settings.hero_subtitle || "");
      setNewListingTitle(settings.new_listing_title || "");
      setNewListingDescription(settings.new_listing_description || "");
      setNewListingCta(settings.new_listing_cta || "");
      setClaimBusinessTitle(settings.claim_business_title || "");
      setClaimBusinessDescription(settings.claim_business_description || "");
      setClaimBusinessCta(settings.claim_business_cta || "");
      setFormTitle(settings.form_title || "");
      setSuccessMessage(settings.success_message || "");
      setBenefitsTitle(settings.benefits_title || "");
      setBenefit1Title(settings.benefit_1_title || "");
      setBenefit1Description(settings.benefit_1_description || "");
      setBenefit2Title(settings.benefit_2_title || "");
      setBenefit2Description(settings.benefit_2_description || "");
      setBenefit3Title(settings.benefit_3_title || "");
      setBenefit3Description(settings.benefit_3_description || "");
      setFaqTitle(settings.faq_title || "");
      setFaqs(settings.faqs || []);
      setMetaTitle(settings.meta_title || "");
      setMetaDescription(settings.meta_description || "");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        new_listing_title: newListingTitle,
        new_listing_description: newListingDescription,
        new_listing_cta: newListingCta,
        claim_business_title: claimBusinessTitle,
        claim_business_description: claimBusinessDescription,
        claim_business_cta: claimBusinessCta,
        form_title: formTitle,
        success_message: successMessage,
        benefits_title: benefitsTitle,
        benefit_1_title: benefit1Title,
        benefit_1_description: benefit1Description,
        benefit_2_title: benefit2Title,
        benefit_2_description: benefit2Description,
        benefit_3_title: benefit3Title,
        benefit_3_description: benefit3Description,
        faq_title: faqTitle,
        faqs: faqs,
        meta_title: metaTitle,
        meta_description: metaDescription,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          <h1 className="text-2xl font-semibold">Partner Page</h1>
          <p className="text-muted-foreground text-sm">
            Manage the "Become a Partner" page content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/partner" target="_blank">
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
            <CardDescription>Main headline and subtitle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Title</Label>
              <Input
                id="heroTitle"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Become a Partner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Option Cards */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Option Cards</CardTitle>
            <CardDescription>The two main action cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* New Listing Card */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h4 className="font-medium text-primary">New Listing Card</h4>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newListingTitle}
                    onChange={(e) => setNewListingTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newListingDescription}
                    onChange={(e) => setNewListingDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={newListingCta}
                    onChange={(e) => setNewListingCta(e.target.value)}
                  />
                </div>
              </div>

              {/* Claim Business Card */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h4 className="font-medium text-primary">Claim Business Card</h4>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={claimBusinessTitle}
                    onChange={(e) => setClaimBusinessTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={claimBusinessDescription}
                    onChange={(e) => setClaimBusinessDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={claimBusinessCta}
                    onChange={(e) => setClaimBusinessCta(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Form Section</CardTitle>
            <CardDescription>Contact form settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Form Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Success Message</Label>
              <Textarea
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>Benefits Section</CardTitle>
            <CardDescription>Three benefit cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={benefitsTitle}
                onChange={(e) => setBenefitsTitle(e.target.value)}
              />
            </div>
            
            <Separator />

            <div className="grid md:grid-cols-3 gap-4">
              {/* Benefit 1 */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <Label>Benefit 1 Title</Label>
                  <Input
                    value={benefit1Title}
                    onChange={(e) => setBenefit1Title(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={benefit1Description}
                    onChange={(e) => setBenefit1Description(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <Label>Benefit 2 Title</Label>
                  <Input
                    value={benefit2Title}
                    onChange={(e) => setBenefit2Title(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={benefit2Description}
                    onChange={(e) => setBenefit2Description(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <Label>Benefit 3 Title</Label>
                  <Input
                    value={benefit3Title}
                    onChange={(e) => setBenefit3Title(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={benefit3Description}
                    onChange={(e) => setBenefit3Description(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>FAQ Section</CardTitle>
            <CardDescription>Frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={faqTitle}
                onChange={(e) => setFaqTitle(e.target.value)}
              />
            </div>

            <Separator />

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

        {/* SEO Section */}
        <Card className="glass-box">
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Search engine optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <SeoFieldsPanel
              data={{
                meta_title: metaTitle,
                meta_description: metaDescription,
              }}
              onChange={(seoData) => {
                setMetaTitle(seoData.meta_title || "");
                setMetaDescription(seoData.meta_description || "");
              }}
              pageName="Become a Partner"
              pageSlug="partner"
              compact
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
