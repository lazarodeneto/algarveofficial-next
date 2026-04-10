import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Crown,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Loader2,
  CreditCard,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOwnerListings } from "@/hooks/useOwnerListings";
import { useSubscriptionPricing } from "@/hooks/useSubscriptionPricing";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SubscriptionTier, BillingPeriod } from "@/lib/stripePricing";
import Link from "next/link";
import { useLocalePath } from "@/hooks/useLocalePath";

export default function OwnerMembership() {
  const { t } = useTranslation();
  const router = useRouter();
  const l = useLocalePath();
  const pathname = usePathname() || "/owner/membership";
  const searchParams = useSearchParams();
  const { data: listings = [], isLoading: isListingsLoading } = useOwnerListings();
  const { membershipTiers, isLoading: isPricingLoading } = useSubscriptionPricing(t);
  const { 
    subscription, 
    isLoading: isSubscriptionLoading, 
    createCheckout, 
    openCustomerPortal,
    checkSubscription 
  } = useStripeSubscription();
  
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [checkoutInProgress, setCheckoutInProgress] = useState<string | null>(null);
  
  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const canceled = searchParams.get('canceled') === 'true';

    if (!success && !canceled) {
      return;
    }

    if (success) {
      toast.success(t('owner.membership.paymentSuccess'), {
        description: t('owner.membership.paymentSuccessDesc'),
        duration: 5000,
      });
      // Refresh subscription status
      checkSubscription();
    } else {
      toast.info(t('owner.membership.checkoutCanceled'));
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("success");
    nextParams.delete("canceled");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [checkSubscription, pathname, router, searchParams, t]);
  
  // Determine current tier from subscription or listings
  const currentTier = subscription.subscribed 
    ? subscription.tier 
    : listings.some(l => l.tier === 'signature') 
      ? 'signature' 
      : listings.some(l => l.tier === 'verified') 
        ? 'verified' 
        : 'unverified';
  
  const currentBillingPeriod = subscription.billingPeriod;
  
  const handleCheckout = async (tierId: string) => {
    if (tierId === 'unverified') return;
    if (tierId === currentTier && billingPeriod === currentBillingPeriod) return;

    setCheckoutInProgress(tierId);

    try {
      await createCheckout(tierId as SubscriptionTier, billingPeriod);
      toast.info(t('owner.membership.openingCheckout'), {
        description: t('owner.membership.openingCheckoutDesc'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('owner.membership.checkoutFailed');
      toast.error(t('owner.membership.checkoutFailed'), { description: message });
    } finally {
      setCheckoutInProgress(null);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
      toast.info(t('owner.membership.openingPortal'), {
        description: t('owner.membership.openingPortalDesc'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('owner.membership.portalFailed');
      toast.error(t('owner.membership.portalFailed'), { description: message });
    }
  };

  const getBillingPeriodLabel = (period: string | null | undefined) => {
    switch (period) {
      case "annual":
        return t("owner.membership.annual");
      case "monthly":
        return t("owner.membership.monthly");
      default:
        return period ?? "";
    }
  };

  const isLoading = isListingsLoading || isPricingLoading || isSubscriptionLoading;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
          {t('owner.membership.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('owner.membership.subtitle')}
        </p>
      </m.div>

      {/* Billing Period Toggle */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center p-1 rounded-full bg-muted/50 border border-border">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              "relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200",
              billingPeriod === 'monthly'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {billingPeriod === 'monthly' && (
              <m.div
                layoutId="billingToggle"
                className="absolute inset-0 bg-background rounded-full shadow-sm border border-border"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t('owner.membership.monthly')}</span>
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={cn(
              "relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2",
              billingPeriod === 'annual'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {billingPeriod === 'annual' && (
              <m.div
                layoutId="billingToggle"
                className="absolute inset-0 bg-background rounded-full shadow-sm border border-border"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t('owner.membership.annual')}</span>
            <span className="relative z-10 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              {t('owner.membership.save17')}
            </span>
          </button>
        </div>
      </m.div>

      {/* Current Status */}
      <Card className={cn(
        "border",
        subscription.subscribed 
          ? "bg-green-500/10 border-green-500/30" 
          : "bg-primary/5 border-primary/20"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                subscription.subscribed ? "bg-green-500/20" : "bg-primary/20"
              )}>
                <Crown className={cn(
                  "h-6 w-6",
                  subscription.subscribed ? "text-green-400" : "text-primary"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('owner.membership.yourCurrentPlan')}</p>
                <p className="text-xl font-semibold text-foreground capitalize flex items-center gap-2">
                  {currentTier === 'unverified' ? t('owner.membership.free') : currentTier}
                  {subscription.subscribed && currentBillingPeriod && (
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {currentBillingPeriod}
                    </span>
                  )}
                </p>
                {subscription.subscribed && subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {t('owner.membership.renews')} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {subscription.hasStripeCustomer && (
              <Button variant="outline" onClick={handleManageSubscription}>
                <CreditCard className="h-4 w-4 mr-2" />
                {t('owner.membership.manageSubscription')}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tiers Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {membershipTiers.map((tier, index) => {
          // Check for exact match: tier AND billing period must match
          const tierMatches = tier.id === currentTier;
          const billingMatches = !currentBillingPeriod || billingPeriod === currentBillingPeriod;
          const isCurrentTier = tierMatches && billingMatches;
          
          // Same tier but different billing cycle — switching billing period
          const isSameTierDifferentBilling = tierMatches && !billingMatches && subscription.hasStripeCustomer;

          // A paid tier the user can switch to (any direction: up, down, or billing period change)
          // Everything goes through createCheckout; Stripe handles proration automatically.
          const TIER_RANK: Record<string, number> = { unverified: 0, verified: 1, signature: 2 };
          const isPaidSwitch = !isCurrentTier && !isSameTierDifferentBilling && tier.id !== 'unverified';
          const isUpgrade = isPaidSwitch && (
            TIER_RANK[tier.id] > TIER_RANK[currentTier] ||
            (tierMatches && billingPeriod !== currentBillingPeriod)
          );
          const isDowngrade = isPaidSwitch && !isUpgrade;
          const isSignatureMonthlyBlocked = tier.id === 'signature' && billingPeriod === 'monthly';
          const pricing = isSignatureMonthlyBlocked
            ? tier.annual
            : billingPeriod === 'annual'
            ? tier.annual
            : tier.monthly;
          const showSavings = billingPeriod === 'annual' && tier.annual.savings && tier.annual.savings > 0;
          const isCheckingOut = checkoutInProgress === tier.id;
          const isVerifiedTier = tier.id === 'verified';
          const isSignatureTier = tier.id === 'signature';
          const cardToneClass = isSignatureTier
            ? "border-amber-500/50 bg-amber-500/5"
            : isVerifiedTier
              ? "border-green-500/50 bg-green-500/5"
              : "bg-card border-border";
          const blockedToneClass = isSignatureMonthlyBlocked ? "border-border bg-muted/40 text-muted-foreground" : "";
          const currentRingClass = isCurrentTier && !isSignatureMonthlyBlocked
            ? (isSignatureTier ? "ring-2 ring-amber-500/70" : isVerifiedTier ? "ring-2 ring-green-500" : "")
            : "";
          const currentBadgeClass = isSignatureTier
            ? "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-amber-500 text-amber-950"
            : "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white";
          
          return (
              <m.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
              <Card 
                className={cn(
                  "relative h-full transition-all flex flex-col",
                  cardToneClass,
                  currentRingClass,
                  blockedToneClass,
                  isSignatureMonthlyBlocked && "opacity-75 saturate-50"
                )}
              >
                <CardHeader>
                  {/* Badges row - inside card, never clipped */}
                  {(tier.id === 'verified' || isCurrentTier || isSignatureMonthlyBlocked) && (
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {tier.id === 'verified' && !isCurrentTier && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
                          {t('owner.membership.mostPopular')}
                        </span>
                      )}
                      {isSignatureMonthlyBlocked && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
                          {t('owner.membership.annualOnly')}
                        </span>
                      )}
                      {isCurrentTier && !isSignatureMonthlyBlocked && (
                        <span className={currentBadgeClass}>
                          <CheckCircle2 className="h-3 w-3" />
                          {t('owner.membership.currentPlan')}
                          {currentBillingPeriod && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-white/20">
                              {getBillingPeriodLabel(currentBillingPeriod)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {tier.id === 'signature' && <Crown className="h-5 w-5 text-amber-400" />}
                    {tier.id === 'verified' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {tier.id === 'unverified' && <Star className="h-5 w-5 text-muted-foreground" />}
                    <CardTitle>{tier.name}</CardTitle>
                    {tier.id === 'signature' && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('owner.membership.invitationOnly')}
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <AnimatePresence mode="wait">
                      <m.div
                        key={`${tier.id}-${billingPeriod}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Price row with savings badge on the right */}
                        <div className="flex items-end justify-between gap-3">
                          <div className="flex items-baseline flex-wrap gap-x-1">
                            <span className="text-3xl font-bold">{pricing.display}</span>
                            <span className="text-muted-foreground">/{pricing.note}</span>
                          </div>
                          {showSavings && (
                            <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              {t('owner.membership.saveAmount', { amount: tier.annual.savings })}
                            </span>
                          )}
                        </div>
                        {billingPeriod === 'annual' && pricing.monthlyEquivalent && (
                          <p className="text-sm text-primary mt-1">
                            {pricing.monthlyEquivalent}
                          </p>
                        )}
                      </m.div>
                    </AnimatePresence>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-1 flex-col gap-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      {tier.limitations.map((limitation, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="h-4 w-4 flex items-center justify-center text-muted-foreground flex-shrink-0">
                            –
                          </span>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action */}
                  <div className="mt-auto pt-4">
                    {tier.id === 'unverified' ? (
                      subscription.hasStripeCustomer ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleManageSubscription}
                        >
                          {t('owner.membership.downgradeToFree')}
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      ) : (
                        <Button disabled className="w-full" variant="ghost">
                          {t('owner.membership.freeForever')}
                        </Button>
                      )
                    ) : isSignatureMonthlyBlocked ? (
                      <Button disabled className="w-full" variant="ghost">
                        {t('owner.membership.annualOnly')}
                      </Button>
                    ) : isCurrentTier ? (
                      <Button disabled className="w-full" variant="outline">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('owner.membership.currentPlan')}
                      </Button>
                    ) : tier.id === 'signature' ? (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={l("/owner/support")}>
                          {t('owner.membership.invitationOnlyCta')}
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Link>
                      </Button>
                    ) : isSameTierDifferentBilling ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleCheckout(tier.id)}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('owner.membership.openingCheckoutShort')}
                          </>
                        ) : (
                          t('owner.membership.switchTo', { period: getBillingPeriodLabel(billingPeriod) })
                        )}
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        className={cn(
                          "w-full",
                          tier.id === "verified" && "bg-green-600 hover:bg-green-700 text-white border border-green-500 shadow-lg shadow-green-600/20"
                        )}
                        variant={tier.id === "verified" || tier.highlight ? "default" : "outline"}
                        onClick={() => handleCheckout(tier.id)}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('owner.membership.openingCheckoutShort')}
                          </>
                        ) : (
                          <>
                            {t('owner.membership.subscribeNow')}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : isDowngrade ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleCheckout(tier.id)}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('owner.membership.openingCheckoutShort')}
                          </>
                        ) : (
                          t('owner.membership.downgrade')
                        )}
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="ghost">
                        {t('owner.membership.notAvailable')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </m.div>
          );
        })}
      </div>

      {/* Signature Selection Info */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-primary/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            {t('owner.membership.curatedExcellenceTitle')}
          </CardTitle>
          <CardDescription>
            {t('owner.membership.curatedExcellenceSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('owner.membership.curatedExcellenceDesc')}
          </p>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">{t('owner.membership.howToGetSelected')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('owner.membership.howToGetSelectedDesc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('owner.membership.needHelpChoosing')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('owner.membership.needHelpChoosingDesc')}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href={l("/owner/support")}>{t('owner.membership.contactSupport')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
