import { describe, expect, it } from "vitest";

import { buildCmsWritesFromGlobalSettings } from "@/lib/cms/server-persistence";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

describe("cms server persistence mapper", () => {
  it("maps global setting payloads to cms v2 write items", () => {
    const writes = buildCmsWritesFromGlobalSettings([
      {
        key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
        value: JSON.stringify({
          home: { text: { "hero.title": "Welcome" } },
          directory: { blocks: { listings: { enabled: true } } },
        }),
      },
      {
        key: CMS_GLOBAL_SETTING_KEYS.textOverrides,
        value: JSON.stringify({ "home.hero.title": "Welcome" }),
      },
      {
        key: CMS_GLOBAL_SETTING_KEYS.designTokens,
        value: JSON.stringify({ "--cms-card-radius": "8px" }),
      },
      {
        key: CMS_GLOBAL_SETTING_KEYS.customCss,
        value: ".hero { color: red; }",
      },
    ]);

    expect(writes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pageId: "home", docType: "page_config", locale: "default" }),
        expect.objectContaining({ pageId: "directory", docType: "page_config", locale: "default" }),
        expect.objectContaining({ pageId: "__global__", docType: "text_overrides" }),
        expect.objectContaining({ pageId: "__global__", docType: "design_tokens" }),
        expect.objectContaining({ pageId: "__global__", docType: "custom_css" }),
      ]),
    );
  });
});
