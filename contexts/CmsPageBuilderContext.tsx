import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import {
  CMS_DEFAULT_DESIGN_TOKENS,
  CMS_GLOBAL_SETTING_KEYS,
  type CmsDesignTokenMap,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";

interface CmsPageBuilderContextValue {
  isLoading: boolean;
  textOverrides: CmsTextOverrideMap;
  pageConfigs: CmsPageConfigMap;
  designTokens: CmsDesignTokenMap;
  customCss: string;
}

const CmsPageBuilderContext = createContext<CmsPageBuilderContextValue>({
  isLoading: false,
  textOverrides: {},
  pageConfigs: {},
  designTokens: {},
  customCss: "",
});

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof key !== "string") return;
    if (typeof value !== "string") return;
    normalized[key.trim()] = value;
  });

  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const normalizedPage: CmsPageConfigMap[string] = {};

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: NonNullable<CmsPageConfigMap[string]["blocks"]> = {};

      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isPlainRecord(rawBlock)) return;

        const block: NonNullable<NonNullable<CmsPageConfigMap[string]["blocks"]>[string]> = {};

        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;

        if (isPlainRecord(rawBlock.style)) {
          const style: Record<string, string | number> = {};
          Object.entries(rawBlock.style).forEach(([styleKey, styleValue]) => {
            if (typeof styleValue === "string" || typeof styleValue === "number") {
              style[styleKey] = styleValue;
            }
          });
          block.style = style;
        }

        if (isPlainRecord(rawBlock.data)) {
          const data: Record<string, string | number | boolean | string[]> = {};
          Object.entries(rawBlock.data).forEach(([dataKey, dataValue]) => {
            if (typeof dataValue === "string" || typeof dataValue === "number" || typeof dataValue === "boolean" || Array.isArray(dataValue)) {
              data[dataKey] = dataValue as string | number | boolean | string[];
            }
          });
          block.data = data;
        }

        blocks[blockId] = block;
      });

      normalizedPage.blocks = blocks;
    }

    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      normalizedPage.text = text;
    }

    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      normalizedPage.meta = meta;
    }

    out[pageId] = normalizedPage;
  });

  return out;
}

function normalizeDesignTokens(input: unknown): CmsDesignTokenMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsDesignTokenMap = {};
  Object.entries(input).forEach(([token, value]) => {
    if (typeof value === "string") {
      out[token] = value;
    }
  });

  return out;
}

function setNestedValue(target: Record<string, unknown>, path: string, value: string): void {
  const segments = path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!segments.length) return;

  let cursor: Record<string, unknown> = target;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const current = segments[i];
    if (!isPlainRecord(cursor[current])) {
      cursor[current] = {};
    }
    cursor = cursor[current] as Record<string, unknown>;
  }

  cursor[segments[segments.length - 1]] = value;
}

function toCssVarName(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("--") ? trimmed : `--${trimmed}`;
}

export function CmsPageBuilderProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const previousAppliedVarsRef = useRef<string[]>([]);

  const { settings, isLoading } = useGlobalSettings({
    keys: [
      CMS_GLOBAL_SETTING_KEYS.textOverrides,
      CMS_GLOBAL_SETTING_KEYS.pageConfigs,
      CMS_GLOBAL_SETTING_KEYS.designTokens,
      CMS_GLOBAL_SETTING_KEYS.customCss,
    ],
  });

  const settingMap = useMemo(
    () =>
      settings.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value ?? "";
        return acc;
      }, {}),
    [settings],
  );

  const textOverrides = useMemo(
    () => normalizeTextOverrides(parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {})),
    [settingMap],
  );

  const pageConfigs = useMemo(
    () => normalizePageConfigs(parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {})),
    [settingMap],
  );

  const designTokens = useMemo(() => {
    const parsed = normalizeDesignTokens(parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.designTokens], {}));
    return { ...CMS_DEFAULT_DESIGN_TOKENS, ...parsed };
  }, [settingMap]);

  const customCss = useMemo(() => settingMap[CMS_GLOBAL_SETTING_KEYS.customCss] ?? "", [settingMap]);

  // Apply plain-text CMS overrides only to the English bundle. The current
  // global setting shape is not locale-aware, so pushing those strings into
  // every language bundle causes non-English pages to regress back to English.
  useEffect(() => {
    const nestedOverrides: Record<string, unknown> = {};
    Object.entries(textOverrides).forEach(([key, value]) => {
      if (!key || typeof value !== "string") return;
      setNestedValue(nestedOverrides, key, value);
    });

    if (typeof i18n.addResourceBundle !== "function") {
      return;
    }

    i18n.addResourceBundle("en", "translation", nestedOverrides, true, true);
  }, [i18n, textOverrides]);

  // Apply design tokens as CSS variables on :root.
  useEffect(() => {
    const root = document.documentElement;
    const applied: string[] = [];

    Object.entries(designTokens).forEach(([token, value]) => {
      const cssVar = toCssVarName(token);
      if (!cssVar) return;
      root.style.setProperty(cssVar, value);
      applied.push(cssVar);
    });

    previousAppliedVarsRef.current.forEach((oldVar) => {
      if (!applied.includes(oldVar)) {
        root.style.removeProperty(oldVar);
      }
    });

    previousAppliedVarsRef.current = applied;
  }, [designTokens]);

  // Inject site-wide custom CSS.
  useEffect(() => {
    const styleId = "cms-page-builder-custom-css";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!customCss.trim()) {
      if (styleEl) {
        styleEl.remove();
      }
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = customCss;
  }, [customCss]);

  const value = useMemo<CmsPageBuilderContextValue>(
    () => ({
      isLoading,
      textOverrides,
      pageConfigs,
      designTokens,
      customCss,
    }),
    [isLoading, textOverrides, pageConfigs, designTokens, customCss],
  );

  return <CmsPageBuilderContext.Provider value={value}>{children}</CmsPageBuilderContext.Provider>;
}

export function useCmsPageBuilderContext() {
  return useContext(CmsPageBuilderContext);
}
