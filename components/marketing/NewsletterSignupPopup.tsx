import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "@/components/router/nextRouterCompat";
import { CheckCircle2, Gift, Mail, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const POPUP_VERSION = "newsletter-popup-v1";
const DISMISS_KEY = "algarve-newsletter-popup-dismissed-at";
const SESSION_KEY = "algarve-newsletter-popup-seen";
const SUBSCRIBED_KEY = "algarve-newsletter-popup-subscribed";
const SHOW_DELAY_MS = 12000;
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3;
const LANG_PREFIX_RE = /^\/(pt-pt|fr|de|es|it|nl|sv|no|da)(?=\/|$)/;

function normalizePath(pathname: string): string {
  const withoutLang = pathname.replace(LANG_PREFIX_RE, "");
  return withoutLang.length > 0 ? withoutLang : "/";
}

function isEligiblePublicPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (normalized.startsWith("/admin")) return false;
  if (normalized.startsWith("/owner")) return false;
  if (normalized.startsWith("/dashboard")) return false;
  if (normalized.startsWith("/auth/")) return false;
  if (normalized === "/login" || normalized === "/signup" || normalized === "/forgot-password") return false;
  return true;
}

export function NewsletterSignupPopup() {
  const location = useLocation();
  const { t } = useTranslation();
  const { subscribe, isSubmitting } = useNewsletterSignup("popup-lead-magnet");
  const { canUseCategory, isLoaded } = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState("");
  const hasMarketingConsent = canUseCategory("marketing");

  const isEligiblePath = useMemo(
    () => isEligiblePublicPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    if (!isEligiblePath || !isLoaded || !hasMarketingConsent || typeof window === "undefined") {
      return;
    }

    if (localStorage.getItem(SUBSCRIBED_KEY) === POPUP_VERSION) return;
    if (sessionStorage.getItem(SESSION_KEY) === POPUP_VERSION) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    if (dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    let opened = false;
    const openPopup = () => {
      if (opened) return;
      opened = true;
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, POPUP_VERSION);
    };

    const timer = window.setTimeout(openPopup, SHOW_DELAY_MS);
    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && window.innerWidth >= 1024) {
        openPopup();
      }
    };

    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [hasMarketingConsent, isEligiblePath, isLoaded]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined" && hasMarketingConsent) {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }, [hasMarketingConsent]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const status = await subscribe({ email });

      if (status === "empty_email") {
        toast.error(t("newsletter.errorEmpty"));
        return;
      }

      if (status === "invalid_email") {
        toast.error(t("newsletter.errorInvalid"));
        return;
      }

      if (status === "rate_limited") {
        toast.error(t("newsletter.errorRateLimit"));
        return;
      }

      if (status === "error") {
        toast.error(t("newsletter.errorGeneric"));
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(SUBSCRIBED_KEY, POPUP_VERSION);
      }

      setIsCompleted(true);
      toast.success(
        status === "already_subscribed"
          ? t("newsletter.alreadySubscribed")
          : t("newsletter.welcomeMessage"),
      );
    },
    [email, subscribe, t],
  );

  if (!isOpen || !isEligiblePath || !isLoaded || !hasMarketingConsent) return null;

  return (
    <div className="fixed inset-0 z-[95] p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close newsletter popup"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-popup-title"
        className="relative mx-auto mt-12 w-full max-w-xl rounded-2xl border border-white/20 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:mt-20 sm:p-7"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={t("newsletter.popupDismiss", "Close popup")}
        >
          <X className="h-4 w-4" />
        </button>

        {isCompleted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 id="newsletter-popup-title" className="text-2xl font-serif text-foreground">
              {t("newsletter.popupSuccessTitle", "You are in. Check your inbox.")}
            </h3>
            <p className="text-muted-foreground">
              {t(
                "newsletter.popupSuccessBody",
                "Your Algarve Insider Guide and monthly curated updates are on the way.",
              )}
            </p>
            <Button variant="gold" className="min-w-36" onClick={handleClose}>
              {t("newsletter.popupClose", "Continue Browsing")}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <Gift className="h-3.5 w-3.5" />
              {t("newsletter.leadMagnetTag", "Free Lead Magnet")}
            </div>

            <div className="space-y-2">
              <h3 id="newsletter-popup-title" className="text-2xl sm:text-3xl font-serif text-foreground leading-tight">
                {t("newsletter.popupTitle", "Get the Algarve Insider Guide")}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  "newsletter.popupSubtitle",
                  "Subscribe and get our curated luxury guide plus monthly premium picks, events, and local opportunities.",
                )}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("newsletter.leadMagnetTitle", "What you get")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  "newsletter.leadMagnetDescription",
                  "A free Algarve Insider PDF + members-only highlights for stays, dining, events, and investment insights.",
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("newsletter.placeholder")}
                  autoComplete="email"
                  className="h-12 pl-10"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="h-12 w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? t("newsletter.subscribing")
                  : t("newsletter.popupCta", "Get Free Guide + Subscribe")}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground">
              {t("newsletter.privacy")}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
