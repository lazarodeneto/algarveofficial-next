import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAnalyticsConsent } from '@/hooks/useAnalyticsConsent';
import { useCookieBannerSettings } from '@/hooks/useCookieBannerSettings';
import { useLocalizedHref } from '@/hooks/useLocalizedHref';
import Link from "next/link";

export function CookieConsentBanner() {
  const { showBanner, acceptConsent, rejectConsent } = useAnalyticsConsent();
  const { settings, isLoading } = useCookieBannerSettings();
  const { t, i18n } = useTranslation();
  const l = useLocalizedHref();
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? '').toLowerCase();
  const isEnglish = locale.startsWith('en');

  const title = isEnglish ? settings.title : t('cookie.title');
  const description = isEnglish ? settings.description : t('cookie.description');
  const learnMoreText = isEnglish ? settings.learn_more_text : t('cookie.learnMore');
  const declineText = isEnglish ? settings.decline_button_text : t('cookie.decline');
  const acceptText = isEnglish ? settings.accept_button_text : t('cookie.accept');
  const gdprBadgeText = isEnglish ? settings.gdpr_badge_text : t('cookie.gdprBadge');
  const dataRetentionText = isEnglish ? settings.data_retention_text : t('cookie.dataRetention');
  const learnMoreLink = isEnglish ? settings.learn_more_link : l('/privacy-policy');

  // Don't show while loading settings
  if (isLoading) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-xl border border-border bg-card/95 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                {/* Icon */}
                <div className="hidden md:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Shield className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-5 w-5 text-primary md:hidden" />
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}{' '}
                    <Link 
                      href={learnMoreLink} 
                      className="text-primary hover:underline font-medium"
                    >
                      {learnMoreText}
                    </Link>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 md:flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={rejectConsent}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {declineText}
                  </Button>
                  <Button
                    onClick={acceptConsent}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {acceptText}
                  </Button>
                </div>
              </div>

              {/* GDPR Badge */}
              {(settings.show_gdpr_badge || settings.show_data_retention) && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground md:justify-start md:ml-18">
                  {settings.show_gdpr_badge && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border">
                      <span className="text-primary">🇪🇺</span>
                      {gdprBadgeText}
                    </span>
                  )}
                  {settings.show_gdpr_badge && settings.show_data_retention && (
                    <span className="text-muted-foreground/60">•</span>
                  )}
                  {settings.show_data_retention && (
                    <span>{dataRetentionText}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
