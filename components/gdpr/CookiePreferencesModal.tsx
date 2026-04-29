import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { CookiePreferenceDraft } from "@/lib/cookieConsent";

interface CookiePreferencesModalProps {
  isOpen: boolean;
  privacyUrl: string;
  cookieUrl: string;
  preferences: CookiePreferenceDraft;
  saveDisabled: boolean;
  showEnglishDescriptions: boolean;
  onClose: () => void;
  onPreferencesChange: (next: CookiePreferenceDraft) => void;
  onAcceptAll: () => void;
  onDenyAll: () => void;
  onSave: () => void;
}

interface PreferenceSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function PreferenceSwitch({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: PreferenceSwitchProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <label htmlFor={id} className="text-sm font-semibold text-zinc-900">
            {label}
          </label>
          {description ? (
            <p className="text-sm leading-relaxed text-zinc-600">{description}</p>
          ) : null}
        </div>

        <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.checked)}
          />
          <span className="h-6 w-11 rounded-full border border-zinc-300 bg-zinc-200 transition peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
          <span className="pointer-events-none absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
        </label>
      </div>
    </div>
  );
}

export function CookiePreferencesModal({
  isOpen,
  privacyUrl,
  cookieUrl,
  preferences,
  saveDisabled,
  showEnglishDescriptions,
  onClose,
  onPreferencesChange,
  onAcceptAll,
  onDenyAll,
  onSave,
}: CookiePreferencesModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableElements = dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const firstFocusable = focusableElements[0] ?? dialogRef.current;
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const availableFocusable = dialogRef.current
        ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];

      if (availableFocusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = availableFocusable[0];
      const last = availableFocusable[availableFocusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !dialogRef.current?.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-zinc-900/45 p-0 sm:p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="mx-auto mt-0 max-h-[100vh] w-full max-w-none overflow-auto rounded-none border border-zinc-200 bg-white p-4 shadow-2xl sm:mt-4 sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-semibold text-zinc-900">
              {t("cookie.preferencesTitle", t("cookie.title"))}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm text-zinc-600">
              {t("cookie.description")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-700">
              <a href={privacyUrl} className="underline-offset-4 hover:underline">
                {t("footer.privacyPolicy")}
              </a>
              <a href={cookieUrl} className="underline-offset-4 hover:underline">
                {t("footer.cookiePolicy")}
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            aria-label={t("cookie.closePreferences")}
          >
            <span aria-hidden className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-3">
          <PreferenceSwitch
            id="modal-essential"
            label="Necessary cookies"
            description={
              showEnglishDescriptions
                ? "Required for security, authentication, and core website functionality."
                : ""
            }
            checked
            disabled
          />
          <PreferenceSwitch
            id="modal-functional"
            label="Functional cookies"
            description={
              showEnglishDescriptions
                ? "Enables embedded media and convenience features such as richer interactive experiences."
                : ""
            }
            checked={preferences.functional}
            onChange={(checked) =>
              onPreferencesChange({
                ...preferences,
                functional: checked,
              })
            }
          />
          <PreferenceSwitch
            id="modal-analytics"
            label="Analytics cookies"
            description={
              showEnglishDescriptions
                ? "Measures visits, page views, and site performance so we can improve the experience."
                : ""
            }
            checked={preferences.analytics}
            onChange={(checked) =>
              onPreferencesChange({
                ...preferences,
                analytics: checked,
              })
            }
          />
          <PreferenceSwitch
            id="modal-marketing"
            label="Marketing cookies"
            description={
              showEnglishDescriptions
                ? "Controls marketing prompts, campaign measurement, and related promotional technologies."
                : ""
            }
            checked={preferences.marketing}
            onChange={(checked) =>
              onPreferencesChange({
                ...preferences,
                marketing: checked,
              })
            }
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDenyAll}
            className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="h-12 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {t("cookie.acceptAll", t("cookie.accept"))}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className="col-span-2 h-12 rounded-xl border border-zinc-300 bg-zinc-200 px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            {t("cookie.savePreferences", t("cookie.saveSettings"))}
          </button>
        </div>
      </div>
    </div>
  );
}
