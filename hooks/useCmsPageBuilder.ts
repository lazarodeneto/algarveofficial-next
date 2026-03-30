import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useCmsPageBuilderContext } from "@/contexts/CmsPageBuilderContext";
import { normalizePublicContactEmail } from "@/lib/contactEmail";

function normalizeEmailInText(text: string): string {
  if (!text.includes("@")) return text;
  
  const emailRegex = /[\w.-]+@algarveofficial\.com/gi;
  return text.replace(emailRegex, (match) => normalizePublicContactEmail(match) ?? match);
}

export function useCmsPageBuilder(pageId: string) {
  const { pageConfigs, textOverrides, isLoading } = useCmsPageBuilderContext();

  const pageConfig = pageConfigs[pageId] ?? {};

  const helpers = useMemo(() => {
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true): boolean => {
      const configured = blocks[blockId]?.enabled;
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
      const className = blocks[blockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const style = blocks[blockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
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
      isBlockEnabled,
      getText,
      getMetaTitle,
      getMetaDescription,
    };
  }, [pageConfig.blocks, pageConfig.meta?.description, pageConfig.meta?.title, pageConfig.text, pageId, textOverrides]);

  return {
    isLoading,
    pageConfig,
    pageConfigs,
    textOverrides,
    ...helpers,
  };
}
