import { describe, expect, it } from "vitest";

import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { buildCmsSettingsFromDocuments } from "@/lib/cms/runtime-resolver";

describe("cms runtime resolver", () => {
  it("prefers locale-specific documents and falls back to default", () => {
    const settings = buildCmsSettingsFromDocuments(
      [
        {
          page_id: "home",
          locale: "default",
          doc_type: "page_config",
          current_version_id: 1,
        },
        {
          page_id: "home",
          locale: "pt",
          doc_type: "page_config",
          current_version_id: 2,
        },
        {
          page_id: "__global__",
          locale: "default",
          doc_type: "text_overrides",
          current_version_id: 3,
        },
        {
          page_id: "__global__",
          locale: "pt",
          doc_type: "custom_css",
          current_version_id: 4,
        },
      ],
      [
        { id: 1, content: { text: { "hero.title": "Hello" } } },
        { id: 2, content: { text: { "hero.title": "Olá" } } },
        { id: 3, content: { "home.hero.title": "Hello override" } },
        { id: 4, content: { css: ".hero{color:green;}" } },
      ],
      "pt",
    );

    const pageConfigs = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.pageConfigs]);
    const textOverrides = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.textOverrides]);

    expect(pageConfigs.home.text["hero.title"]).toBe("Olá");
    expect(textOverrides["home.hero.title"]).toBe("Hello override");
    expect(settings[CMS_GLOBAL_SETTING_KEYS.customCss]).toBe(".hero{color:green;}");
  });

  it("falls back to default locale docs and empty css when locale-specific docs are absent", () => {
    const settings = buildCmsSettingsFromDocuments(
      [
        {
          page_id: "directory",
          locale: "default",
          doc_type: "page_config",
          current_version_id: 10,
        },
        {
          page_id: "__global__",
          locale: "default",
          doc_type: "design_tokens",
          current_version_id: 11,
        },
      ],
      [
        { id: 10, content: { text: { "hero.title": "Directory" } } },
        { id: 11, content: { "--cms-card-radius": "10px" } },
      ],
      "fr",
    );

    const pageConfigs = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.pageConfigs]);
    const designTokens = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.designTokens]);
    const textOverrides = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.textOverrides]);

    expect(pageConfigs.directory.text["hero.title"]).toBe("Directory");
    expect(designTokens["--cms-card-radius"]).toBe("10px");
    expect(textOverrides).toEqual({});
    expect(settings[CMS_GLOBAL_SETTING_KEYS.customCss]).toBe("");
  });

  it("ignores block-level page_config docs and only uses page-level configs", () => {
    const settings = buildCmsSettingsFromDocuments(
      [
        {
          page_id: "experiences",
          locale: "en",
          block_id: "featured-city-hub",
          doc_type: "page_config",
          current_version_id: 100,
        },
        {
          page_id: "experiences",
          locale: "en",
          block_id: null,
          doc_type: "page_config",
          current_version_id: 101,
        },
      ],
      [
        {
          id: 100,
          content: {
            blocks: {
              "featured-city-hub": {
                data: { cityId: "wrong-city-id" },
              },
            },
          },
        },
        {
          id: 101,
          content: {
            blocks: {
              "featured-city-hub": {
                data: { cityId: "correct-city-id" },
              },
            },
          },
        },
      ],
      "en",
    );

    const pageConfigs = JSON.parse(settings[CMS_GLOBAL_SETTING_KEYS.pageConfigs]);
    expect(pageConfigs.experiences.blocks["featured-city-hub"].data.cityId).toBe("correct-city-id");
  });
});
