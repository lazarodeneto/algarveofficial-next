import { useState } from "react";
import { Mail, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNewsletterSignup } from "@/hooks/useNewsletterSignup";

export function NewsletterSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { subscribe, isSubmitting } = useNewsletterSignup("newsletter");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('newsletter.errorEmpty'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error(t('newsletter.errorInvalid'));
      return;
    }

    const status = await subscribe({
      email,
      honeypot,
      submittedAt,
      source: "newsletter",
    });

    if (status === "rate_limited") {
      toast.error(t('newsletter.errorRateLimit'));
      return;
    }

    if (status === "error") {
      toast.error(t('newsletter.errorGeneric'));
      return;
    }

    setIsSubscribed(true);
    toast.success(t('newsletter.welcomeMessage'));
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-card/50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/20 p-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-medium not-italic text-foreground">
              {t('newsletter.successTitle')}
            </h3>
            <p className="text-muted-foreground">
              {t('newsletter.successMessage')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 right-1/3 w-px h-20 bg-gradient-to-t from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <div>
          {/* Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-foreground mb-3">
            {t('newsletter.title')} <span className="text-gradient-gold">{t('newsletter.titleHighlight')}</span>
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('newsletter.subtitle')}
          </p>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onFocus={() => setSubmittedAt((value) => value ?? Date.now())}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                className="pl-10 h-12 bg-background border-border/50 focus:border-primary"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={isSubmitting}
              className="h-12 px-6 whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('newsletter.subscribing')}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {t('newsletter.subscribe')}
                </>
              )}
            </Button>
          </form>

          {/* Privacy note */}
          <p className="mt-4 text-xs text-muted-foreground">
            {t('newsletter.privacy')}
          </p>
        </div>
      </div>
    </section>
  );
}
