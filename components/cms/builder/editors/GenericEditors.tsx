"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BlockEditorProps {
  blockId: string;
  settings: Record<string, unknown>;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

export function CategoriesGridBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input value={(settings.subtitle as string) ?? ""} onChange={(e) => updateField("subtitle", e.target.value)} />
      </div>
    </div>
  );
}

export function CitiesGridBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input value={(settings.subtitle as string) ?? ""} onChange={(e) => updateField("subtitle", e.target.value)} />
      </div>
    </div>
  );
}

export function CtaBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={(settings.description as string) ?? ""} onChange={(e) => updateField("description", e.target.value)} />
      </div>
    </div>
  );
}

export function EditorialTextBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Content (HTML)</Label>
        <Input value={(settings.content as string) ?? ""} onChange={(e) => updateField("content", e.target.value)} />
      </div>
    </div>
  );
}

export function ImageGalleryBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
    </div>
  );
}

export function FaqBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
    </div>
  );
}

export function CoursesGridBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Max Items</Label>
        <Input
          type="number"
          value={String((settings.limit as number) ?? 12)}
          onChange={(e) => updateField("limit", Number.parseInt(e.target.value, 10) || 12)}
        />
      </div>
    </div>
  );
}

export function GolfLeaderboardBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={(settings.title as string) ?? "Leaderboard"}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Rows</Label>
        <Input
          type="number"
          value={String((settings.limit as number) ?? 10)}
          onChange={(e) => updateField("limit", Number.parseInt(e.target.value, 10) || 10)}
        />
      </div>
    </div>
  );
}

export function RegionsGridBlockEditor({ settings, onUpdateSettings }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={(settings.title as string) ?? ""} onChange={(e) => updateField("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input value={(settings.subtitle as string) ?? ""} onChange={(e) => updateField("subtitle", e.target.value)} />
      </div>
    </div>
  );
}
