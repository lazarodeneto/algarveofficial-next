import { type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCmsPageBuilder } from "@/hooks/useCmsPageBuilder";

interface CmsBlockProps {
  pageId: string;
  blockId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  defaultEnabled?: boolean;
}

export function CmsBlock({
  pageId,
  blockId,
  children,
  className,
  style,
  as: Component = "div",
  defaultEnabled = true,
}: CmsBlockProps) {
  const { getBlockClassName, getBlockStyle, isBlockEnabled } = useCmsPageBuilder(pageId);

  if (!isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page={pageId}
      data-cms-block={blockId}
      className={cn(className, getBlockClassName(blockId))}
      style={{ ...style, ...getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}
