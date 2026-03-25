import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDownUp,
  BadgeEuro,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  ReceiptText,
  Search,
  Send,
  UserCircle2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAdminChatThreads, useAdminSendMessage } from "@/hooks/useAdminChat";
import {
  type OwnerCrmSummary,
  type OwnerCrmSummarySort,
  type OwnerCrmSummaryStatusFilter,
  useAdminOwnerCrmDetail,
  useAdminOwnerCrmSummaries,
  useEnsureOwnerEmailContact,
} from "@/hooks/useAdminOwnerCRM";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

interface BillingInvoice {
  id: string;
  number: string | null;
  status: string | null;
  currency: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  created: number | null;
  due_date: number | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

interface BillingPayment {
  id: string;
  amount: number;
  currency: string | null;
  status: string | null;
  paid: boolean;
  created: number | null;
  receipt_url: string | null;
  description: string | null;
  invoice_id: string | null;
}

type OwnerSort = OwnerCrmSummarySort;
type OwnerStatusFilter = OwnerCrmSummaryStatusFilter;

function formatInvoiceAmount(value: number, currency: string | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
  }).format((value || 0) / 100);
}

function formatDate(value: string | null | undefined, dateFormat = "PPP") {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return format(parsed, dateFormat);
}

function formatUnix(value: number | null | undefined, dateFormat = "PPP") {
  if (!value) return "N/A";
  const parsed = new Date(value * 1000);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return format(parsed, dateFormat);
}

function getOwnerInitials(name: string | null, email: string) {
  if (name?.trim()) {
    const chunks = name.trim().split(/\s+/).slice(0, 2);
    const initials = chunks.map((chunk) => chunk.charAt(0).toUpperCase()).join("");
    if (initials) return initials;
  }

  return email.slice(0, 2).toUpperCase();
}

async function readFunctionError(error: unknown, fallback: string) {
  const err = error as { message?: string; context?: Response } | null;
  if (!err) return fallback;

  const context = err.context;
  if (context) {
    try {
      const payload = (await context.clone().json()) as { error?: string; message?: string };
      if (payload.error) return payload.error;
      if (payload.message) return payload.message;
    } catch {
      try {
        const text = await context.clone().text();
        if (text?.trim()) return text.trim();
      } catch {
        // no-op
      }
    }
  }

  return err.message || fallback;
}

function ownerNeedsAttention(owner: OwnerCrmSummary) {
  const normalized = (owner.subscriptionStatus || "").toLowerCase();
  return (
    owner.unreadAlertsCount > 0 ||
    normalized === "past_due" ||
    normalized === "canceled" ||
    normalized === "inactive"
  );
}

function getOwnerSubscriptionBadge(status: string | null) {
  const normalized = (status || "inactive").toLowerCase();

  if (normalized === "active") {
    return { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };
  }

  if (normalized === "trialing") {
    return { label: "Trial", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" };
  }

  if (normalized === "past_due") {
    return { label: "Past Due", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" };
  }

  if (normalized === "canceled") {
    return { label: "Canceled", className: "bg-destructive/15 text-destructive border-destructive/30" };
  }

  return { label: "Inactive", className: "bg-muted text-muted-foreground border-border" };
}

function getInvoiceStatusBadge(status: string | null, dueDate: number | null) {
  const normalized = (status || "unknown").toLowerCase();
  const isOverdue = normalized === "open" && !!dueDate && dueDate * 1000 < Date.now();

  if (normalized === "paid") {
    return { label: "paid", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };
  }

  if (isOverdue) {
    return { label: "overdue", className: "bg-destructive/15 text-destructive border-destructive/30" };
  }

  if (normalized === "open") {
    return { label: "open", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" };
  }

  if (normalized === "uncollectible") {
    return { label: "uncollectible", className: "bg-destructive/15 text-destructive border-destructive/30" };
  }

  return { label: normalized, className: "bg-muted text-muted-foreground border-border" };
}

function MetricTile({
  title,
  value,
  caption,
  icon,
  tone = "default",
  compact = false,
}: {
  title: string;
  value: string | number;
  caption?: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  compact?: boolean;
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "warning"
        ? "border-amber-500/30 bg-amber-500/5"
        : tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-muted/25";

  return (
    <div
      className={cn(
        "rounded-xl border transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-sm",
        compact ? "p-2.5" : "p-3.5",
        toneClasses,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/90">{title}</p>
          <p className={cn("mt-1.5 font-semibold leading-none", compact ? "text-xl" : "text-2xl")}>{value}</p>
          {caption && <p className="mt-1.5 text-[11px] text-muted-foreground">{caption}</p>}
        </div>
        <div className={cn("rounded-md border border-border/60 bg-background/60 text-muted-foreground", compact ? "p-1.5" : "p-2")}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminOwnerCRM() {
  const router = useRouter();
  const l = useLocalizedHref();
  const [search, setSearch] = useState("");
  const [ownerSort, setOwnerSort] = useState<OwnerSort>("activity");
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<OwnerStatusFilter>("all");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [threadIdToMessage, setThreadIdToMessage] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceDueDays, setInvoiceDueDays] = useState("7");
  const [ownerPage, setOwnerPage] = useState(1);
  const [ownerPageSize, setOwnerPageSize] = useState(100);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("admin-owner-crm-compact") === "1";
  });
  const ownerListRef = useRef<HTMLDivElement | null>(null);
  const [ownerListScrollTop, setOwnerListScrollTop] = useState(0);
  const [ownerListViewportHeight, setOwnerListViewportHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin-owner-crm-compact", compactMode ? "1" : "0");
  }, [compactMode]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setOwnerPage(1);
  }, [debouncedSearch, ownerSort, ownerStatusFilter, ownerPageSize]);

  const {
    data: ownerSummariesPage,
    isLoading: ownersLoading,
    isFetching: ownersFetching,
  } = useAdminOwnerCrmSummaries({
    page: ownerPage,
    pageSize: ownerPageSize,
    search: debouncedSearch,
    sort: ownerSort,
    statusFilter: ownerStatusFilter,
  });

  const ownerSummaries = useMemo(
    () => ownerSummariesPage?.rows ?? [],
    [ownerSummariesPage?.rows],
  );
  const ownerSummaryMetrics = useMemo(
    () =>
      ownerSummariesPage?.metrics ?? {
        totalOwners: 0,
        totalListings: 0,
        subscribedOwners: 0,
        attentionOwners: 0,
        ownersWithMessages: 0,
      },
    [ownerSummariesPage?.metrics],
  );
  const ownerTotalCount = ownerSummariesPage?.totalCount || 0;
  const ownerTotalPages = Math.max(ownerSummariesPage?.totalPages || 1, 1);

  useEffect(() => {
    if (ownerPage > ownerTotalPages) {
      setOwnerPage(ownerTotalPages);
    }
  }, [ownerPage, ownerTotalPages]);

  useEffect(() => {
    if (ownerSummaries.length === 0) {
      setSelectedOwnerId(null);
      return;
    }

    const selectedStillExists = ownerSummaries.some((owner) => owner.ownerId === selectedOwnerId);
    if (!selectedStillExists) {
      setSelectedOwnerId(ownerSummaries[0].ownerId);
    }
  }, [ownerSummaries, selectedOwnerId]);

  const selectedOwnerSummary = useMemo(
    () => ownerSummaries.find((owner) => owner.ownerId === selectedOwnerId) || null,
    [ownerSummaries, selectedOwnerId],
  );

  const { data: ownerDetail, isLoading: detailLoading } = useAdminOwnerCrmDetail(selectedOwnerId);

  const { data: ownerThreads = [], isLoading: threadsLoading } = useAdminChatThreads({
    ownerId: selectedOwnerId || undefined,
  });

  useEffect(() => {
    if (ownerThreads.length === 0) {
      setThreadIdToMessage("");
      return;
    }

    const threadExists = ownerThreads.some((thread) => thread.id === threadIdToMessage);
    if (!threadExists) {
      const activeThread = ownerThreads.find((thread) => thread.status === "active");
      setThreadIdToMessage(activeThread?.id || ownerThreads[0].id);
    }
  }, [ownerThreads, threadIdToMessage]);

  const selectedThread = ownerThreads.find((thread) => thread.id === threadIdToMessage) || null;

  const sendMessage = useAdminSendMessage();
  const ensureEmailContact = useEnsureOwnerEmailContact();

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["admin-owner-crm-invoices", selectedOwnerId],
    enabled: !!selectedOwnerId,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-owner-billing", {
        body: {
          action: "list_invoices",
          owner_id: selectedOwnerId,
          limit: 30,
        },
      });

      if (error) {
        throw new Error(await readFunctionError(error, "Failed to load billing history"));
      }

      if (data?.error) {
        throw new Error(data.error as string);
      }

      return (data?.invoices || []) as BillingInvoice[];
    },
  });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments,
    error: paymentsError,
  } = useQuery({
    queryKey: ["admin-owner-crm-payments", selectedOwnerId],
    enabled: !!selectedOwnerId,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-owner-billing", {
        body: {
          action: "list_payments",
          owner_id: selectedOwnerId,
          limit: 30,
        },
      });

      if (error) {
        throw new Error(await readFunctionError(error, "Failed to load payment history"));
      }

      if (data?.error) {
        throw new Error(data.error as string);
      }

      return (data?.payments || []) as BillingPayment[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async () => {
      if (!selectedOwnerId) throw new Error("Select an owner first");
      const amount = Number(invoiceAmount);
      const dueInDays = Number(invoiceDueDays);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter a valid invoice amount in EUR");
      }

      if (!invoiceDescription.trim()) {
        throw new Error("Invoice description is required");
      }

      if (!Number.isFinite(dueInDays) || dueInDays < 1 || dueInDays > 30) {
        throw new Error("Due days must be between 1 and 30");
      }

      const { data, error } = await supabase.functions.invoke("admin-owner-billing", {
        body: {
          action: "create_invoice",
          owner_id: selectedOwnerId,
          amount_eur: amount,
          description: invoiceDescription.trim(),
          due_in_days: dueInDays,
        },
      });

      if (error) {
        throw new Error(await readFunctionError(error, "Failed to create invoice"));
      }

      if (data?.error) {
        throw new Error(data.error as string);
      }

      return data as { invoice?: BillingInvoice };
    },
    onSuccess: async (result) => {
      toast.success("Invoice created and sent");
      setInvoiceAmount("");
      setInvoiceDescription("");
      await Promise.all([refetchInvoices(), refetchPayments()]);

      const invoiceUrl = result?.invoice?.hosted_invoice_url;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank");
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create invoice";
      toast.error(message);
    },
  });

  const handleSendMessage = () => {
    if (!threadIdToMessage || !messageBody.trim()) return;

    sendMessage.mutate(
      { threadId: threadIdToMessage, messageText: messageBody.trim() },
      {
        onSuccess: () => {
          setMessageBody("");
          toast.success("Message sent to owner thread");
        },
      },
    );
  };

  const handleEnsureEmailContact = async () => {
    if (!ownerDetail?.profile) return;

    await ensureEmailContact.mutateAsync({
      ownerId: ownerDetail.profile.id,
      email: ownerDetail.profile.email,
      fullName: ownerDetail.profile.full_name,
    });

    toast.success("Owner added to email contacts");
  };

  const totalListingsAcrossOwners = ownerSummaryMetrics.totalListings;
  const subscribedOwnersCount = ownerSummaryMetrics.subscribedOwners;
  const attentionOwnersCount = ownerSummaryMetrics.attentionOwners;
  const ownersWithMessagesCount = ownerSummaryMetrics.ownersWithMessages;

  const overdueInvoices = invoices.filter((invoice) => {
    const overdueOpen = invoice.status === "open" && !!invoice.due_date && invoice.due_date * 1000 < Date.now();
    return overdueOpen || invoice.status === "uncollectible";
  }).length;
  const openInvoices = invoices.filter((invoice) => invoice.status === "open").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length;
  const paidAmountCents = payments.filter((payment) => payment.paid).reduce((total, payment) => total + payment.amount, 0);
  const openAmountCents = invoices
    .filter((invoice) => invoice.status === "open")
    .reduce((total, invoice) => total + invoice.amount_remaining, 0);

  const profileCompletionChecks = ownerDetail
    ? [
        !!ownerDetail.profile.full_name,
        !!ownerDetail.profile.phone,
        !!ownerDetail.emailContact,
        !!ownerDetail.subscription?.stripe_customer_id,
        ownerDetail.listings.length > 0,
      ]
    : [];
  const profileCompletionPct = profileCompletionChecks.length
    ? Math.round((profileCompletionChecks.filter(Boolean).length / profileCompletionChecks.length) * 100)
    : 0;

  const ownerPrimaryListing = ownerDetail?.listings[0] || null;
  const ownerSubscriptionBadge = selectedOwnerSummary
    ? getOwnerSubscriptionBadge(selectedOwnerSummary.subscriptionStatus)
    : getOwnerSubscriptionBadge(null);

  const isMainLoading = ownersLoading || (selectedOwnerId ? detailLoading : false);
  const metaLabelClass = "text-[10px] uppercase tracking-[0.08em] text-muted-foreground";
  const ownerPageStart = ownerTotalCount > 0 ? Math.min((ownerPage - 1) * ownerPageSize + 1, ownerTotalCount) : 0;
  const ownerPageEnd = Math.min(ownerPage * ownerPageSize, ownerTotalCount);
  const ownerRowHeight = compactMode ? 126 : 138;
  const ownerOverscan = 4;

  useEffect(() => {
    const el = ownerListRef.current;
    if (!el) return;

    const syncViewport = () => setOwnerListViewportHeight(el.clientHeight);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, [ownerSummaries.length, compactMode]);

  useEffect(() => {
    setOwnerListScrollTop(0);
    if (ownerListRef.current) {
      ownerListRef.current.scrollTop = 0;
    }
  }, [ownerPage, compactMode]);

  const ownerVisibleCount = Math.max(
    1,
    Math.ceil((ownerListViewportHeight || 640) / ownerRowHeight) + ownerOverscan * 2,
  );
  const ownerStartIndex = Math.max(0, Math.floor(ownerListScrollTop / ownerRowHeight) - ownerOverscan);
  const ownerEndIndex = Math.min(ownerSummaries.length, ownerStartIndex + ownerVisibleCount);
  const ownerVisibleRows = ownerSummaries.slice(ownerStartIndex, ownerEndIndex);
  const ownerVirtualPaddingTop = ownerStartIndex * ownerRowHeight;
  const ownerVirtualPaddingBottom = Math.max(0, (ownerSummaries.length - ownerEndIndex) * ownerRowHeight);

  return (
    <div className={cn("space-y-6", compactMode && "space-y-4")}>
      <Card className="overflow-hidden border-border/80">
        <div
          className={cn(
            "border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
            compactMode ? "px-4 py-4" : "px-5 py-5",
          )}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className={cn("font-serif font-semibold text-foreground", compactMode ? "text-2xl lg:text-3xl" : "text-3xl lg:text-4xl")}>
                Owner CRM
              </h1>
              <p className={cn("text-muted-foreground mt-1 max-w-3xl", compactMode && "text-sm")}>
                Manage listing owners across communication, subscriptions, invoices, and listing performance.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size={compactMode ? "sm" : "default"}
                onClick={() => setCompactMode((prev) => !prev)}
                className={cn(
                  "transition-colors",
                  compactMode && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                Compact {compactMode ? "On" : "Off"}
              </Button>
              <Button variant="outline" size={compactMode ? "sm" : "default"} onClick={() => router.push(l("/admin/messages"))}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Center
              </Button>
              <Button variant="outline" size={compactMode ? "sm" : "default"} onClick={() => router.push(l("/admin/subscriptions"))}>
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription Settings
              </Button>
              <Button size={compactMode ? "sm" : "default"} onClick={() => router.push(l("/admin/users"))}>
                <Users className="h-4 w-4 mr-2" />
                Manage Roles
              </Button>
            </div>
          </div>
        </div>
        <CardContent className={cn(compactMode ? "pt-4" : "pt-5")}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              title="Owners"
              value={ownerSummaryMetrics.totalOwners}
              caption={`${ownersWithMessagesCount} with conversations`}
              icon={<Users className="h-5 w-5" />}
              compact={compactMode}
            />
            <MetricTile
              title="Subscribed Owners"
              value={subscribedOwnersCount}
              caption={`${Math.max(ownerSummaryMetrics.totalOwners - subscribedOwnersCount, 0)} inactive`}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="success"
              compact={compactMode}
            />
            <MetricTile
              title="Needs Attention"
              value={attentionOwnersCount}
              caption="Billing issues or unread alerts"
              icon={<AlertCircle className="h-5 w-5" />}
              tone={attentionOwnersCount > 0 ? "warning" : "default"}
              compact={compactMode}
            />
            <MetricTile
              title="Listings Managed"
              value={totalListingsAcrossOwners}
              caption="Across all owners"
              icon={<Building2 className="h-5 w-5" />}
              compact={compactMode}
            />
          </div>
        </CardContent>
      </Card>

      <div className={cn("grid xl:grid-cols-[360px,1fr]", compactMode ? "gap-4" : "gap-6")}>
        <Card className={cn("h-fit xl:sticky", compactMode ? "xl:top-4" : "xl:top-6")}>
          <CardHeader className={cn(compactMode ? "pb-2" : "pb-3")}>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Owners
            </CardTitle>
            <CardDescription>
              {ownerPageStart}-{ownerPageEnd} of {ownerTotalCount} owners
            </CardDescription>

            <div className={cn("relative", compactMode ? "mt-1.5" : "mt-2")}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by owner name or email..."
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={ownerStatusFilter} onValueChange={(value) => setOwnerStatusFilter(value as OwnerStatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All owners</SelectItem>
                  <SelectItem value="subscribed">Subscribed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="attention">Needs attention</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ownerSort} onValueChange={(value) => setOwnerSort(value as OwnerSort)}>
                <SelectTrigger>
                  <ArrowDownUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Recent activity</SelectItem>
                  <SelectItem value="listings">Most listings</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {ownersLoading ? (
              <div className={cn("flex items-center justify-center", compactMode ? "py-8" : "py-10")}>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ownerSummaries.length === 0 ? (
              <div className={cn("rounded-lg border border-dashed text-center", compactMode ? "p-5" : "p-6")}>
                <p className="text-sm text-muted-foreground">No owners match the current filters.</p>
              </div>
            ) : (
              <>
                <div
                  ref={ownerListRef}
                  className="h-[68vh] overflow-auto pr-2"
                  onScroll={(event) => setOwnerListScrollTop(event.currentTarget.scrollTop)}
                >
                  <div style={{ paddingTop: ownerVirtualPaddingTop, paddingBottom: ownerVirtualPaddingBottom }} className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                    {ownerVisibleRows.map((owner) => {
                    const isSelected = owner.ownerId === selectedOwnerId;
                    const subBadge = getOwnerSubscriptionBadge(owner.subscriptionStatus);
                    const needsAttention = ownerNeedsAttention(owner);

                    return (
                      <button
                        key={owner.ownerId}
                        type="button"
                        onClick={() => setSelectedOwnerId(owner.ownerId)}
                        className={cn(
                          "group w-full rounded-xl border text-left transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                          compactMode ? "p-2.5" : "p-3.5",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                            : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
                        )}
                        style={{ minHeight: ownerRowHeight - 8 }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className={cn("border", compactMode ? "h-9 w-9" : "h-10 w-10")}>
                            <AvatarFallback className={cn("text-sm font-medium", isSelected ? "bg-primary/20 text-primary" : "bg-muted")}>
                              {getOwnerInitials(owner.fullName, owner.email)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className={cn("font-medium truncate", compactMode && "text-sm")}>{owner.fullName || "Unnamed owner"}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{owner.email}</p>
                              </div>
                              {owner.unreadAlertsCount > 0 && (
                                <Badge variant="destructive" className="text-[10px] shrink-0">
                                  {owner.unreadAlertsCount}
                                </Badge>
                              )}
                            </div>

                            <div className={cn("flex items-center gap-2 flex-wrap", compactMode ? "mt-1.5" : "mt-2")}>
                              <Badge variant="outline">{owner.listingCount} listings</Badge>
                              <Badge variant="outline">{owner.activeThreadCount} active chats</Badge>
                              {owner.subscriptionTier && (
                                <Badge variant="secondary" className="capitalize">
                                  {owner.subscriptionTier}
                                </Badge>
                              )}
                            </div>

                            <div className={cn("flex items-center justify-between gap-2", compactMode ? "mt-1.5" : "mt-2")}>
                              <Badge variant="outline" className={cn("capitalize", subBadge.className)}>
                                {subBadge.label}
                              </Badge>
                              <span className={cn("text-[11px]", needsAttention ? "text-amber-600" : "text-muted-foreground")}>
                                {owner.lastMessageAt ? `Last: ${formatDate(owner.lastMessageAt, "MMM d")}` : "No recent messages"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>Page {ownerPage} of {ownerTotalPages}</span>
                    {ownersFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={String(ownerPageSize)} onValueChange={(value) => setOwnerPageSize(Number(value))}>
                      <SelectTrigger className="w-[88px] h-8">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ownerPage <= 1 || ownersFetching}
                      onClick={() => setOwnerPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ownerPage >= ownerTotalPages || ownersFetching}
                      onClick={() => setOwnerPage((prev) => Math.min(ownerTotalPages, prev + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {isMainLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[420px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : !selectedOwnerId || !ownerDetail || !selectedOwnerSummary ? (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[420px]">
              <p className="text-muted-foreground">Select an owner to view CRM details.</p>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(compactMode ? "space-y-4" : "space-y-6")}>
            <Card className="overflow-hidden">
              <div
                className={cn(
                  "border-b bg-gradient-to-r from-primary/15 via-primary/5 to-transparent",
                  compactMode ? "px-4 py-4" : "px-5 py-5",
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className={cn("border", compactMode ? "h-10 w-10" : "h-12 w-12")}>
                      <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
                        {getOwnerInitials(ownerDetail.profile.full_name, ownerDetail.profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className={cn("font-semibold truncate", compactMode ? "text-lg" : "text-xl")}>
                        {ownerDetail.profile.full_name || "Unnamed owner"}
                      </h2>
                      <p className={cn("text-muted-foreground truncate", compactMode ? "text-xs" : "text-sm")}>
                        {ownerDetail.profile.email}
                      </p>
                      <div className={cn("flex items-center gap-2 flex-wrap", compactMode ? "mt-1.5" : "mt-2")}>
                        <Badge variant="outline" className={cn("capitalize", ownerSubscriptionBadge.className)}>
                          {ownerSubscriptionBadge.label}
                        </Badge>
                        <Badge variant="outline">{selectedOwnerSummary.listingCount} listings</Badge>
                        <Badge variant="outline">{selectedOwnerSummary.totalThreadCount} conversations</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button size={compactMode ? "sm" : "default"} onClick={() => router.push(`${l("/admin/messages")}?ownerId=${ownerDetail.profile.id}`)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Messages
                    </Button>
                    <Button variant="outline" size={compactMode ? "sm" : "default"} onClick={() => router.push(l("/admin/email/contacts"))}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Contacts
                    </Button>
                    {ownerPrimaryListing && (
                      <Button variant="outline" size={compactMode ? "sm" : "default"} asChild>
                        <Link href={l(`/admin/listings/${ownerPrimaryListing.id}/edit`)}>
                          Edit Latest Listing
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className={cn(compactMode ? "pt-4" : "pt-5")}>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile
                    title="Listings"
                    value={selectedOwnerSummary.listingCount}
                    caption={`${selectedOwnerSummary.publishedListingCount} published`}
                    icon={<Building2 className="h-5 w-5" />}
                    compact={compactMode}
                  />
                  <MetricTile
                    title="Conversations"
                    value={selectedOwnerSummary.totalThreadCount}
                    caption={`${selectedOwnerSummary.activeThreadCount} active now`}
                    icon={<MessageSquare className="h-5 w-5" />}
                    compact={compactMode}
                  />
                  <MetricTile
                    title="Outstanding"
                    value={formatInvoiceAmount(openAmountCents, "EUR")}
                    caption={`${openInvoices} open invoices`}
                    icon={<BadgeEuro className="h-5 w-5" />}
                    tone={openInvoices > 0 ? "warning" : "default"}
                    compact={compactMode}
                  />
                  <MetricTile
                    title="Collected"
                    value={formatInvoiceAmount(paidAmountCents, "EUR")}
                    caption={`${paidInvoices} paid invoices`}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    tone="success"
                    compact={compactMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className={cn("space-y-4", compactMode && "space-y-3")}>
              <TabsList className={cn("grid w-full grid-cols-3 rounded-xl bg-muted/60 p-1", compactMode ? "h-10" : "h-11")}>
                <TabsTrigger value="overview" className="gap-2 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <UserCircle2 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="communication" className="gap-2 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <MessageSquare className="h-4 w-4" />
                  Communication
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className={cn("space-y-4", compactMode && "space-y-3")}>
                <div className={cn("grid xl:grid-cols-2", compactMode ? "gap-3" : "gap-4")}>
                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCircle2 className="h-5 w-5" />
                        Owner Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className={metaLabelClass}>Name</p>
                        <p className="font-medium">{ownerDetail.profile.full_name || "Not set"}</p>
                      </div>
                      <div>
                        <p className={metaLabelClass}>Email</p>
                        <p className="font-medium break-all">{ownerDetail.profile.email}</p>
                      </div>
                      <div>
                        <p className={metaLabelClass}>Phone</p>
                        <p className="font-medium">{ownerDetail.profile.phone || "Not set"}</p>
                      </div>
                      <div>
                        <p className={metaLabelClass}>Joined</p>
                        <p className="font-medium">{formatDate(ownerDetail.profile.created_at)}</p>
                      </div>
                      <div>
                        <p className={metaLabelClass}>Last Profile Update</p>
                        <p className="font-medium">{formatDate(ownerDetail.profile.updated_at, "PPP p")}</p>
                      </div>
                      <div>
                        <p className={metaLabelClass}>Last Message Activity</p>
                        <p className="font-medium">
                          {selectedOwnerSummary.lastMessageAt
                            ? formatDate(selectedOwnerSummary.lastMessageAt, "PPP p")
                            : "No messages yet"}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className={cn(metaLabelClass, "mb-1")}>Roles</p>
                        <div className="flex gap-2 flex-wrap">
                          {ownerDetail.roles.length > 0 ? (
                            ownerDetail.roles.map((role) => (
                              <Badge key={role} variant="outline" className="capitalize">
                                {role.replace("_", " ")}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No explicit role records</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg">Account Health</CardTitle>
                      <CardDescription>
                        Operational readiness for support, communication, and billing.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={cn(compactMode ? "space-y-3.5" : "space-y-4")}>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className={cn(metaLabelClass, "text-[11px]")}>Profile completeness</span>
                          <span className="font-medium">{profileCompletionPct}%</span>
                        </div>
                        <Progress value={profileCompletionPct} className="h-2" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Phone number configured</span>
                          {ownerDetail.profile.phone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Email contact linked</span>
                          {ownerDetail.emailContact ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Stripe customer linked</span>
                          {ownerDetail.subscription?.stripe_customer_id ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Active listing ownership</span>
                          {ownerDetail.listings.length > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>

                      {ownerDetail.notifications.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className={cn(metaLabelClass, "mb-2")}>Recent owner alerts</p>
                            <div className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                              {ownerDetail.notifications.slice(0, 3).map((notification) => (
                                <div
                                  key={notification.id}
                                  className="rounded-md border p-2 text-xs transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-sm"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium capitalize">{notification.type.replace(/_/g, " ")}</span>
                                    <span className="text-muted-foreground">{formatDate(notification.created_at, "MMM d")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Listings
                      </CardTitle>
                      <CardDescription>
                        {ownerDetail.listings.length} listings assigned to this owner
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(l("/admin/listings"))}>
                      View All Listings
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {ownerDetail.listings.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">No listings assigned to this owner.</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[420px] pr-3">
                        <div className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                          {ownerDetail.listings.map((listing) => (
                            <div
                              key={listing.id}
                              className={cn(
                                "rounded-lg border flex items-start justify-between gap-3 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
                                compactMode ? "p-2.5" : "p-3",
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{listing.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(listing.city as { name?: string } | null)?.name || "Unknown city"} •{" "}
                                  {(listing.category as { name?: string } | null)?.name || "Unknown category"}
                                </p>
                                <div className="flex gap-2 mt-2 flex-wrap items-center">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "capitalize",
                                      listing.status === "published" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                      listing.status === "pending_review" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                                      listing.status === "rejected" && "bg-destructive/10 text-destructive border-destructive/30",
                                    )}
                                  >
                                    {listing.status.replace("_", " ")}
                                  </Badge>
                                  <Badge variant="secondary" className="capitalize">
                                    {listing.tier}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Updated {formatDate(listing.updated_at, "MMM d")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/listing/${listing.slug}`} target="_blank">
                                    Public
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Link>
                                </Button>
                                <Button asChild size="sm">
                                  <Link href={l(`/admin/listings/${listing.id}/edit`)}>Edit</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication" className={cn("space-y-4", compactMode && "space-y-3")}>
                <div className={cn("grid xl:grid-cols-[1.1fr,1fr]", compactMode ? "gap-3" : "gap-4")}>
                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg">Communication Actions</CardTitle>
                      <CardDescription>
                        Keep owner communication synchronized across chat and email channels.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2">
                      <Button
                        size={compactMode ? "sm" : "default"}
                        onClick={() => router.push(`${l("/admin/messages")}?ownerId=${ownerDetail.profile.id}`)}
                        className="justify-start"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open Message Center
                      </Button>
                      <Button
                        variant="outline"
                        size={compactMode ? "sm" : "default"}
                        onClick={() => window.open(`mailto:${ownerDetail.profile.email}`, "_blank")}
                        className="justify-start"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Compose Direct Email
                      </Button>
                      <Button
                        variant="outline"
                        size={compactMode ? "sm" : "default"}
                        onClick={handleEnsureEmailContact}
                        disabled={ensureEmailContact.isPending}
                        className="justify-start"
                      >
                        {ensureEmailContact.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Ensure Email Contact
                      </Button>
                      <Button
                        variant="outline"
                        size={compactMode ? "sm" : "default"}
                        onClick={() => router.push(l("/admin/email/contacts"))}
                        className="justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Open Email Contacts
                      </Button>
                      <div className="sm:col-span-2 rounded-md border p-3 text-sm">
                        <p className="font-medium">Email contact status</p>
                        <p className="text-muted-foreground mt-1">
                          {ownerDetail.emailContact
                            ? `Connected (${ownerDetail.emailContact.status})`
                            : "Not connected. Click “Ensure Email Contact” to link this owner."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg">Quick Message Reply</CardTitle>
                      <CardDescription>
                        Send a direct admin reply into the owner's conversation thread.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {threadsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : ownerThreads.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                          <p className="text-sm text-muted-foreground">This owner has no message threads yet.</p>
                        </div>
                      ) : (
                        <>
                          <Select value={threadIdToMessage} onValueChange={setThreadIdToMessage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a thread" />
                            </SelectTrigger>
                            <SelectContent>
                              {ownerThreads.map((thread) => (
                                <SelectItem key={thread.id} value={thread.id}>
                                  {(thread.listing?.name || "General inquiry")} • {thread.status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedThread && (
                            <div className="rounded-md border p-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{selectedThread.listing?.name || "General inquiry"}</span>
                              <span> • Last activity {selectedThread.last_message_at ? formatDate(selectedThread.last_message_at, "PPP p") : "N/A"}</span>
                            </div>
                          )}

                          <Textarea
                            rows={5}
                            placeholder="Type your message to the owner..."
                            value={messageBody}
                            onChange={(event) => setMessageBody(event.target.value)}
                          />

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              {messageBody.trim().length} characters
                            </span>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!threadIdToMessage || !messageBody.trim() || sendMessage.isPending}
                            >
                              {sendMessage.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Send Message
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Conversations</CardTitle>
                      <CardDescription>
                        Most recent owner threads with direct moderation access.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`${l("/admin/messages")}?ownerId=${ownerDetail.profile.id}`)}>
                      Open All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {ownerThreads.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No conversations to display.</p>
                    ) : (
                      <div className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                        {ownerThreads.slice(0, 10).map((thread) => (
                          <div
                            key={thread.id}
                            className={cn(
                              "border rounded-lg flex items-center justify-between gap-3 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-sm",
                              compactMode ? "p-2.5" : "p-3",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">{thread.listing?.name || "General inquiry"}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Viewer: {thread.viewer?.full_name || thread.contact_name || "Guest"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last activity: {thread.last_message_at ? formatDate(thread.last_message_at, "PPP p") : "No messages"}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0 items-center">
                              <Badge variant="outline" className="capitalize">
                                {thread.status}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => router.push(`${l("/admin/messages")}?ownerId=${ownerDetail.profile.id}`)}>
                                Open
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className={cn("space-y-4", compactMode && "space-y-3")}>
                <div className={cn("grid xl:grid-cols-2", compactMode ? "gap-3" : "gap-4")}>
                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ownerDetail.subscription ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("capitalize", ownerSubscriptionBadge.className)}>
                              {ownerSubscriptionBadge.label}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {ownerDetail.subscription.tier}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {ownerDetail.subscription.billing_period}
                            </Badge>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className={metaLabelClass}>Current Period End</p>
                              <p className="font-medium">
                                {ownerDetail.subscription.current_period_end
                                  ? formatDate(ownerDetail.subscription.current_period_end)
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className={metaLabelClass}>Subscription Updated</p>
                              <p className="font-medium">{formatDate(ownerDetail.subscription.updated_at, "PPP p")}</p>
                            </div>
                          </div>
                          <div>
                            <p className={metaLabelClass}>Stripe Customer</p>
                            <p className="font-mono text-xs break-all mt-1">
                              {ownerDetail.subscription.stripe_customer_id || "No Stripe customer linked"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                          <p className="text-sm text-muted-foreground">No subscription record found for this owner.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(compactMode && "pb-4")}>
                      <CardTitle className="text-lg">Financial Snapshot</CardTitle>
                      <CardDescription>
                        Invoice and payment health for this owner.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      <MetricTile
                        title="Paid Invoices"
                        value={paidInvoices}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        tone="success"
                        compact={compactMode}
                      />
                      <MetricTile
                        title="Open Invoices"
                        value={openInvoices}
                        icon={<ReceiptText className="h-5 w-5" />}
                        tone={openInvoices > 0 ? "warning" : "default"}
                        compact={compactMode}
                      />
                      <MetricTile
                        title="Overdue / Risk"
                        value={overdueInvoices}
                        icon={<AlertCircle className="h-5 w-5" />}
                        tone={overdueInvoices > 0 ? "danger" : "default"}
                        compact={compactMode}
                      />
                      <MetricTile
                        title="Total Collected"
                        value={formatInvoiceAmount(paidAmountCents, "EUR")}
                        icon={<BadgeEuro className="h-5 w-5" />}
                        tone="success"
                        compact={compactMode}
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className={cn(compactMode && "pb-4")}>
                    <CardTitle className="text-lg">Create and Send Invoice</CardTitle>
                    <CardDescription>
                      Create a Stripe invoice item, finalize invoice, and email it to the owner.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className={metaLabelClass}>Amount (EUR)</p>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={invoiceAmount}
                          onChange={(event) => setInvoiceAmount(event.target.value)}
                          placeholder="250.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className={metaLabelClass}>Due in (days)</p>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          step="1"
                          value={invoiceDueDays}
                          onChange={(event) => setInvoiceDueDays(event.target.value)}
                          placeholder="7"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className={metaLabelClass}>Owner</p>
                        <Input value={ownerDetail.profile.email} disabled />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className={metaLabelClass}>Description</p>
                      <Textarea
                        rows={3}
                        value={invoiceDescription}
                        onChange={(event) => setInvoiceDescription(event.target.value)}
                        placeholder="Example: Signature listing placement and concierge support"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {!ownerDetail.subscription?.stripe_customer_id ? (
                        <p className="text-sm text-muted-foreground">
                          Invoice sending requires a Stripe customer linked to this owner.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          This invoice will be sent immediately after creation.
                        </p>
                      )}

                      <Button
                        onClick={() => createInvoice.mutate()}
                        disabled={createInvoice.isPending || !ownerDetail.subscription?.stripe_customer_id}
                      >
                        {createInvoice.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Invoices</CardTitle>
                      <CardDescription>
                        Stripe invoice history for this owner.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => refetchInvoices()}
                      disabled={invoicesLoading}
                    >
                      {invoicesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {invoicesError ? (
                      <p className="text-sm text-destructive">{(invoicesError as Error).message}</p>
                    ) : invoicesLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : invoices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No invoices found for this owner.</p>
                    ) : (
                      <ScrollArea className="h-[360px] pr-3">
                        <div className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                          {invoices.map((invoice) => {
                            const statusBadge = getInvoiceStatusBadge(invoice.status, invoice.due_date);
                            return (
                              <div
                                key={invoice.id}
                                className={cn(
                                  "border rounded-lg transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-sm",
                                  compactMode ? "p-2.5" : "p-3",
                                )}
                              >
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div>
                                    <p className="font-medium">{invoice.number || invoice.id}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Created {formatUnix(invoice.created, "PPP")}
                                      {invoice.due_date ? ` • Due ${formatUnix(invoice.due_date, "PPP")}` : ""}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("capitalize", statusBadge.className)}>
                                      {statusBadge.label}
                                    </Badge>
                                    {invoice.hosted_invoice_url && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(invoice.hosted_invoice_url!, "_blank")}
                                      >
                                        Open
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </Button>
                                    )}
                                    {invoice.invoice_pdf && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(invoice.invoice_pdf!, "_blank")}
                                      >
                                        PDF
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                                  <div>
                                    <p className={metaLabelClass}>Amount Due</p>
                                    <p className="font-medium">{formatInvoiceAmount(invoice.amount_due, invoice.currency)}</p>
                                  </div>
                                  <div>
                                    <p className={metaLabelClass}>Amount Paid</p>
                                    <p className="font-medium">{formatInvoiceAmount(invoice.amount_paid, invoice.currency)}</p>
                                  </div>
                                  <div>
                                    <p className={metaLabelClass}>Remaining</p>
                                    <p className="font-medium">{formatInvoiceAmount(invoice.amount_remaining, invoice.currency)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Payments</CardTitle>
                      <CardDescription>
                        Charge history and payment receipts for this owner.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => refetchPayments()}
                      disabled={paymentsLoading}
                    >
                      {paymentsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {paymentsError ? (
                      <p className="text-sm text-destructive">{(paymentsError as Error).message}</p>
                    ) : paymentsLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No payments found for this owner.</p>
                    ) : (
                      <ScrollArea className="h-[320px] pr-3">
                        <div className={cn(compactMode ? "space-y-1.5" : "space-y-2")}>
                          {payments.map((payment) => (
                            <div
                              key={payment.id}
                              className={cn(
                                "border rounded-lg flex items-start justify-between gap-3 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-sm",
                                compactMode ? "p-2.5" : "p-3",
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium">{payment.description || payment.id}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatUnix(payment.created, "PPP p")}
                                  {payment.invoice_id ? ` • Invoice ${payment.invoice_id}` : ""}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "capitalize",
                                      payment.paid
                                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                        : "bg-amber-500/15 text-amber-600 border-amber-500/30",
                                    )}
                                  >
                                    {payment.paid ? "paid" : payment.status || "pending"}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {formatInvoiceAmount(payment.amount, payment.currency)}
                                  </span>
                                </div>
                              </div>
                              {payment.receipt_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(payment.receipt_url!, "_blank")}
                                >
                                  Receipt
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
