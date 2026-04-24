"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroBlockEditorProps {
  blockId: string;
  settings: Record<string, unknown>;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export function HeroBlockEditor({
  settings,
  onUpdateSettings,
}: HeroBlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Media Type</Label>
        <Select
          value={(settings.mediaType as string) ?? "image"}
          onValueChange={(value) => updateField("mediaType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input
          value={(settings.badge as string) ?? ""}
          onChange={(e) => updateField("badge", e.target.value)}
          placeholder="e.g., Featured"
        />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={(settings.title as string) ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Section title"
        />
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          value={(settings.subtitle as string) ?? ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          placeholder="Section subtitle"
        />
      </div>

      {(settings.mediaType === "image" || settings.mediaType === "video") && (
        <div className="space-y-2">
          <Label>Media URL</Label>
          <Input
            value={(settings.imageUrl as string) ?? (settings.videoUrl as string) ?? ""}
            onChange={(e) =>
              updateField(
                settings.mediaType === "video" ? "videoUrl" : "imageUrl",
                e.target.value
              )
            }
            placeholder="https://..."
          />
        </div>
      )}

      {settings.mediaType === "youtube" && (
        <div className="space-y-2">
          <Label>YouTube URL or ID</Label>
          <Input
            value={(settings.youtubeUrl as string) ?? ""}
            onChange={(e) => updateField("youtubeUrl", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={(settings.alt as string) ?? ""}
          onChange={(e) => updateField("alt", e.target.value)}
          placeholder="Descriptive alt text"
        />
      </div>

      <div className="space-y-2">
        <Label>Primary CTA Label</Label>
        <Input
          value={(settings.ctaPrimary as string) ?? ""}
          onChange={(e) => updateField("ctaPrimary", e.target.value)}
          placeholder="Get Started"
        />
      </div>

      <div className="space-y-2">
        <Label>Secondary CTA Label</Label>
        <Input
          value={(settings.ctaSecondary as string) ?? ""}
          onChange={(e) => updateField("ctaSecondary", e.target.value)}
          placeholder="Learn More"
        />
      </div>
    </div>
  );
}