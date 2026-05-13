export const TRANSLATION_PROCESSOR_UNAVAILABLE =
  "Translation processor is not configured. Missing translations require manual review or an enabled provider.";

export type TranslationProcessorProvider = "deepl" | "openai";

interface TranslationProcessorSelection {
  provider: TranslationProcessorProvider | null;
  missing: string[];
  disabled: boolean;
}

function envFlagDisabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "false" || value?.trim() === "0";
}

function hasSecret(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getTranslationProcessorSelection(): TranslationProcessorSelection {
  if (envFlagDisabled(process.env.TRANSLATION_PROCESSOR_ENABLED)) {
    return { provider: null, missing: [], disabled: true };
  }

  const requestedProvider = process.env.TRANSLATION_PROVIDER?.trim().toLowerCase();
  const deeplConfigured = hasSecret(process.env.DEEPL_API_KEY);
  const openAiConfigured = hasSecret(process.env.OPENAI_API_KEY);

  if (requestedProvider === "deepl") {
    return {
      provider: deeplConfigured ? "deepl" : null,
      missing: deeplConfigured ? [] : ["DEEPL_API_KEY"],
      disabled: false,
    };
  }

  if (requestedProvider === "openai") {
    return {
      provider: openAiConfigured ? "openai" : null,
      missing: openAiConfigured ? [] : ["OPENAI_API_KEY"],
      disabled: false,
    };
  }

  if (deeplConfigured) return { provider: "deepl", missing: [], disabled: false };
  if (openAiConfigured) return { provider: "openai", missing: [], disabled: false };

  return {
    provider: null,
    missing: ["DEEPL_API_KEY or OPENAI_API_KEY"],
    disabled: false,
  };
}

export function isTranslationProcessorConfigured(): boolean {
  return Boolean(getTranslationProcessorSelection().provider);
}

export function getTranslationProcessorCapabilities() {
  const selection = getTranslationProcessorSelection();
  const configured = Boolean(selection.provider);
  return {
    configured,
    mode: configured ? selection.provider : "manual",
    provider: selection.provider,
    missing: selection.missing,
    message: configured
      ? `Translation processor is configured using ${selection.provider}.`
      : selection.disabled
        ? "Translation processor is disabled by TRANSLATION_PROCESSOR_ENABLED=false. Missing translations require manual review."
        : `${TRANSLATION_PROCESSOR_UNAVAILABLE} Missing configuration: ${selection.missing.join(", ")}.`,
  };
}
