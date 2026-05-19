"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { FaviconUpdater } from "@/components/FaviconUpdater";
import { RouteAccessibility } from "@/components/accessibility/RouteAccessibility";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CmsPageBuilderContextProvider,
  type CmsPageBuilderContextValue,
} from "@/contexts/CmsPageBuilderContextBase";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { LocaleMessages } from "@/i18n/locale-loader";
import {
  CMS_DEFAULT_DESIGN_TOKENS,
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_BUILDER_RUNTIME_KEYS,
  normalizeCmsPageConfigs,
  type CmsDesignTokenMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { safeJsonParse } from "@/lib/cms/safe-json";
import { globalSettingsQueryKey } from "@/lib/query-keys";
import { createAppQueryClient } from "@/lib/react-query";
import type { RuntimeSettingRow } from "@/lib/cms/runtime-settings";
import { GlobalErrorBoundary } from "../GlobalErrorBoundary";
import { HtmlLocaleSync } from "./HtmlLocaleSync";
import { I18nProvider } from "./I18nProvider";

interface LiteAppProvidersProps {
  children: ReactNode;
  initialMessages?: LocaleMessages;
  initialMessagesArePartial?: boolean;
  initialCmsRuntimeSettings?: RuntimeSettingRow[];
  locale?: string;
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

function LiteCmsPageBuilderProvider({
  children,
  initialCmsRuntimeSettings,
  locale = "en",
}: {
  children: ReactNode;
  initialCmsRuntimeSettings?: RuntimeSettingRow[];
  locale?: string;
}) {
  const { i18n } = useTranslation();
  const previousAppliedVarsRef = useRef<string[]>([]);

  const value = useMemo<CmsPageBuilderContextValue>(() => {
    const settingMap = (initialCmsRuntimeSettings ?? []).reduce<Record<string, string>>(
      (acc, setting) => {
        acc[setting.key] = setting.value ?? "";
        return acc;
      },
      {},
    );

    const textOverrides = normalizeTextOverrides(
      safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}, CMS_GLOBAL_SETTING_KEYS.textOverrides),
    );
    const pageConfigs = normalizeCmsPageConfigs(
      safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}, CMS_GLOBAL_SETTING_KEYS.pageConfigs),
    );
    const designTokens = {
      ...CMS_DEFAULT_DESIGN_TOKENS,
      ...normalizeDesignTokens(
        safeJsonParse(settingMap[CMS_GLOBAL_SETTING_KEYS.designTokens], {}, CMS_GLOBAL_SETTING_KEYS.designTokens),
      ),
    };

    return {
      isLoading: false,
      textOverrides,
      pageConfigs,
      designTokens,
      customCss: settingMap[CMS_GLOBAL_SETTING_KEYS.customCss] ?? "",
    };
  }, [initialCmsRuntimeSettings]);

  useEffect(() => {
    const nestedOverrides: Record<string, unknown> = {};
    Object.entries(value.textOverrides).forEach(([key, nextValue]) => {
      if (!key || typeof nextValue !== "string") return;
      setNestedValue(nestedOverrides, key, nextValue);
    });

    if (typeof i18n.addResourceBundle !== "function") {
      return;
    }

    i18n.addResourceBundle(locale, "translation", nestedOverrides, true, true);
  }, [i18n, locale, value.textOverrides]);

  useEffect(() => {
    const root = document.documentElement;
    const applied: string[] = [];

    Object.entries(value.designTokens).forEach(([token, nextValue]) => {
      const cssVar = toCssVarName(token);
      if (!cssVar) return;
      root.style.setProperty(cssVar, nextValue);
      applied.push(cssVar);
    });

    previousAppliedVarsRef.current.forEach((oldVar) => {
      if (!applied.includes(oldVar)) {
        root.style.removeProperty(oldVar);
      }
    });

    previousAppliedVarsRef.current = applied;
  }, [value.designTokens]);

  useEffect(() => {
    const styleId = "cms-page-builder-custom-css";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!value.customCss.trim()) {
      styleEl?.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = value.customCss;
  }, [value.customCss]);

  return <CmsPageBuilderContextProvider value={value}>{children}</CmsPageBuilderContextProvider>;
}

export function LiteAppProviders({
  children,
  initialMessages,
  initialMessagesArePartial = false,
  initialCmsRuntimeSettings,
  locale,
}: LiteAppProvidersProps) {
  const [queryClient] = useState(() => {
    const client = createAppQueryClient();
    if (locale && initialCmsRuntimeSettings) {
      client.setQueryData(
        globalSettingsQueryKey(CMS_PAGE_BUILDER_RUNTIME_KEYS, locale),
        initialCmsRuntimeSettings,
      );
    }
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider
        initialMessages={initialMessages}
        initialMessagesArePartial={initialMessagesArePartial}
      >
        <HtmlLocaleSync />
        <GlobalErrorBoundary>
          <ThemeProvider>
            <TooltipProvider>
              <LiteCmsPageBuilderProvider
                initialCmsRuntimeSettings={initialCmsRuntimeSettings}
                locale={locale}
              >
                <MobileMenuProvider>
                  <RouteAccessibility />
                  <FaviconUpdater />
                  {children}
                </MobileMenuProvider>
              </LiteCmsPageBuilderProvider>
            </TooltipProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </I18nProvider>
    </QueryClientProvider>
  );
}
