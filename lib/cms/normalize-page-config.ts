import {
  CmsPageConfigSchema,
  type CmsPageConfig,
  type CmsBlock,
  getDefaultBlockSettings,
  isSupportedBlockType,
  type SupportedBlockType,
} from "./block-schemas";
import { resolveHero } from "./resolve-hero";

interface LegacyPageConfig {
  hero?: Record<string, unknown>;
  blocks?: Record<string, { enabled?: boolean; className?: string; style?: string; data?: Record<string, unknown> }>;
  text?: Record<string, string>;
  meta?: { title?: string; description?: string };
}

const LEGACY_BLOCK_TYPE_MAP: Record<string, SupportedBlockType | null> = {
  hero: "hero",
  "featured-listings": "featured-listings",
  "categories-grid": "categories-grid",
  "cities-grid": "cities-grid",
  "city-hub": "cities-grid",
  cta: "cta",
  "cta-section": "cta",
  "editorial-text": "editorial-text",
  "image-gallery": "image-gallery",
  faq: "faq",
};

function detectBlockType(blockId: string): SupportedBlockType | null {
  return (
    LEGACY_BLOCK_TYPE_MAP[blockId] ??
    (isSupportedBlockType(blockId) ? (blockId as SupportedBlockType) : null)
  );
}

function convertLegacyBlocks(
  legacyBlocks: Record<string, { enabled?: boolean; className?: string; style?: string; data?: Record<string, unknown> }> | undefined
): CmsBlock[] {
  if (!legacyBlocks || typeof legacyBlocks !== "object") {
    return [];
  }

  const convertedBlocks: CmsBlock[] = [];
  let order = 10;

  for (const [blockId, blockConfig] of Object.entries(legacyBlocks)) {
    if (!blockConfig || typeof blockConfig !== "object") {
      continue;
    }

    const blockType = detectBlockType(blockId);
    if (!blockType) {
      continue;
    }

    convertedBlocks.push({
      id: blockId,
      type: blockType,
      enabled: blockConfig.enabled ?? true,
      order: (order += 10),
      settings: {
        ...getDefaultBlockSettings(blockType),
        ...(blockConfig.data as Record<string, unknown>),
      },
    });
  }

  return convertedBlocks;
}

function convertLegacyTextToHero(textMap: Record<string, string> | undefined) {
  if (!textMap || typeof textMap !== "object") {
    return undefined;
  }

  const heroFields = ["mediaType", "imageUrl", "videoUrl", "youtubeUrl", "posterUrl"];
  const hasHeroData = heroFields.some((key) => textMap[`hero.${key}`]);

  if (!hasHeroData) {
    return undefined;
  }

  return {
    enabled: true,
    mediaType: (textMap["hero.mediaType"] as "image" | "video" | "youtube") ?? "image",
    imageUrl: textMap["hero.imageUrl"],
    videoUrl: textMap["hero.videoUrl"],
    youtubeUrl: textMap["hero.youtubeUrl"],
    posterUrl: textMap["hero.posterUrl"],
    alt: textMap["hero.alt"],
    badge: textMap["hero.badge"],
    title: textMap["hero.title"],
    subtitle: textMap["hero.subtitle"],
    ctaPrimary: textMap["hero.cta.primary"],
    ctaSecondary: textMap["hero.cta.secondary"],
  };
}

export function normalizePageConfig(
  input: unknown,
  options?: { source?: "server" | "admin" }
): CmsPageConfig {
  if (!input || typeof input !== "object") {
    return CmsPageConfigSchema.parse({});
  }

  const config = input as Record<string, Record<string, unknown>>;

  const normalizedHero =
    (config.hero as Record<string, unknown>) ??
    convertLegacyTextToHero(config.text as Record<string, string> | undefined);

  const rawBlocks = config.blocks as unknown;
  const normalizedBlocks = Array.isArray(rawBlocks) 
    ? (rawBlocks as CmsBlock[])
    : convertLegacyBlocks(config.blocks as Record<string, { enabled?: boolean }> | undefined);

  const normalizedMeta =
    (config.meta as { title?: string; description?: string }) ??
    (config.text
      ? {
          title: config.text["meta.title"] as string | undefined,
          description: config.text["meta.description"] as string | undefined,
        }
      : undefined);

  const result = {
    hero: normalizedHero,
    blocks: normalizedBlocks,
    meta: normalizedMeta,
  };

  return CmsPageConfigSchema.parse(result);
}

export function getBlockById(
  pageConfig: CmsPageConfig,
  blockId: string
): CmsBlock | undefined {
  return pageConfig.blocks?.find((block) => block.id === blockId);
}

export function getEnabledBlocks(pageConfig: CmsPageConfig): CmsBlock[] {
  return (pageConfig.blocks ?? [])
    .filter((block) => block.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function reorderBlocks(
  pageConfig: CmsPageConfig,
  blockId: string,
  direction: "up" | "down"
): CmsPageConfig {
  const blocks = [...(pageConfig.blocks ?? [])];
  const index = blocks.findIndex((b) => b.id === blockId);

  if (index === -1) {
    return pageConfig;
  }

  const newBlocks = [...blocks];
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= newBlocks.length) {
    return pageConfig;
  }

  [newBlocks[index], newBlocks[targetIndex]] = [
    newBlocks[targetIndex],
    newBlocks[index],
  ];

  const reorderedBlocks = newBlocks.map((block, i) => ({
    ...block,
    order: (i + 1) * 10,
  }));

  return {
    ...pageConfig,
    blocks: reorderedBlocks,
  };
}

export function addBlock(
  pageConfig: CmsPageConfig,
  blockType: SupportedBlockType,
  afterBlockId?: string
): CmsPageConfig {
  const existingIds = new Set(pageConfig.blocks?.map((b) => b.id) ?? []);
  let blockId: string = blockType;
  let counter = 1;

  while (existingIds.has(blockId)) {
    blockId = `${blockType}-${counter}`;
    counter++;
  }

  const maxOrder =
    pageConfig.blocks?.reduce((max, b) => Math.max(max, b.order), 0) ?? 0;

  const newBlock: CmsBlock = {
    id: blockId,
    type: blockType,
    enabled: true,
    order: maxOrder + 10,
    settings: getDefaultBlockSettings(blockType),
  };

  if (afterBlockId) {
    const insertIndex = pageConfig.blocks?.findIndex(
      (b) => b.id === afterBlockId
    );
    if (insertIndex !== undefined && insertIndex >= 0) {
      const updatedBlocks = [...(pageConfig.blocks ?? [])];
      updatedBlocks.splice(insertIndex + 1, 0, newBlock);
      return {
        ...pageConfig,
        blocks: updatedBlocks.map((block, i) => ({ ...block, order: (i + 1) * 10 })),
      };
    }
  }

  return {
    ...pageConfig,
    blocks: [...(pageConfig.blocks ?? []), newBlock],
  };
}

export function removeBlock(
  pageConfig: CmsPageConfig,
  blockId: string
): CmsPageConfig {
  return {
    ...pageConfig,
    blocks: (pageConfig.blocks ?? [])
      .filter((block) => block.id !== blockId)
      .map((block, i) => ({ ...block, order: (i + 1) * 10 })),
  };
}

export function updateBlockSettings(
  pageConfig: CmsPageConfig,
  blockId: string,
  settings: Record<string, unknown>
): CmsPageConfig {
  return {
    ...pageConfig,
    blocks: (pageConfig.blocks ?? []).map((block) =>
      block.id === blockId
        ? { ...block, settings: { ...block.settings, ...settings } }
        : block
    ),
  };
}

export function toggleBlock(
  pageConfig: CmsPageConfig,
  blockId: string
): CmsPageConfig {
  return {
    ...pageConfig,
    blocks: (pageConfig.blocks ?? []).map((block) =>
      block.id === blockId ? { ...block, enabled: !block.enabled } : block
    ),
  };
}