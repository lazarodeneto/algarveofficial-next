"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SUPPORTED_BLOCK_TYPES, type SupportedBlockType } from "@/lib/cms/block-schemas";

interface AddBlockDialogProps {
  onAddBlock: (blockType: SupportedBlockType, afterBlockId?: string) => void;
  existingBlockIds: string[];
}

const BLOCK_TYPE_INFO: Record<SupportedBlockType, { label: string; description: string }> = {
  hero: {
    label: "Hero Section",
    description: "Full-width hero with image, video, or YouTube",
  },
  "featured-listings": {
    label: "Featured Listings",
    description: "Curated listings grid or carousel",
  },
  "categories-grid": {
    label: "Categories Grid",
    description: "Browse by category cards",
  },
  "cities-grid": {
    label: "Cities Grid",
    description: "Explore by city cards",
  },
  cta: {
    label: "Call to Action",
    description: "Conversion section with buttons",
  },
  "editorial-text": {
    label: "Editorial Text",
    description: "Rich text content",
  },
  "image-gallery": {
    label: "Image Gallery",
    description: "Masonry or grid image gallery",
  },
  faq: {
    label: "FAQ",
    description: "Accordion with frequently asked questions",
  },
  "courses-grid": {
    label: "Golf Courses Grid",
    description: "Display golf courses in a grid",
  },
  "golf-leaderboard": {
    label: "Golf Leaderboard",
    description: "Golf leaderboard standings",
  },
  "regions-grid": {
    label: "Golf Regions Grid",
    description: "Display golf regions",
  },
};

export function AddBlockDialog({
  onAddBlock,
  existingBlockIds,
}: AddBlockDialogProps) {
  const [open, setOpen] = useState(false);

  const availableBlocks = SUPPORTED_BLOCK_TYPES.filter(
    (type) => !existingBlockIds.includes(type)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Block</DialogTitle>
          <DialogDescription>
            Choose a block type to add to your page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {availableBlocks.map((blockType) => {
            const info = BLOCK_TYPE_INFO[blockType];
            return (
              <Button
                key={blockType}
                variant="outline"
                className="h-auto flex-col items-start gap-1 p-3"
                onClick={() => {
                  onAddBlock(blockType);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{info.label}</span>
                <span className="text-xs text-muted-foreground">
                  {info.description}
                </span>
              </Button>
            );
          })}

          {availableBlocks.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              All block types have been added.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}