"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CmsPageConfig } from "@/lib/cms/block-schemas";
import { CmsPageRenderer } from "../renderers/CmsPageRenderer";

interface BlockPreviewProps {
  pageConfig: CmsPageConfig;
}

type PreviewMode = "desktop" | "mobile";

const PREVIEW_WIDTHS: Record<PreviewMode, number> = {
  desktop: 1000,
  mobile: 375,
};

export function BlockPreview({ pageConfig }: BlockPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("desktop");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={mode === "desktop" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("desktop")}
        >
          <Monitor className="h-4 w-4 mr-1" />
          Desktop
        </Button>
        <Button
          variant={mode === "mobile" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("mobile")}
        >
          <Smartphone className="h-4 w-4 mr-1" />
          Mobile
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <div
          className="mx-auto overflow-auto transition-all duration-200"
          style={{
            width: PREVIEW_WIDTHS[mode],
            maxWidth: "100%",
          }}
        >
          <CmsPageRenderer pageConfig={pageConfig} />
        </div>
      </div>
    </div>
  );
}