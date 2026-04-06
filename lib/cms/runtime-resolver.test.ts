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
});
