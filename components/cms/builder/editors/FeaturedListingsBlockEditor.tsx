"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BlockEditorProps {
  blockId: string;
  settings: Record<string, unknown>;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export function FeaturedListingsBlockEditor({
  settings,
  onUpdateSettings,
}: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={(settings.title as string) ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          value={(settings.subtitle as string) ?? ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Layout</Label>
        <Input
          value={(settings.layout as string) ?? "grid"}
          onChange={(e) => updateField("layout", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Limit</Label>
        <Input
          type="number"
          value={(settings.limit as number) ?? 6}
          onChange={(e) => updateField("limit", parseInt(e.target.value) || 6)}
        />
      </div>
    </div>
  );
}