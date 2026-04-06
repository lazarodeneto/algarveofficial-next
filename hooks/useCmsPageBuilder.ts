import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useCmsPageBuilderContext } from "@/contexts/CmsPageBuilderContext";
import { normalizePublicContactEmail } from "@/lib/contactEmail";
import {
  isKnownCmsPageId,
  resolveCmsBlockId,
} from "@/lib/cms/pageBuilderRegistry";

function normalizeEmailInText(text: string): string {
  if (!text.includes("@")) return text;
  
  const emailRegex = /[\w.-]+@algarveofficial\.com/gi;
  return text.replace(emailRegex, (match) => normalizePublicContactEmail(match) ?? match);
}

export function useCmsPageBuilder(pageId: string) {
  const { pageConfigs, textOverrides, isLoading } = useCmsPageBuilderContext();

  const knownPageId = isKnownCmsPageId(pageId) ? pageId : null;

  if (!knownPageId) {
    const message = `[cms-page-builder] Unknown page id "${pageId}". Add it to CMS_PAGE_DEFINITIONS or update the runtime caller.`;
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    } else if (typeof window !== "undefined") {
      console.error(message);
    }
  }

  const pageConfig = knownPageId ? pageConfigs[knownPageId] ?? {} : {};

  const helpers = useMemo(() => {
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};
    const resolveBlockId = (blockId: string): string | null => {
      if (!knownPageId) return null;
      const resolved = resolveCmsBlockId(knownPageId, blockId);
      if (!resolved) {
        const message = `[cms-page-builder] Unknown block id "${blockId}" for page "${knownPageId}".`;
        if (process.env.NODE_ENV !== "production") {
          throw new Error(message);
        } else if (typeof window !== "undefined") {
          console.error(message);
        }
      }
      return resolved;
    };

    const isBlockEnabled = (blockId: string, fallback = true): boolean => {
      const resolvedBlockId = resolveBlockId(blockId);
      if (!resolvedBlockId) return fallback;
      const configured = blocks[resolvedBlockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getBlockOrder = (defaultOrder: string[]): string[] => {
      return [...defaultOrder].sort((a, b) => {
        const aOrder = blocks[a]?.order;
        const bOrder = blocks[b]?.order;

        if (typeof aOrder === "number" && typeof bOrder === "number") {
          return aOrder - bOrder;
        }
        if (typeof aOrder === "number") return -1;
        if (typeof bOrder === "number") return 1;

        return defaultOrder.indexOf(a) - defaultOrder.indexOf(b);
      });
    };

    const getBlockClassName = (blockId: string): string => {
      const resolvedBlockId = resolveBlockId(blockId);
      if (!resolvedBlockId) return "";
      const className = blocks[resolvedBlockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const resolvedBlockId = resolveBlockId(blockId);
      if (!resolvedBlockId) return {};
      const style = blocks[resolvedBlockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
    };

    const getBlockData = (blockId: string): Record<string, string | number | boolean | string[]> => {
      const resolvedBlockId = resolveBlockId(blockId);
      if (!resolvedBlockId) return {};
      const data = blocks[resolvedBlockId]?.data;
      if (!data || typeof data !== "object") return {};
      return data;
    };

    const getText = (textKey: string, fallback: string): string => {
      const text = (
        pageText[textKey] ??
        textOverrides[`${pageId}.${textKey}`] ??
        textOverrides[textKey] ??
        fallback
      );
      return normalizeEmailInText(text);
    };

    const getMetaTitle = (fallback: string): string => {
      return pageConfig.meta?.title ?? getText("meta.title", fallback);
    };

    const getMetaDescription = (fallback: string): string => {
      return pageConfig.meta?.description ?? getText("meta.description", fallback);
    };

    return {
      blocks,
      getBlockOrder,
      getBlockClassName,
      getBlockStyle,
      getBlockData,
      isBlockEnabled,
      getText,
      getMetaTitle,
      getMetaDescription,
    };
  }, [knownPageId, pageConfig.blocks, pageConfig.meta?.description, pageConfig.meta?.title, pageConfig.text, pageId, textOverrides]);

  return {
    isLoading,
    pageConfig,
    pageConfigs,
    textOverrides,
    ...helpers,
  };
}
