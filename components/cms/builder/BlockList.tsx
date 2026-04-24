"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { type CmsBlock } from "@/lib/cms/block-schemas";

interface BlockListProps {
  blocks: CmsBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onToggleBlock: (blockId: string) => void;
  onReorderBlock: (blockId: string, direction: "up" | "down") => void;
  onRemoveBlock: (blockId: string) => void;
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: "Hero Section",
  "featured-listings": "Featured Listings",
  "categories-grid": "Categories Grid",
  "cities-grid": "Cities Grid",
  cta: "Call to Action",
  "editorial-text": "Editorial Text",
  "image-gallery": "Image Gallery",
  faq: "FAQ",
};

export function BlockList({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onToggleBlock,
  onReorderBlock,
  onRemoveBlock,
}: BlockListProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  if (sortedBlocks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No blocks yet.</p>
        <p className="text-sm">Click "Add Block" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedBlocks.map((block, index) => {
        const label = BLOCK_TYPE_LABELS[block.type] ?? block.type;
        const canMoveUp = index > 0;
        const canMoveDown = index < sortedBlocks.length - 1;

        return (
          <Card
            key={block.id}
            className={`cursor-pointer transition-colors ${
              selectedBlockId === block.id
                ? "border-primary ring-1 ring-primary"
                : "hover:border-muted-foreground/50"
            } ${!block.enabled ? "opacity-50" : ""}`}
            onClick={() => onSelectBlock(block.id)}
          >
            <CardContent className="p-3 flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderBlock(block.id, "up");
                  }}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderBlock(block.id, "down");
                  }}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {block.id}
                </p>
              </div>

              <Switch
                checked={block.enabled}
                onCheckedChange={() => onToggleBlock(block.id)}
                onClick={(e) => e.stopPropagation()}
              />

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBlock(block.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}