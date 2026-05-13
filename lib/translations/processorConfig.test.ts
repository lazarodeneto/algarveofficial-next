import { afterEach, describe, expect, it } from "vitest";

import {
  getTranslationProcessorCapabilities,
  getTranslationProcessorSelection,
  isTranslationProcessorConfigured,
} from "@/lib/translations/processorConfig";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("translation processor configuration", () => {
  it("stays in manual mode without a real provider secret", () => {
    delete process.env.DEEPL_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.TRANSLATION_PROVIDER;
    process.env.TRANSLATION_PROCESSOR_ENABLED = "true";

    expect(isTranslationProcessorConfigured()).toBe(false);
    expect(getTranslationProcessorSelection()).toMatchObject({
      provider: null,
      missing: ["DEEPL_API_KEY or OPENAI_API_KEY"],
    });
  });

  it("detects DeepL when its secret is configured", () => {
    process.env.DEEPL_API_KEY = "deepl-secret";
    delete process.env.OPENAI_API_KEY;
    delete process.env.TRANSLATION_PROVIDER;

    expect(isTranslationProcessorConfigured()).toBe(true);
    expect(getTranslationProcessorCapabilities()).toMatchObject({
      configured: true,
      provider: "deepl",
      mode: "deepl",
    });
  });

  it("honors an explicit provider selection", () => {
    process.env.TRANSLATION_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "openai-secret";
    process.env.DEEPL_API_KEY = "deepl-secret";

    expect(getTranslationProcessorSelection()).toMatchObject({
      provider: "openai",
      missing: [],
    });
  });

  it("can be explicitly disabled", () => {
    process.env.TRANSLATION_PROCESSOR_ENABLED = "false";
    process.env.DEEPL_API_KEY = "deepl-secret";

    expect(isTranslationProcessorConfigured()).toBe(false);
    expect(getTranslationProcessorCapabilities()).toMatchObject({
      configured: false,
      mode: "manual",
    });
  });
});
