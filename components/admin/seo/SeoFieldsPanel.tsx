import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Share2,
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SeoData {
  meta_title?: string | null;
  meta_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  focus_keywords?: string | null;
  no_index?: boolean;
  no_follow?: boolean;
}

interface SeoFieldsPanelProps {
  data: SeoData;
  onChange: (data: SeoData) => void;
  pageName?: string;
  pageSlug?: string;
  siteUrl?: string;
  compact?: boolean;
}

function StatusIndicator({ status }: { status: "empty" | "good" | "warning" }) {
  if (status === "good") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "warning") return <AlertCircle className="h-4 w-4 text-amber-500" />;
  return null;
}

export function SeoFieldsPanel({
  data,
  onChange,
  pageName = "Page",
  pageSlug = "",
  siteUrl = "https://algarveofficial.com",
  compact = false,
}: SeoFieldsPanelProps) {
  const [isOpenGraphOpen, setIsOpenGraphOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const titleLength = (data.meta_title || "").length;
  const descLength = (data.meta_description || "").length;
  
  const titleStatus = titleLength === 0 ? "empty" : titleLength <= 60 ? "good" : "warning";
  const descStatus = descLength === 0 ? "empty" : descLength <= 160 ? "good" : "warning";

  const previewTitle = data.meta_title || pageName;
  const previewDesc = data.meta_description || "No description set";
  const previewUrl = `${siteUrl}/${pageSlug}`.replace(/\/+$/, '');

  return (
    <div className="space-y-6">
      {/* Basic SEO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm text-foreground">Search Engine Optimization</h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_title">SEO Title</Label>
            <div className="flex items-center gap-2">
              <StatusIndicator status={titleStatus} />
              <span className={cn(
                "text-xs",
                titleLength > 60 ? "text-amber-500" : "text-muted-foreground"
              )}>
                {titleLength}/60
              </span>
            </div>
          </div>
          <Input
            id="meta_title"
            value={data.meta_title || ""}
            onChange={(e) => onChange({ ...data, meta_title: e.target.value })}
            className="bg-background"
            placeholder={`${pageName} | AlgarveOfficial`}
          />
          <p className="text-xs text-muted-foreground">
            The title tag shown in search results. Keep under 60 characters.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="meta_description">Meta Description</Label>
            <div className="flex items-center gap-2">
              <StatusIndicator status={descStatus} />
              <span className={cn(
                "text-xs",
                descLength > 160 ? "text-amber-500" : "text-muted-foreground"
              )}>
                {descLength}/160
              </span>
            </div>
          </div>
          <Textarea
            id="meta_description"
            value={data.meta_description || ""}
            onChange={(e) => onChange({ ...data, meta_description: e.target.value })}
            className="bg-background"
            rows={3}
            placeholder="Brief description for search engines..."
          />
          <p className="text-xs text-muted-foreground">
            Displayed under the title in search results. Aim for 150-160 characters.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="focus_keywords">Focus Keywords</Label>
          <Input
            id="focus_keywords"
            value={data.focus_keywords || ""}
            onChange={(e) => onChange({ ...data, focus_keywords: e.target.value })}
            className="bg-background"
            placeholder="premium, algarve, travel, portugal..."
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated keywords to target for this page.
          </p>
        </div>
      </div>

      {!compact && (
        <>
          {/* Google Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Search Preview</span>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-border">
              <div className="text-sm text-green-700 dark:text-green-400 truncate">
                {previewUrl}
              </div>
              <div className="text-lg text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate mt-0.5">
                {previewTitle}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                {previewDesc}
              </div>
            </div>
          </div>

          <Separator />

          {/* Open Graph (Social Sharing) */}
          <Collapsible open={isOpenGraphOpen} onOpenChange={setIsOpenGraphOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Social Sharing (Open Graph)</span>
                </div>
                {isOpenGraphOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="og_title">OG Title</Label>
                <Input
                  id="og_title"
                  value={data.og_title || ""}
                  onChange={(e) => onChange({ ...data, og_title: e.target.value })}
                  className="bg-background"
                  placeholder="Leave empty to use SEO title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_description">OG Description</Label>
                <Textarea
                  id="og_description"
                  value={data.og_description || ""}
                  onChange={(e) => onChange({ ...data, og_description: e.target.value })}
                  className="bg-background"
                  rows={2}
                  placeholder="Leave empty to use meta description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_image">OG Image URL</Label>
                <div className="flex gap-3">
                  {data.og_image && (
                    <div className="relative w-24 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={data.og_image}
                        alt="OG Preview"
                        fill
                        unoptimized
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="og_image"
                      value={data.og_image || ""}
                      onChange={(e) => onChange({ ...data, og_image: e.target.value })}
                      className="bg-background"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200×630px for best display on social platforms
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Preview */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Facebook/LinkedIn Preview</p>
                <div className="bg-white dark:bg-zinc-800 rounded border border-border overflow-hidden">
                  <div className="relative aspect-[1.91/1] bg-muted flex items-center justify-center">
                    {data.og_image ? (
                      <Image
                        src={data.og_image}
                        alt="Social preview"
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground uppercase">algarveofficial.com</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {data.og_title || data.meta_title || pageName}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {data.og_description || data.meta_description || "No description"}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Advanced Settings */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Advanced Settings</span>
                </div>
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  value={data.canonical_url || ""}
                  onChange={(e) => onChange({ ...data, canonical_url: e.target.value })}
                  className="bg-background"
                  placeholder={previewUrl}
                />
                <p className="text-xs text-muted-foreground">
                  Override the canonical URL to prevent duplicate content issues.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Index this page</p>
                  <p className="text-xs text-muted-foreground">Allow search engines to index</p>
                </div>
                <Badge variant={data.no_index ? "destructive" : "default"}>
                  {data.no_index ? "No Index" : "Index"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Follow links</p>
                  <p className="text-xs text-muted-foreground">Allow crawlers to follow links</p>
                </div>
                <Badge variant={data.no_follow ? "destructive" : "default"}>
                  {data.no_follow ? "No Follow" : "Follow"}
                </Badge>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}

export default SeoFieldsPanel;
