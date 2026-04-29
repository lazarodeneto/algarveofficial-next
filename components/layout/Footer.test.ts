import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFooterMenu", () => ({
  useFooterMenu: () => ({ data: [] }),
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (path: string) => `/da${path}`,
}));

vi.mock("@/hooks/useNewsletterSignup", () => ({
  useNewsletterSignup: () => ({ subscribe: vi.fn(), isSubmitting: false }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? "" }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: () => null,
}));

vi.mock("@/components/ui/input", () => ({
  Input: () => null,
}));

vi.mock("@/components/ui/Button", () => ({
  Button: () => null,
}));

vi.mock("@/components/ui/label", () => ({
  Label: () => null,
}));

vi.mock("@/components/layout/FooterNav", () => ({
  FooterNav: () => null,
}));

import { normalizeFooterLinkHref } from "./Footer";

describe("normalizeFooterLinkHref", () => {
  const localize = (path: string) => `/da${path}`;

  it("re-localizes internal links that already contain a stale locale prefix", () => {
    expect(
      normalizeFooterLinkHref("/pt-pt/contact", "Contact", "company", localize),
    ).toBe("/da/contact");
  });

  it("re-localizes category links while preserving the canonical category slug", () => {
    expect(
      normalizeFooterLinkHref(
        "/fr/directory?category=1",
        "Places to Stay",
        "categories",
        localize,
      ),
    ).toBe("/da/directory?category=places-to-stay");
  });
});
