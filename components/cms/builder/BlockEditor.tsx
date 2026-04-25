"use client";

import { type CmsBlock, getDefaultBlockSettings, isSupportedBlockType } from "@/lib/cms/block-schemas";
import { FeaturedListingsBlockEditor } from "./editors/FeaturedListingsBlockEditor";
import { EditorialTextBlockEditor } from "./editors/GenericEditors";
import {
  CategoriesGridBlockEditor,
  CitiesGridBlockEditor,
  CtaBlockEditor,
  ImageGalleryBlockEditor,
  FaqBlockEditor,
  CoursesGridBlockEditor,
  GolfLeaderboardBlockEditor,
  RegionsGridBlockEditor,
} from "./editors/GenericEditors";

interface BlockEditorProps {
  block: CmsBlock | null;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

function BlockNotFoundEditor({ blockType }: { blockType: string }) {
  return (
    <div className="p-4 border border-destructive rounded-md">
      <p className="text-destructive font-medium">Unknown block type: {blockType}</p>
      <p className="text-sm text-muted-foreground">
        This block type is not yet supported in the visual editor.
      </p>
    </div>
  );
}

export function BlockEditor({ block, onUpdateSettings }: BlockEditorProps) {
  if (!block) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Select a block to edit</p>
      </div>
    );
  }

  if (!isSupportedBlockType(block.type)) {
    return <BlockNotFoundEditor blockType={block.type} />;
  }

  const editorProps = {
    blockId: block.id,
    settings: block.settings ?? getDefaultBlockSettings(block.type),
    onUpdateSettings,
  };

  switch (block.type) {
    case "hero":
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Hero section is managed automatically and cannot be edited here.
        </div>
      );

    case "featured-listings":
      return <FeaturedListingsBlockEditor {...editorProps} />;

    case "categories-grid":
      return <CategoriesGridBlockEditor {...editorProps} />;

    case "cities-grid":
      return <CitiesGridBlockEditor {...editorProps} />;

    case "cta":
      return <CtaBlockEditor {...editorProps} />;

    case "editorial-text":
      return <EditorialTextBlockEditor {...editorProps} />;

    case "image-gallery":
      return <ImageGalleryBlockEditor {...editorProps} />;

    case "faq":
      return <FaqBlockEditor {...editorProps} />;

    case "courses-grid":
      return <CoursesGridBlockEditor {...editorProps} />;

    case "golf-leaderboard":
      return <GolfLeaderboardBlockEditor {...editorProps} />;

    case "regions-grid":
      return <RegionsGridBlockEditor {...editorProps} />;

    default:
      return <BlockNotFoundEditor blockType={block.type} />;
  }
}
