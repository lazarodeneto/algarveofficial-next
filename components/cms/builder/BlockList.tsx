"use client";

import { type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  "courses-grid": "Golf Courses Grid",
  "golf-leaderboard": "Golf Leaderboard",
  "regions-grid": "Regions Grid",
};

function SortableItem({ block, children }: { block: CmsBlock; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function BlockList({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onToggleBlock,
  onReorderBlock,
  onRemoveBlock,
}: BlockListProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedBlocks.findIndex((block) => block.id === active.id);
    const newIndex = sortedBlocks.findIndex((block) => block.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(sortedBlocks, oldIndex, newIndex);
    const movedBlock = newOrder[newIndex];
    const direction: "up" | "down" = newIndex > oldIndex ? "down" : "up";
    const steps = Math.abs(newIndex - oldIndex);

    for (let i = 0; i < steps; i += 1) {
      onReorderBlock(movedBlock.id, direction);
    }
  };

  if (sortedBlocks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No blocks yet.</p>
        <p className="text-sm">Click &quot;Add Block&quot; to get started.</p>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={sortedBlocks.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedBlocks.map((block, index) => {
            const label = BLOCK_TYPE_LABELS[block.type] ?? block.type;
            const canMoveUp = index > 0;
            const canMoveDown = index < sortedBlocks.length - 1;

            return (
              <SortableItem key={block.id} block={block}>
                <Card
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
                        onPointerDown={(e) => e.stopPropagation()}
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
                        onPointerDown={(e) => e.stopPropagation()}
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
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBlock(block.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
