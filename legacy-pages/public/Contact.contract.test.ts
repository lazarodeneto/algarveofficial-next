import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const SUPPORTED_LOCALES = ["en", "pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"] as const;

function source(path: string) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

function localeMessages(locale: string) {
  return JSON.parse(source(`i18n/locales/${locale}.json`)) as {
    contact?: {
      success?: string;
      successTitle?: string;
    };
  };
}

describe("public contact form confirmation", () => {
  it("renders a persistent localized success status after successful submission", () => {
    const component = source("legacy-pages/public/Contact.tsx");

    expect(component).toContain("showSuccessMessage");
    expect(component).toContain('role="status"');
    expect(component).toContain('aria-live="polite"');
    expect(component).toContain("t('contact.successTitle')");
    expect(component).toContain("formSuccessMessage");
  });

  it("keeps contact success copy translated for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const messages = localeMessages(locale);

      expect(messages.contact?.successTitle?.trim(), locale).toBeTruthy();
      expect(messages.contact?.success?.trim(), locale).toBeTruthy();
    }
  });
});
