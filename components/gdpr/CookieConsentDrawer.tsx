import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  COOKIE_PREFERENCES_OPEN_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieConsentRecord,
  type CookiePreferenceDraft,
  draftFromCookieConsent,
  getStoredCookieConsent,
  saveCookieConsent,
} from "@/lib/cookieConsent";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

interface CookieConsentDrawerProps {
  privacyUrl: string;
  cookieUrl: string;
  version: string;
  onConsentChange?: (consent: CookieConsentRecord) => void;
}

interface QuickToggleProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function QuickToggle({ id, label, checked, disabled = false, onChange }: QuickToggleProps) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-800">
      <span>{label}</span>
      <span className="relative inline-flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="h-4 w-8 sm:h-5 sm:w-10 rounded-full border border-zinc-300 bg-zinc-200 transition peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-[3px] top-[3px] h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full bg-white transition-transform peer-checked:translate-x-4 sm:peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function getInitialConsentState(version: string) {
  if (typeof window === "undefined") {
    return {
      isVisible: false,
      preferences: DEFAULT_COOKIE_PREFERENCES,
    };
  }

  const storedConsent = getStoredCookieConsent();
  if (!storedConsent) {
    return {
      isVisible: true,
      preferences: DEFAULT_COOKIE_PREFERENCES,
    };
  }

  return {
    isVisible: false,
    preferences: draftFromCookieConsent(storedConsent),
  };
}

export function CookieConsentDrawer({
  privacyUrl,
  cookieUrl,
  version,
  onConsentChange,
}: CookieConsentDrawerProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [baselinePreferences, setBaselinePreferences] = useState<CookiePreferenceDraft>(
    DEFAULT_COOKIE_PREFERENCES,
  );
  const [draftPreferences, setDraftPreferences] = useState<CookiePreferenceDraft>(
    DEFAULT_COOKIE_PREFERENCES,
  );

  useEffect(() => {
    const storedConsent = getStoredCookieConsent();
    const initialPreferences = draftFromCookieConsent(storedConsent);
    setBaselinePreferences(initialPreferences);
    setDraftPreferences(initialPreferences);

    if (!storedConsent) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const openPreferences = () => {
      const storedConsent = getStoredCookieConsent();
      const nextPreferences = draftFromCookieConsent(storedConsent);
      setBaselinePreferences(nextPreferences);
      setDraftPreferences(nextPreferences);
      setIsModalOpen(true);

      if (!storedConsent) {
        setIsVisible(true);
      }
    };

    window.addEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_OPEN_EVENT, openPreferences);
  }, [version]);

  const hasChanges = useMemo(
    () =>
      draftPreferences.functional !== baselinePreferences.functional ||
      draftPreferences.analytics !== baselinePreferences.analytics ||
      draftPreferences.marketing !== baselinePreferences.marketing,
    [
      baselinePreferences.analytics,
      baselinePreferences.functional,
      baselinePreferences.marketing,
      draftPreferences.analytics,
      draftPreferences.functional,
      draftPreferences.marketing,
    ],
  );

  const commitConsent = useCallback(
    (next: CookiePreferenceDraft) => {
      const consent: CookieConsentRecord = {
        essential: true,
        functional: next.functional,
        analytics: next.analytics,
        marketing: next.marketing,
        timestamp: Date.now(),
        version,
      };

      saveCookieConsent(consent);
      onConsentChange?.(consent);
      setBaselinePreferences(next);
      setDraftPreferences(next);
      setIsModalOpen(false);
      setIsVisible(false);
    },
    [onConsentChange, version],
  );

  const handleAcceptAll = useCallback(() => {
    commitConsent({ essential: true, functional: true, analytics: true, marketing: true });
  }, [commitConsent]);

  const handleRejectAll = useCallback(() => {
    commitConsent({ essential: true, functional: false, analytics: false, marketing: false });
  }, [commitConsent]);

  const handleSaveSettings = useCallback(() => {
    if (!hasChanges) return;
    commitConsent(draftPreferences);
  }, [commitConsent, draftPreferences, hasChanges]);

  const locale = useCurrentLocale().toLowerCase();
  const isEnglish = locale.startsWith("en");

  return (
    <>
      {isVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] p-0 sm:p-4">
          <section className="mx-auto w-full max-w-none max-h-[76svh] overflow-y-auto rounded-none border border-zinc-200 bg-white p-3 shadow-[0_14px_48px_rgba(15,23,42,0.16)] sm:max-w-[1200px] sm:max-h-[86svh] sm:rounded-2xl sm:p-6">
            <div className="grid gap-3 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    aria-hidden
                    className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 sm:flex sm:h-12 sm:w-12 sm:text-sm"
                  >
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-lg font-semibold leading-tight text-zinc-900 sm:text-2xl lg:text-3xl">
                      {t("cookie.title")}
                    </h2>
                    <p className="max-w-3xl text-[11px] leading-relaxed text-zinc-600 sm:hidden">
                      {t("cookie.description")}
                    </p>
                    <p className="hidden max-w-3xl text-xs leading-relaxed text-zinc-600 sm:block sm:text-sm lg:text-base">
                      {t("cookie.description")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium sm:gap-4 sm:text-sm">
                      <a className="text-zinc-800 underline-offset-4 hover:underline" href={privacyUrl}>
                        {t("footer.privacyPolicy")}
                      </a>
                      <a className="text-zinc-800 underline-offset-4 hover:underline" href={cookieUrl}>
                        {t("footer.cookiePolicy")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="h-9 w-full rounded-xl border border-zinc-300 bg-white px-2 text-[10px] font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 sm:h-12 sm:px-4 sm:text-sm"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="h-9 w-full rounded-xl border border-zinc-300 bg-zinc-200 px-2 text-[10px] font-semibold text-zinc-800 transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 sm:h-12 sm:px-4 sm:text-sm"
                >
                  {t("cookie.managePreferences", "Manage Preferences")}
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="h-9 w-full rounded-xl bg-emerald-600 px-2 text-[10px] font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:h-12 sm:px-4 sm:text-sm"
                >
                  {t("cookie.acceptAll", t("cookie.accept"))}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-zinc-200 pt-2.5 sm:mt-5 sm:gap-4 sm:pt-4">
              <div className="hidden text-xs font-medium uppercase tracking-wide text-zinc-500 sm:block">
                {t("cookie.optionalCategories")}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <QuickToggle id="cookie-essential" label="Necessary cookies" checked disabled />
                <QuickToggle
                  id="cookie-functional"
                  label="Functional cookies"
                  checked={draftPreferences.functional}
                  onChange={(checked) =>
                    setDraftPreferences((current) => ({
                      ...current,
                      functional: checked,
                    }))
                  }
                />
                <QuickToggle
                  id="cookie-analytics"
                  label="Analytics cookies"
                  checked={draftPreferences.analytics}
                  onChange={(checked) =>
                    setDraftPreferences((current) => ({
                      ...current,
                      analytics: checked,
                    }))
                  }
                />
                <QuickToggle
                  id="cookie-marketing"
                  label="Marketing cookies"
                  checked={draftPreferences.marketing}
                  onChange={(checked) =>
                    setDraftPreferences((current) => ({
                      ...current,
                      marketing: checked,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-semibold text-zinc-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 sm:text-sm"
                >
                  {t("cookie.details")} &gt;
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <CookiePreferencesModal
        isOpen={isModalOpen}
        privacyUrl={privacyUrl}
        cookieUrl={cookieUrl}
        preferences={draftPreferences}
        saveDisabled={!hasChanges}
        showEnglishDescriptions={isEnglish}
        onClose={() => setIsModalOpen(false)}
        onPreferencesChange={setDraftPreferences}
        onAcceptAll={handleAcceptAll}
        onDenyAll={handleRejectAll}
        onSave={handleSaveSettings}
      />
    </>
  );
}
