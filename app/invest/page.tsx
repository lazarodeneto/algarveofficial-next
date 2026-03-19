export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";

import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import InvestClient from "@/components/invest/InvestClient";
import { buildMetadata } from "@/lib/metadata";
import { buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";
import { createClient } from "@/lib/supabase/server";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";

const INVEST_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") || "https://algarveofficial.com";

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
    if (typeof value === "string") normalized[key.trim()] = value;
  });
  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};
  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const pageConfig: CmsPageConfigMap[string] = {};
    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([key, value]) => {
        if (typeof value === "string") text[key] = value;
      });
      pageConfig.text = text;
    }
    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      pageConfig.meta = meta;
    }
    out[pageId] = pageConfig;
  });

  return out;
}

function resolveInvestCopy(settings: GlobalSetting[]) {
  const settingMap = settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value ?? "";
    return acc;
  }, {});

  const textOverrides = normalizeTextOverrides(
    parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
  );
  const pageConfigs = normalizePageConfigs(
    parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
  );
  const pageConfig = pageConfigs.invest ?? {};
  const pageText = pageConfig.text ?? {};

  const getText = (key: string, fallback: string) =>
    pageText[key] ?? textOverrides[`invest.${key}`] ?? textOverrides[key] ?? fallback;

  return {
    title:
      pageConfig.meta?.title ??
      getText(
        "seo.title",
        "Invest in Algarve Real Estate | Portugal Market Insights | AlgarveOfficial",
      ),
    description:
      pageConfig.meta?.description ??
      getText(
        "seo.description",
        "Explore investment opportunities in Algarve real estate, market data, ROI insights, and expert guidance for international buyers.",
      ),
  };
}

const getInvestGlobalSettings = cache(async (): Promise<GlobalSetting[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...INVEST_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as GlobalSetting[];
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getInvestGlobalSettings();
  const copy = resolveInvestCopy(settings);

  return buildMetadata({
    title: copy.title,
    description: copy.description,
    path: "/invest",
  });
}

export default async function InvestPage() {
  const settings = await getInvestGlobalSettings();
  const copy = resolveInvestCopy(settings);
  const pageSchema = buildWebPageSchema({
    type: "WebPage",
    name: copy.title,
    description: copy.description,
    url: `${SITE_URL}/invest`,
    image: `${SITE_URL}/og-image.png`,
    siteUrl: SITE_URL,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <div id="invest-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">Invest</p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              Algarve investment intelligence
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Market insight, strategy, and premium real-estate positioning for buyers and
              investors exploring the Algarve.
            </p>
          </section>
        </main>
      </div>

      <InvestClient initialGlobalSettings={settings} />
    </>
  );
}
