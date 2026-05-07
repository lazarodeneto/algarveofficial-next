import { describe, expect, it } from "vitest";

import { buildCmsWritesFromGlobalSettings, deepMergeContent } from "@/lib/cms/server-persistence";
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

  it("maps locale-aware writes to locale-specific cms documents", () => {
    const writes = buildCmsWritesFromGlobalSettings([
      {
        key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
        value: JSON.stringify({ home: { text: { "hero.title": "Olá" } } }),
        locale: "pt-pt",
      },
      {
        key: CMS_GLOBAL_SETTING_KEYS.customCss,
        value: ".hero { color: green; }",
        locale: "pt-pt",
      },
    ]);

    expect(writes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pageId: "home", docType: "page_config", locale: "pt-pt" }),
        expect.objectContaining({ pageId: "__global__", docType: "custom_css", locale: "pt-pt" }),
      ]),
    );
  });

  it("normalizes CMS image fields before mirroring global settings into documents", () => {
    const writes = buildCmsWritesFromGlobalSettings([
      {
        key: CMS_GLOBAL_SETTING_KEYS.pageConfigs,
        value: JSON.stringify({
          golf: {
            hero: { imageUrl: "images/golf.webp" },
            blocks: {
              discovery: {
                data: {
                  cards: [{ imageUrl: "https://unsupported.example/card.webp" }],
                },
              },
            },
          },
        }),
      },
    ]);

    expect(writes).toEqual([
      expect.objectContaining({
        pageId: "golf",
        content: {
          hero: { imageUrl: "/images/golf.webp" },
          blocks: {
            discovery: {
              data: {
                cards: [{ imageUrl: "" }],
              },
            },
          },
        },
      }),
    ]);
  });

  it("keeps explicit empty media values when merging CMS page content", () => {
    const merged = deepMergeContent(
      {
        hero: {
          mediaType: "image",
          imageUrl: "https://images.example.com/old-golf-hero.webp",
          videoUrl: "https://videos.example.com/old-golf-hero.mp4",
          posterUrl: "https://images.example.com/old-golf-poster.webp",
        },
      },
      {
        hero: {
          mediaType: "image",
          imageUrl: "",
          videoUrl: "",
          youtubeUrl: "",
          posterUrl: "",
        },
      },
    );

    expect(merged).toEqual({
      hero: {
        mediaType: "image",
        imageUrl: "",
        videoUrl: "",
        youtubeUrl: "",
        posterUrl: "",
      },
    });
  });
});
