import { usePublicHomepageSettings } from "@/hooks/usePublicHomepageSettings";

export function usePublicHeroSettings() {
  const { settings, hasLocaleTranslation, isLoading } = usePublicHomepageSettings();

  return {
    settings,
    hasLocaleTranslation,
    isLoading,
  };
}
