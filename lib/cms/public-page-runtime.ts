import {
  CMS_GLOBAL_SETTING_KEYS,
  normalizeCmsPageConfigs,
  type CmsBlockConfig,
  type CmsPageConfig,
  type CmsPageConfigMap,
} from "@/lib/cms/pageBuilderRegistry";
import { safeJsonParse } from "@/lib/cms/safe-json";
import type { RuntimeSettingRow } from "@/lib/cms/runtime-settings";

const HERO_TEXT_KEY_MAP: Record<string, string> = {
  "hero.mediaType": "mediaType",
  "hero.imageUrl": "imageUrl",
  "hero.videoUrl": "videoUrl",
  "hero.youtubeUrl": "youtubeUrl",
  "hero.posterUrl": "posterUrl",
  "hero.alt": "alt",
  "hero.badge": "badge",
  "hero.eyebrow": "eyebrow",
  "hero.title": "title",
  "hero.subtitle": "subtitle",
  "hero.cta.primary": "ctaPrimary",
  "hero.cta.secondary": "ctaSecondary",
};

function settingValue(settings: RuntimeSettingRow[], key: string) {
  return settings.find((setting) => setting.key === key)?.value ?? "";
}

export function runtimeSettingsToPageConfigs(settings: RuntimeSettingRow[]): CmsPageConfigMap {
  return normalizeCmsPageConfigs(
    safeJsonParse(
      settingValue(settings, CMS_GLOBAL_SETTING_KEYS.pageConfigs),
      {},
      CMS_GLOBAL_SETTING_KEYS.pageConfigs,
    ),
  );
}

export function getRuntimePageConfig(
  settings: RuntimeSettingRow[],
  pageId: string,
): CmsPageConfig {
  return runtimeSettingsToPageConfigs(settings)[pageId] ?? {};
}

function getHeroStringValue(pageConfig: CmsPageConfig, textKey: string): string | null {
  const textValue = pageConfig.text?.[textKey];
  if (typeof textValue === "string") return textValue;

  const heroKey = HERO_TEXT_KEY_MAP[textKey];
  if (!heroKey || !pageConfig.hero) return null;

  const heroValue = (pageConfig.hero as Record<string, unknown>)[heroKey];
  return typeof heroValue === "string" ? heroValue : null;
}

export function getRuntimePageText(
  pageConfig: CmsPageConfig,
  textKey: string,
  fallback: string,
): string {
  const value = getHeroStringValue(pageConfig, textKey) ?? pageConfig.text?.[textKey] ?? null;
  if (value === null) return fallback;
  return value.trim() ? value : fallback;
}

export function getNullableRuntimePageText(
  pageConfig: CmsPageConfig,
  textKey: string,
): string | null {
  const value = getHeroStringValue(pageConfig, textKey) ?? pageConfig.text?.[textKey] ?? null;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getBlockConfig(pageConfig: CmsPageConfig, blockId: string): CmsBlockConfig | undefined {
  return pageConfig.blocks?.[blockId];
}

export function isRuntimeSectionEnabled(
  pageConfig: CmsPageConfig,
  sectionKey: string,
  fallback = true,
): boolean {
  const blockEnabled = getBlockConfig(pageConfig, sectionKey)?.enabled;
  if (typeof blockEnabled === "boolean") return blockEnabled;

  if (sectionKey === "hero") {
    const heroEnabled = pageConfig.hero?.enabled;
    if (typeof heroEnabled === "boolean") return heroEnabled;
  }

  return fallback;
}
