import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CreditCard,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useSubscriptionPricing, SubscriptionPricing, PromotionalCode } from "@/hooks/useSubscriptionPricing";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const BILLING_ORDER: Record<string, number> = {
  monthly: 1,
  annual: 2,
  period: 3,
};

export default function AdminSubscriptions() {
  const { t } = useTranslation();
  const {
    pricing,
    promotions,
    isLoading,
    isLoadingPromotions,
    updatePricing,
    createPricing,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
  } = useSubscriptionPricing();

  const [editingPricing, setEditingPricing] = useState<SubscriptionPricing | null>(null);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionalCode | null>(null);
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null);

  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    price: 0,
    display_price: '',
    note: '',
    period_length: null as number | null,
    period_unit: 'months' as 'days' | 'months',
    period_start_date: null as Date | null,
    period_end_date: null as Date | null,
    monthly_equivalent: '',
    savings: 0,
  });

  // Promo form state
  const [promoForm, setPromoForm] = useState({
    name: '',
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    applicable_tiers: [] as string[],
    applicable_billing: [] as string[],
    period_length: null as number | null,
    period_unit: 'months' as 'days' | 'months',
    start_date: new Date(),
    end_date: new Date(),
    is_active: false,
    max_uses: null as number | null,
  });

  // Parse euro amount from display price string (e.g., "€990", "€1,990")
  const parseDisplayPrice = (displayPrice: string): number => {
    const cleaned = displayPrice.replace(/[€\s,]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  };

  const buildPeriodNote = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) return t("admin.subscriptions.periodAdminDefined", "Admin-defined period");
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const handleEditPricing = (p: SubscriptionPricing) => {
    setEditingPricing(p);
    setPricingForm({
      price: p.price,
      display_price: p.display_price,
      note: p.note,
      period_length: p.period_length,
      period_unit: p.period_unit || 'months',
      period_start_date: p.period_start_date ? new Date(p.period_start_date) : null,
      period_end_date: p.period_end_date ? new Date(p.period_end_date) : null,
      monthly_equivalent: p.monthly_equivalent || '',
      savings: p.savings,
    });
  };

  // Auto-calculate dependent fields when display price changes
  const handleDisplayPriceChange = (value: string) => {
    const euroAmount = parseDisplayPrice(value);
    const priceInCents = Math.round(euroAmount * 100);

    const updates: Partial<typeof pricingForm> = {
      display_price: value,
      price: priceInCents,
    };

    // For annual plans, also calculate monthly equivalent and savings
    if (editingPricing?.billing_period === 'annual') {
      const monthlyEquivalent = euroAmount / 12;
      updates.monthly_equivalent = euroAmount > 0 ? `€${monthlyEquivalent.toFixed(2)}/mo` : '';

      // Find corresponding monthly price for this tier
      const monthlyPricing = pricing.find(
        (p) => p.tier === editingPricing.tier && p.billing_period === 'monthly'
      );

      if (monthlyPricing) {
        const monthlyEuros = monthlyPricing.price / 100;
        const yearlyIfMonthly = monthlyEuros * 12;
        const savings = Math.round(yearlyIfMonthly - euroAmount);
        updates.savings = Math.max(0, savings);
      }
    }

    if (editingPricing?.billing_period === 'period') {
      updates.monthly_equivalent = '';
      updates.savings = 0;
    }

    setPricingForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSavePricing = async () => {
    if (!editingPricing) return;

    if (editingPricing.billing_period === 'period' && (!pricingForm.period_start_date || !pricingForm.period_end_date)) {
      toast.error(t("admin.subscriptions.periodDateRangeRequired", "Please define start and end dates for period pricing."));
      return;
    }

    if (
      editingPricing.billing_period === 'period' &&
      pricingForm.period_start_date &&
      pricingForm.period_end_date &&
      pricingForm.period_end_date < pricingForm.period_start_date
    ) {
      toast.error(t("admin.subscriptions.periodDateRangeInvalid", "End date must be after start date."));
      return;
    }

    const isVirtualPeriod = editingPricing.id.startsWith("__virtual-period-");
    const isPeriodPricing = editingPricing.billing_period === 'period';

    const payload = {
      ...pricingForm,
      note: isPeriodPricing
        ? buildPeriodNote(pricingForm.period_start_date, pricingForm.period_end_date)
        : pricingForm.note,
      period_length: null,
      period_unit: null,
      period_start_date: isPeriodPricing && pricingForm.period_start_date
        ? format(pricingForm.period_start_date, "yyyy-MM-dd")
        : null,
      period_end_date: isPeriodPricing && pricingForm.period_end_date
        ? format(pricingForm.period_end_date, "yyyy-MM-dd")
        : null,
      monthly_equivalent: editingPricing.billing_period === 'annual'
        ? (pricingForm.monthly_equivalent || null)
        : null,
      savings: editingPricing.billing_period === 'annual' ? pricingForm.savings : 0,
    };

    try {
      if (isVirtualPeriod) {
        await createPricing.mutateAsync({
          tier: editingPricing.tier,
          billing_period: 'period',
          price: payload.price,
          display_price: payload.display_price,
          note: payload.note,
          period_length: payload.period_length,
          period_unit: payload.period_unit,
          period_start_date: payload.period_start_date,
          period_end_date: payload.period_end_date,
          monthly_equivalent: null,
          savings: 0,
        });
      } else {
        await updatePricing.mutateAsync({
          id: editingPricing.id,
          ...payload,
        });
      }

      setEditingPricing(null);
    } catch {
      // Error toasts are handled in the mutation hooks.
    }
  };

  const handleOpenPromoDialog = (promo?: PromotionalCode) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        name: promo.name,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        applicable_tiers: promo.applicable_tiers,
        applicable_billing: promo.applicable_billing,
        period_length: promo.period_length,
        period_unit: promo.period_unit || 'months',
        start_date: new Date(promo.start_date),
        end_date: new Date(promo.end_date),
        is_active: promo.is_active,
        max_uses: promo.max_uses,
      });
    } else {
      setEditingPromo(null);
      setPromoForm({
        name: '',
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        applicable_tiers: ['unverified', 'verified', 'signature'],
        applicable_billing: ['monthly', 'annual', 'period'],
        period_length: null,
        period_unit: 'months',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        is_active: false,
        max_uses: null,
      });
    }
    setPromoDialogOpen(true);
  };

  const handleSavePromo = async () => {
    const hasPeriodBilling = promoForm.applicable_billing.includes('period');
    if (hasPeriodBilling && (!promoForm.period_length || promoForm.period_length <= 0)) {
      toast.error(t("admin.subscriptions.periodLengthRequired", "Please define a valid period length."));
      return;
    }

    const payload = {
      ...promoForm,
      period_length: hasPeriodBilling ? promoForm.period_length : null,
      period_unit: hasPeriodBilling ? promoForm.period_unit : null,
      start_date: promoForm.start_date.toISOString(),
      end_date: promoForm.end_date.toISOString(),
    };

    try {
      if (editingPromo) {
        await updatePromotion.mutateAsync({ id: editingPromo.id, ...payload });
      } else {
        await createPromotion.mutateAsync(payload);
      }
      setPromoDialogOpen(false);
    } catch {
      // Error toasts are handled in the mutation hooks.
    }
  };

  const handleDeletePromo = async () => {
    if (!deletePromoId) return;
    try {
      await deletePromotion.mutateAsync(deletePromoId);
      setDeletePromoId(null);
    } catch {
      // Error toasts are handled in the mutation hooks.
    }
  };

  const getPromoStatus = (promo: PromotionalCode) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (!promo.is_active) return { label: t("admin.subscriptions.status.inactive"), variant: 'secondary' as const };
    if (now < start) return { label: t("admin.subscriptions.status.scheduled"), variant: 'outline' as const };
    if (now > end) return { label: t("admin.subscriptions.status.expired"), variant: 'destructive' as const };
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return { label: t("admin.subscriptions.status.limitReached"), variant: 'destructive' as const };
    }
    return { label: t("admin.subscriptions.status.active"), variant: 'default' as const };
  };

  const tierLabels: Record<string, string> = {
    unverified: t("common.unverified"),
    verified: t("common.verified"),
    signature: t("common.signature"),
  };

  const billingLabels: Record<string, string> = {
    monthly: t("admin.subscriptions.billing.monthly", "Monthly"),
    annual: t("admin.subscriptions.billing.annual", "Annual"),
    period: t("admin.subscriptions.billing.period", "Period"),
  };

  const sortedPricingByTier = useMemo(() => {
    const ensurePeriodOption = (
      tierPricing: SubscriptionPricing[],
      tier: "verified" | "signature"
    ): SubscriptionPricing[] => {
      if (tierPricing.some((p) => p.billing_period === "period")) {
        return tierPricing;
      }

      return [
        ...tierPricing,
        {
          id: `__virtual-period-${tier}`,
          tier,
          billing_period: "period",
          price: 0,
          display_price: "€0",
          note: t("admin.subscriptions.periodAdminDefined", "Admin-defined period"),
          period_length: null,
          period_unit: null,
          period_start_date: null,
          period_end_date: null,
          monthly_equivalent: null,
          savings: 0,
          updated_at: new Date(0).toISOString(),
        },
      ];
    };

    const sortByBilling = (a: SubscriptionPricing, b: SubscriptionPricing) =>
      (BILLING_ORDER[a.billing_period] ?? 99) - (BILLING_ORDER[b.billing_period] ?? 99);

    return {
      verified: ensurePeriodOption(
        pricing.filter((p) => p.tier === "verified").sort(sortByBilling),
        "verified"
      ),
      signature: ensurePeriodOption(
        pricing.filter((p) => p.tier === "signature").sort(sortByBilling),
        "signature"
      ),
    };
  }, [pricing, t]);

  const periodUnitLabels: Record<'days' | 'months', string> = {
    days: t("admin.subscriptions.periodUnit.days", "Days"),
    months: t("admin.subscriptions.periodUnit.months", "Months"),
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
            {t("admin.subscriptions.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.subscriptions.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t("admin.subscriptions.pricing")}
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2">
            <Tag className="h-4 w-4" />
            {t("admin.subscriptions.promotions")}
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          {/* Verified Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("admin.subscriptions.verifiedTier")}</CardTitle>
              <CardDescription>{t("admin.subscriptions.verifiedDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {sortedPricingByTier.verified.map((p) => {
                    return (
                    <Card key={p.id} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium capitalize">
                            {billingLabels[p.billing_period] || p.billing_period}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPricing(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{p.display_price}</p>
                          <p className="text-sm text-muted-foreground">{p.note}</p>
                          {p.monthly_equivalent && (
                            <p className="text-sm text-primary">{p.monthly_equivalent}</p>
                          )}
                          {p.savings > 0 && (
                            <p className="text-sm text-green-500">{t("admin.subscriptions.saveAmount", { amount: p.savings })}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )})}
              </div>
            </CardContent>
          </Card>

          {/* Signature Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("admin.subscriptions.signatureTier")}</CardTitle>
              <CardDescription>{t("admin.subscriptions.signatureDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {sortedPricingByTier.signature.map((p) => {
                    return (
                    <Card key={p.id} className="bg-amber-500/5 border-amber-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium capitalize">
                            {billingLabels[p.billing_period] || p.billing_period}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPricing(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{p.display_price}</p>
                          <p className="text-sm text-muted-foreground">{p.note}</p>
                          {p.monthly_equivalent && (
                            <p className="text-sm text-primary">{p.monthly_equivalent}</p>
                          )}
                          {p.savings > 0 && (
                            <p className="text-sm text-green-500">{t("admin.subscriptions.saveAmount", { amount: p.savings })}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )})}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenPromoDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.subscriptions.createPromotion")}
            </Button>
          </div>

          {isLoadingPromotions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : promotions.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-12 text-center">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("admin.subscriptions.noPromotionsYet")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("admin.subscriptions.noPromotionsDescription")}
                </p>
                <Button onClick={() => handleOpenPromoDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.subscriptions.createPromotion")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => {
                const status = getPromoStatus(promo);
                return (
                  <Card key={promo.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{promo.name}</h3>
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <Badge variant="outline" className="font-mono">
                              {promo.discount_type === 'percentage'
                                ? t("admin.subscriptions.discountPercentOff", { value: promo.discount_value })
                                : t("admin.subscriptions.discountFixedOff", { value: promo.discount_value })}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">{t("admin.subscriptions.codeLabel")}:</span>{' '}
                              <span className="font-mono">{promo.code}</span>
                            </p>
                            <p>
                              <span className="font-medium">{t("admin.subscriptions.validLabel")}:</span>{' '}
                              {format(new Date(promo.start_date), 'MMM d, yyyy')} -{' '}
                              {format(new Date(promo.end_date), 'MMM d, yyyy')}
                            </p>
                            <p>
                              <span className="font-medium">{t("admin.subscriptions.appliesToLabel")}:</span>{' '}
                              {promo.applicable_tiers.map((t) => tierLabels[t] || t).join(', ')},{' '}
                              {promo.applicable_billing.map((b) => billingLabels[b] || b).join(', ')}
                            </p>
                            {promo.applicable_billing.includes('period') && (
                              <p>
                                <span className="font-medium">{t("admin.subscriptions.periodLength", "Period Length")}:</span>{' '}
                                {promo.period_length && promo.period_unit
                                  ? `${promo.period_length} ${periodUnitLabels[promo.period_unit]}`
                                  : t("admin.subscriptions.periodAdminDefined", "Admin-defined period")}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">{t("admin.subscriptions.usesLabel")}:</span>{' '}
                              {promo.current_uses} / {promo.max_uses ?? t("admin.subscriptions.unlimited")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promo.is_active}
                            onCheckedChange={(checked) =>
                              togglePromotion.mutate({ id: promo.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPromoDialog(promo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletePromoId(promo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pricing Edit Dialog */}
      <Dialog open={!!editingPricing} onOpenChange={() => setEditingPricing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.subscriptions.editPricing", {
                tier: editingPricing?.tier,
                billing: editingPricing?.billing_period,
              })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.subscriptions.updatePricingDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Display Price - Primary input that drives calculations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.displayPriceRequired")}</Label>
                <Input
                  value={pricingForm.display_price}
                  onChange={(e) => handleDisplayPriceChange(e.target.value)}
                  placeholder={t("admin.subscriptions.displayPricePlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("admin.subscriptions.enterPriceHint")}</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  {t("admin.subscriptions.priceCents")}
                  <span className="text-xs text-muted-foreground font-normal">{t("admin.subscriptions.auto")}</span>
                </Label>
                <Input
                  type="number"
                  value={pricingForm.price}
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">{t("admin.subscriptions.autoCalculatedPrice")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.subscriptions.note")}</Label>
              <Input
                value={pricingForm.note}
                onChange={(e) => setPricingForm({ ...pricingForm, note: e.target.value })}
                placeholder={t("admin.subscriptions.notePlaceholder")}
                readOnly={editingPricing?.billing_period === 'period'}
                className={editingPricing?.billing_period === 'period' ? "bg-muted/50 cursor-not-allowed" : undefined}
              />
            </div>
            {editingPricing?.billing_period === 'period' && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Label>{t("admin.subscriptions.startDate", "Start Date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="h-4 w-4 mr-2" />
                        {pricingForm.period_start_date
                          ? format(pricingForm.period_start_date, "MMM d, yyyy")
                          : t("admin.subscriptions.selectDate", "Select date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={pricingForm.period_start_date ?? undefined}
                        onSelect={(date) =>
                          setPricingForm((prev) => ({
                            ...prev,
                            period_start_date: date ?? null,
                            note: buildPeriodNote(date ?? null, prev.period_end_date),
                          }))
                        }
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.subscriptions.endDate", "End Date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="h-4 w-4 mr-2" />
                        {pricingForm.period_end_date
                          ? format(pricingForm.period_end_date, "MMM d, yyyy")
                          : t("admin.subscriptions.selectDate", "Select date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={pricingForm.period_end_date ?? undefined}
                        onSelect={(date) =>
                          setPricingForm((prev) => ({
                            ...prev,
                            period_end_date: date ?? null,
                            note: buildPeriodNote(prev.period_start_date, date ?? null),
                          }))
                        }
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            {editingPricing?.billing_period === 'annual' && (
              <>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">{t("admin.subscriptions.annualAutoCalculations")}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        {t("admin.subscriptions.monthlyEquivalent")}
                        <span className="text-xs text-muted-foreground font-normal">{t("admin.subscriptions.auto")}</span>
                      </Label>
                      <Input
                        value={pricingForm.monthly_equivalent}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
                        placeholder={t("admin.subscriptions.monthlyEquivalentPlaceholder")}
                      />
                      <p className="text-xs text-muted-foreground">{t("admin.subscriptions.monthlyEquivalentHint")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        {t("admin.subscriptions.savingsEuro")}
                        <span className="text-xs text-muted-foreground font-normal">{t("admin.subscriptions.auto")}</span>
                      </Label>
                      <Input
                        type="number"
                        value={pricingForm.savings}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">{t("admin.subscriptions.savingsHint")}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPricing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSavePricing} disabled={updatePricing.isPending || createPricing.isPending}>
              {(updatePricing.isPending || createPricing.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Create/Edit Dialog */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromo ? t("admin.subscriptions.editPromotion") : t("admin.subscriptions.createPromotion")}</DialogTitle>
            <DialogDescription>
              {editingPromo
                ? t("admin.subscriptions.updatePromotionDescription")
                : t("admin.subscriptions.newPromotionDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.nameRequired")}</Label>
                <Input
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  placeholder={t("admin.subscriptions.promoNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.codeRequired")}</Label>
                <Input
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder={t("admin.subscriptions.promoCodePlaceholder")}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.discountType")}</Label>
                <Select
                  value={promoForm.discount_type}
                  onValueChange={(v) =>
                    setPromoForm({ ...promoForm, discount_type: v as 'percentage' | 'fixed' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{t("admin.subscriptions.discountTypePercentage")}</SelectItem>
                    <SelectItem value="fixed">{t("admin.subscriptions.discountTypeFixed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {t("admin.subscriptions.discountValue")} {promoForm.discount_type === 'percentage' ? '(%)' : '(€)'}
                </Label>
                <Input
                  type="number"
                  value={promoForm.discount_value}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, discount_value: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.subscriptions.applicableTiers")}</Label>
              <div className="flex gap-4">
                {['unverified', 'verified', 'signature'].map((tier) => (
                  <div key={tier} className="flex items-center gap-2">
                    <Checkbox
                      id={`tier-${tier}`}
                      checked={promoForm.applicable_tiers.includes(tier)}
                      onCheckedChange={(checked) => {
                        setPromoForm({
                          ...promoForm,
                          applicable_tiers: checked
                            ? [...promoForm.applicable_tiers, tier]
                            : promoForm.applicable_tiers.filter((t) => t !== tier),
                        });
                      }}
                    />
                    <Label htmlFor={`tier-${tier}`} className="capitalize cursor-pointer">
                      {tierLabels[tier] || tier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.subscriptions.applicableBilling")}</Label>
              <div className="flex gap-4">
                {['monthly', 'annual', 'period'].map((billing) => (
                  <div key={billing} className="flex items-center gap-2">
                    <Checkbox
                      id={`billing-${billing}`}
                      checked={promoForm.applicable_billing.includes(billing)}
                      onCheckedChange={(checked) => {
                        const currentBilling = new Set(promoForm.applicable_billing);
                        if (checked) {
                          currentBilling.add(billing);
                        } else {
                          currentBilling.delete(billing);
                        }
                        setPromoForm({
                          ...promoForm,
                          applicable_billing: [...currentBilling],
                        });
                      }}
                    />
                    <Label htmlFor={`billing-${billing}`} className="cursor-pointer">
                      {billingLabels[billing] || billing}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {promoForm.applicable_billing.includes('period') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("admin.subscriptions.periodLength", "Period Length")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={promoForm.period_length ?? ''}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        period_length: e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : null,
                      })
                    }
                    placeholder={t("admin.subscriptions.periodLengthPlaceholder", "e.g. 30")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.subscriptions.periodUnit", "Period Unit")}</Label>
                  <Select
                    value={promoForm.period_unit}
                    onValueChange={(value) =>
                      setPromoForm({
                        ...promoForm,
                        period_unit: value as 'days' | 'months',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">{periodUnitLabels.days}</SelectItem>
                      <SelectItem value="months">{periodUnitLabels.months}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(promoForm.start_date, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={promoForm.start_date}
                      onSelect={(date) => date && setPromoForm({ ...promoForm, start_date: date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.subscriptions.endDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(promoForm.end_date, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={promoForm.end_date}
                      onSelect={(date) => date && setPromoForm({ ...promoForm, end_date: date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.subscriptions.maxUsesLabel")}</Label>
              <Input
                type="number"
                value={promoForm.max_uses ?? ''}
                onChange={(e) =>
                  setPromoForm({
                    ...promoForm,
                    max_uses: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder={t("admin.subscriptions.unlimited")}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <Label>{t("admin.subscriptions.status.active")}</Label>
                <p className="text-sm text-muted-foreground">{t("admin.subscriptions.enableImmediately")}</p>
              </div>
              <Switch
                checked={promoForm.is_active}
                onCheckedChange={(checked) => setPromoForm({ ...promoForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSavePromo}
              disabled={
                createPromotion.isPending ||
                updatePromotion.isPending ||
                !promoForm.name ||
                !promoForm.code ||
                promoForm.discount_value <= 0 ||
                (promoForm.applicable_billing.includes('period') && (!promoForm.period_length || promoForm.period_length <= 0))
              }
            >
              {(createPromotion.isPending || updatePromotion.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingPromo ? t("admin.subscriptions.updatePromotion") : t("admin.subscriptions.createPromotion")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletePromoId}
        onOpenChange={() => setDeletePromoId(null)}
        title={t("admin.subscriptions.deletePromotion")}
        description={t("admin.subscriptions.deletePromotionDescription")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        onConfirm={handleDeletePromo}
      />
    </div>
  );
}
