export const TRANSLATION_PROCESSOR_UNCONFIGURED_PATTERN =
  /translation processor is not configured/i;

export function isProcessorUnconfiguredTranslationError(error: string | null | undefined): boolean {
  return TRANSLATION_PROCESSOR_UNCONFIGURED_PATTERN.test(error ?? "");
}
