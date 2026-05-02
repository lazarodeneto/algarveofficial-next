import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  CMS_DEFAULT_DESIGN_TOKENS,
  CMS_GLOBAL_SETTING_KEYS,
  normalizeCmsPageConfigs,
  type CmsDesignTokenMap,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { safeJsonParse } from "@/lib/cms/safe-json";

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
  const locale = useCurrentLocale();
  const previousAppliedVarsRef = useRef<string[]>([]);

  const { settings, isLoading } = useGlobalSettings({
    locale,
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
    () =>
      normalizeTextOverrides(
        safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}, CMS_GLOBAL_SETTING_KEYS.textOverrides),
      ),
    [settingMap],
  );

  const pageConfigs = useMemo(
    () =>
      normalizeCmsPageConfigs(safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}, CMS_GLOBAL_SETTING_KEYS.pageConfigs), {
        onIssue: (issue) => {
          if (process.env.NODE_ENV === "production") return;
          const label =
            issue.kind === "unknown-block-id"
              ? `unknown block "${issue.blockId}" for page "${issue.pageId}"`
              : `unknown page "${issue.pageId}"`;
          console.warn(`[cms-page-builder] Ignoring ${label} in stored CMS page configs.`);
        },
      }),
    [settingMap],
  );

  const designTokens = useMemo(() => {
    const parsed = normalizeDesignTokens(
      safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.designTokens], {}, CMS_GLOBAL_SETTING_KEYS.designTokens),
    );
    return { ...CMS_DEFAULT_DESIGN_TOKENS, ...parsed };
  }, [settingMap]);

  const customCss = useMemo(() => settingMap[CMS_GLOBAL_SETTING_KEYS.customCss] ?? "", [settingMap]);

  // Apply plain-text CMS overrides to the active locale bundle.
  useEffect(() => {
    const nestedOverrides: Record<string, unknown> = {};
    Object.entries(textOverrides).forEach(([key, value]) => {
      if (!key || typeof value !== "string") return;
      setNestedValue(nestedOverrides, key, value);
    });

    if (typeof i18n.addResourceBundle !== "function") {
      return;
    }

    i18n.addResourceBundle(locale, "translation", nestedOverrides, true, true);
  }, [i18n, locale, textOverrides]);

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
