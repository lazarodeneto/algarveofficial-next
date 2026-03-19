import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { SeoFieldsPanel, SeoData } from "@/components/admin/seo/SeoFieldsPanel";
import { usePrivacySettings, Section } from "@/hooks/usePrivacySettings";
import { Shield, Loader2, Plus, Trash2, ExternalLink, GripVertical } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const iconOptions = [
  "Shield", "Database", "Clock", "UserCheck", "Mail", "FileText",
  "Lock", "Eye", "Globe", "Server", "Key", "ShieldCheck"
];

export default function AdminPrivacyPage() {
  const { settings, isLoading, updateSettings } = usePrivacySettings();
  const [formData, setFormData] = useState({
    page_title: "",
    last_updated_date: "",
    introduction: "",
    sections: [] as Section[],
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        page_title: settings.page_title || "",
        last_updated_date: settings.last_updated_date || "",
        introduction: settings.introduction || "",
        sections: settings.sections || [],
        meta_title: settings.meta_title || "",
        meta_description: settings.meta_description || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      icon: "Shield",
      content: "",
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleSeoChange = (seoData: SeoData) => {
    setFormData(prev => ({
      ...prev,
      meta_title: seoData.meta_title || "",
      meta_description: seoData.meta_description || "",
    }));
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
      <DashboardBreadcrumb />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit the Privacy Policy page content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/privacy-policy" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Page
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle>Page Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page_title">Page Title</Label>
                <Input
                  id="page_title"
                  value={formData.page_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, page_title: e.target.value }))}
                  placeholder="Privacy Policy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_updated_date">Last Updated Date</Label>
                <Input
                  id="last_updated_date"
                  value={formData.last_updated_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_updated_date: e.target.value }))}
                  placeholder="January 21, 2026"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={formData.introduction}
                onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
                placeholder="AlgarveOfficial is committed to protecting your privacy..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Content Sections</CardTitle>
            <Button onClick={addSection} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardHeader>
          <CardContent>
            {formData.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No sections yet. Add sections to build your Privacy Policy page, or leave empty to use the default content.
              </p>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {formData.sections.map((section, index) => (
                  <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span>{section.title || `Section ${index + 1}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            placeholder="1. Data Controller"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Select
                            value={section.icon}
                            onValueChange={(value) => updateSection(index, 'icon', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map(icon => (
                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Content (HTML supported)</Label>
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateSection(index, 'content', e.target.value)}
                          placeholder="<p>Your content here...</p>"
                          rows={6}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Section
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SeoFieldsPanel
              data={{
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
              }}
              onChange={handleSeoChange}
              pageName="Privacy Policy"
              pageSlug="privacy-policy"
              compact
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
