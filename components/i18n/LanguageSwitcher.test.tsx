import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LOCALE_CONFIGS, SUPPORTED_LOCALES } from "@/lib/i18n/config";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("@/hooks/useCurrentLocale", () => ({
  useCurrentLocale: () => "en",
}));

vi.mock("@/hooks/useLocaleRouter", () => ({
  useLocaleRouter: () => ({
    switchLocale: vi.fn(),
  }),
}));

describe("LanguageSwitcher", () => {
  it("renders full display names for every supported locale", () => {
    render(<LanguageSwitcher />);

    const optionLabels = screen.getAllByRole("option").map((option) => option.textContent);

    expect(optionLabels).toEqual(
      SUPPORTED_LOCALES.map((locale) => LOCALE_CONFIGS[locale].name),
    );
  });
});
